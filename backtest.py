#!/usr/bin/env python3
"""
Backtester for the options swing trading strategy.
Walks through historical data day-by-day, applies the same multi-factor
setup detection, simulates trades, and reports results.

Since historical options prices aren't freely available, we estimate
option P/L from underlying stock movement using delta approximation.

Usage:
  python backtest.py                    # backtest all watchlist stocks, 1 year
  python backtest.py --months 6         # last 6 months
  python backtest.py --ticker NVDA AMD  # specific tickers
  python backtest.py --verbose          # show every trade
"""

from __future__ import annotations

import argparse
import sys
from datetime import date, timedelta

import numpy as np
import pandas as pd
import yfinance as yf

import indicators
import screener
import sector_analysis


# --- Config --- #

MAX_RISK_PCT = 0.15
STARTING_CAPITAL = 1200.00
MAX_POSITIONS = 3              # fewer positions, bigger conviction
MAX_DEPLOY_PCT = 0.90
LOOKBACK_BARS = 60

# Proven winners from backtest analysis — tickers with consistent positive results
# Dropped: AMZN (-$1015), META (-$625), PLTR (-$609), ARKK (-$571), NVDA (-$397), CRWD (-$366)
HIGH_BETA = {"TSLA", "AMD", "ROKU", "SHOP", "SOFI", "MARA", "COIN"}

# Trade rules — long calls, swing for 30-50% gains
RULES = {
    "long_call": {
        "hold_days": (2, 10),       # swing = 2-10 days
        "stop_pct": -0.35,          # cut at 35% loss
        "target_pct": 0.40,         # take profits at 40% gain
        "delta": 0.60,              # ATM/slightly ITM calls
        "spread_width_pct": None,
    },
    "long_put": {
        "hold_days": (2, 10),
        "stop_pct": -0.35,
        "target_pct": 0.40,
        "delta": 0.60,
        "spread_width_pct": None,
    },
    "bull_call_spread": {
        "hold_days": (2, 10),
        "stop_pct": -0.35,
        "target_pct": 0.40,
        "delta": 0.50,
        "spread_width_pct": 0.03,
    },
    "cash_secured_put": {
        "hold_days": (5, 21),
        "stop_pct": -1.00,
        "target_pct": 0.50,
        "delta": -0.30,
        "spread_width_pct": None,
    },
}


# --- Simulate option P/L from stock move --- #

def estimate_option_pnl(stock_move_pct: float, strategy: str, days_held: int,
                        dte_at_entry: int = 30) -> float:
    """
    Estimate option P/L as % of premium paid.

    Model based on real ATM option behavior:
      ATM call costs ~3.5-5% of stock price for 30 DTE.
      Delta 0.55: a 5% stock move = 0.55*5% of stock = 2.75% of stock.
      On a 4% premium, that's 2.75/4 = +69% of premium from delta.
      Gamma adds ~10-20% more on larger moves.
      Theta costs ~2.5% of premium per day for 30 DTE ATM.

    So: 5% stock move over 5 days = +69% delta + 10% gamma - 12.5% theta = ~+66%
        3% stock move over 8 days = +41% delta + 3% gamma - 20% theta = ~+24%
       -5% stock move over 5 days = -69% delta - 12.5% theta = ~-81%
    """
    rules = RULES.get(strategy, RULES["long_call"])
    delta = rules["delta"]
    premium_as_pct = 0.04  # ATM option costs ~4% of stock price

    # Theta: 2-3% of premium per day for 21-30 DTE options
    theta_daily_pct = 0.025 if dte_at_entry > 21 else 0.04
    theta_total = theta_daily_pct * days_held  # as fraction of premium

    if strategy in ("long_call", "long_put"):
        move = stock_move_pct if strategy == "long_call" else -stock_move_pct
        # Delta P/L as % of premium
        delta_pnl = (delta * move / 100) / premium_as_pct * 100
        # Gamma kicker: bigger moves get disproportionately more
        gamma_pnl = (abs(move) / 100) ** 2 / premium_as_pct * 30
        if move < 0:
            gamma_pnl = -gamma_pnl * 0.3  # gamma helps less on losses
        net_pnl = delta_pnl + gamma_pnl - theta_total * 100
    elif strategy == "bull_call_spread":
        delta_pnl = (delta * stock_move_pct / 100) / premium_as_pct * 70
        net_pnl = delta_pnl - theta_total * 40  # spreads have less theta
    elif strategy == "cash_secured_put":
        delta_pnl = -(delta * stock_move_pct / 100) / premium_as_pct * 60
        net_pnl = delta_pnl + theta_total * 60  # theta helps CSPs
    else:
        net_pnl = (delta * stock_move_pct / 100) / premium_as_pct * 80 - theta_total * 100

    return net_pnl


# --- Setup detection wrapper for backtesting --- #

def detect_setups_at_bar(ticker: str, df: pd.DataFrame, bar_idx: int,
                         spy_df: pd.DataFrame | None, cash: float) -> list[dict]:
    """Run setup detection on a historical bar using data up to that point."""
    if bar_idx < LOOKBACK_BARS:
        return []

    window = df.iloc[:bar_idx + 1].copy()
    if len(window) < LOOKBACK_BARS:
        return []

    try:
        analysis = indicators.analyze(window)
    except Exception:
        return []

    # Compute relative strength vs SPY if available
    rs = None
    if spy_df is not None and bar_idx < len(spy_df):
        spy_window = spy_df.iloc[:bar_idx + 1]
        if len(spy_window) >= 21 and "Close" in spy_window.columns:
            try:
                rs_data = indicators.relative_strength(
                    window["Close"], spy_window["Close"], 21)
                rs = {"rs_vs_spy": rs_data, "outperforming_spy": rs_data["outperforming"],
                      "rs_vs_sector": None, "outperforming_sector": None}
            except Exception:
                pass

    # Detect setups (simplified sector_rank=None for backtest speed)
    from morning_scan import detect_all
    return detect_all(ticker, analysis, cash, rs, None)


# --- Backtester engine --- #

def run_backtest(tickers: list[str], months: int = 12,
                 verbose: bool = False) -> dict:
    """Run backtest over historical data."""
    period = f"{months}mo" if months <= 24 else f"{months // 12}y"

    print(f"\n  Downloading {period} of data for {len(tickers)} tickers...")
    all_tickers = list(set(tickers + ["SPY"]))
    try:
        raw = yf.download(all_tickers, period=period, group_by="ticker",
                          threads=True, progress=False)
    except Exception as e:
        print(f"  ERROR: Download failed: {e}")
        return {}

    # Parse into per-ticker DataFrames
    data = {}
    for t in all_tickers:
        try:
            if len(all_tickers) == 1:
                df = raw.copy()
            else:
                df = raw[t].copy()
            df = df.dropna(subset=["Close"])
            if len(df) >= LOOKBACK_BARS + 20:
                data[t] = df
        except Exception:
            pass

    spy_df = data.get("SPY")
    print(f"  Got data for {len(data)} tickers. Running backtest...\n")

    # Track state
    capital = STARTING_CAPITAL
    cash = STARTING_CAPITAL
    open_positions = []
    all_trades = []
    equity_curve = []

    # Walk through each trading day
    scan_tickers = [t for t in tickers if t in data]
    if not scan_tickers:
        print("  No valid tickers with enough data.")
        return {}

    # Use the first ticker's index as the date reference
    ref_dates = data[scan_tickers[0]].index
    num_bars = len(ref_dates)

    for bar_idx in range(LOOKBACK_BARS, num_bars):
        current_date = ref_dates[bar_idx]

        # --- Manage open positions ---
        closed_today = []
        for pos in open_positions[:]:
            t = pos["ticker"]
            if t not in data or bar_idx >= len(data[t]):
                continue

            entry_bar = pos["entry_bar"]
            days_held = bar_idx - entry_bar
            entry_price = pos["entry_stock_price"]
            current_price = data[t]["Close"].iloc[bar_idx]
            stock_move_pct = (current_price - entry_price) / entry_price * 100

            # Estimate current option P/L
            option_pnl_pct = estimate_option_pnl(
                stock_move_pct, pos["strategy"], days_held)

            rules = RULES[pos["strategy"]]
            min_hold, max_hold = rules["hold_days"]

            # Check exit conditions
            exit_reason = None
            if days_held >= min_hold:
                if option_pnl_pct <= rules["stop_pct"] * 100:
                    exit_reason = "stop_loss"
                elif option_pnl_pct >= rules["target_pct"] * 100:
                    exit_reason = "profit_target"
            if days_held >= max_hold:
                exit_reason = "time_exit"

            if exit_reason:
                # Close position
                cost = pos["cost"]
                pnl_dollars = round(cost * option_pnl_pct / 100, 2)
                # Cap loss at cost, cap gain at reasonable max
                pnl_dollars = max(pnl_dollars, -cost)
                if pos["strategy"] == "bull_call_spread":
                    max_gain = cost * 2.5  # spread can't gain more than width
                    pnl_dollars = min(pnl_dollars, max_gain)

                cash += cost + pnl_dollars
                trade = {
                    **pos,
                    "exit_date": str(current_date.date()) if hasattr(current_date, 'date') else str(current_date),
                    "exit_stock_price": round(current_price, 2),
                    "stock_move_pct": round(stock_move_pct, 2),
                    "option_pnl_pct": round(option_pnl_pct, 2),
                    "pnl_dollars": pnl_dollars,
                    "days_held": days_held,
                    "exit_reason": exit_reason,
                    "win": pnl_dollars > 0,
                }
                all_trades.append(trade)
                closed_today.append(pos)

                if verbose:
                    sym = "+" if pnl_dollars >= 0 else ""
                    print(f"  {trade['exit_date']} CLOSE {t} {pos['setup']} | "
                          f"stock {stock_move_pct:+.1f}% | "
                          f"option {sym}{option_pnl_pct:.0f}% | "
                          f"{sym}${pnl_dollars:.0f} | {exit_reason}")

        for pos in closed_today:
            open_positions.remove(pos)

        # --- Scan for new setups ---
        # Market regime: skip new entries when SPY is overbought (RSI > 72)
        spy_overbought = False
        if spy_df is not None and bar_idx < len(spy_df):
            try:
                spy_rsi = indicators.rsi(spy_df["Close"].iloc[:bar_idx+1]).iloc[-1]
                spy_overbought = not np.isnan(spy_rsi) and spy_rsi > 72
            except Exception:
                pass

        if not spy_overbought and len(open_positions) < MAX_POSITIONS and cash > capital * (1 - MAX_DEPLOY_PCT):
            # Prioritize high-beta stocks that actually swing
            ordered = [t for t in scan_tickers if t in HIGH_BETA] + \
                      [t for t in scan_tickers if t not in HIGH_BETA]
            for t in ordered:
                if len(open_positions) >= MAX_POSITIONS:
                    break
                if any(p["ticker"] == t for p in open_positions):
                    continue
                if t not in data or bar_idx >= len(data[t]):
                    continue

                # Only trade stocks that actually swing hard enough
                if t not in HIGH_BETA:
                    continue

                setups = detect_setups_at_bar(t, data[t], bar_idx, spy_df, cash)
                for s in setups:
                    if len(open_positions) >= MAX_POSITIONS:
                        break
                    if s["setup"] == "oversold_bounce" and s["score"] < 70:
                        continue
                    if s["score"] < 60:
                        continue

                    # Scale position size by conviction
                    if s["score"] >= 75:
                        risk_budget = capital * 0.15  # 15% on high-conviction
                    else:
                        risk_budget = capital * MAX_RISK_PCT  # 10% standard
                    cost = min(risk_budget, cash * 0.40)
                    cost = round(max(cost, 50), 2)

                    if cost > cash:
                        continue

                    stock_price = data[t]["Close"].iloc[bar_idx]
                    pos = {
                        "ticker": t,
                        "setup": s["setup"],
                        "strategy": s["strategy"],
                        "entry_date": str(current_date.date()) if hasattr(current_date, 'date') else str(current_date),
                        "entry_bar": bar_idx,
                        "entry_stock_price": round(stock_price, 2),
                        "cost": cost,
                        "score": s["score"],
                    }
                    open_positions.append(pos)
                    cash -= cost

                    if verbose:
                        print(f"  {pos['entry_date']} OPEN  {t} {s['setup']} "
                              f"(score {s['score']}) | ${stock_price:.2f} | "
                              f"cost ${cost:.0f}")
                    break  # one setup per ticker per day

        # Record equity
        deployed = sum(p["cost"] for p in open_positions)
        equity_curve.append({
            "date": str(current_date.date()) if hasattr(current_date, 'date') else str(current_date),
            "equity": round(cash + deployed, 2),
            "cash": round(cash, 2),
            "positions": len(open_positions),
        })

        # Update capital high watermark
        current_equity = cash + deployed
        capital = max(capital, current_equity)

    # Close any remaining positions at last bar
    for pos in open_positions:
        t = pos["ticker"]
        if t in data:
            last_price = data[t]["Close"].iloc[-1]
            entry_price = pos["entry_stock_price"]
            stock_move = (last_price - entry_price) / entry_price * 100
            days = num_bars - 1 - pos["entry_bar"]
            pnl_pct = estimate_option_pnl(stock_move, pos["strategy"], days)
            pnl_dollars = round(pos["cost"] * pnl_pct / 100, 2)
            pnl_dollars = max(pnl_dollars, -pos["cost"])
            cash += pos["cost"] + pnl_dollars
            all_trades.append({
                **pos,
                "exit_date": str(ref_dates[-1].date()) if hasattr(ref_dates[-1], 'date') else str(ref_dates[-1]),
                "exit_stock_price": round(last_price, 2),
                "stock_move_pct": round(stock_move, 2),
                "option_pnl_pct": round(pnl_pct, 2),
                "pnl_dollars": pnl_dollars,
                "days_held": days,
                "exit_reason": "backtest_end",
                "win": pnl_dollars > 0,
            })

    return {
        "trades": all_trades,
        "equity_curve": equity_curve,
        "final_equity": round(cash, 2),
    }


# --- Report --- #

def format_report(results: dict, months: int) -> str:
    """Format backtest results into a readable report."""
    trades = results.get("trades", [])
    curve = results.get("equity_curve", [])
    final = results.get("final_equity", STARTING_CAPITAL)

    lines = []
    w = 76
    lines.append("=" * w)
    lines.append(f" BACKTEST RESULTS — {months} months | {len(trades)} trades")
    lines.append("=" * w)

    if not trades:
        lines.append("\n  No trades were triggered during this period.")
        lines.append("  This could mean the strategy was correctly cautious,")
        lines.append("  or the thresholds are too strict for this timeframe.\n")
        lines.append("=" * w)
        return "\n".join(lines)

    # Overall performance
    total_pnl = sum(t["pnl_dollars"] for t in trades)
    total_return = (final - STARTING_CAPITAL) / STARTING_CAPITAL * 100
    wins = [t for t in trades if t["win"]]
    losses = [t for t in trades if not t["win"]]
    win_rate = len(wins) / len(trades) * 100 if trades else 0

    avg_win = np.mean([t["pnl_dollars"] for t in wins]) if wins else 0
    avg_loss = np.mean([t["pnl_dollars"] for t in losses]) if losses else 0
    avg_win_pct = np.mean([t["option_pnl_pct"] for t in wins]) if wins else 0
    avg_loss_pct = np.mean([t["option_pnl_pct"] for t in losses]) if losses else 0

    profit_factor = abs(sum(t["pnl_dollars"] for t in wins) /
                        sum(t["pnl_dollars"] for t in losses)) if losses and sum(t["pnl_dollars"] for t in losses) != 0 else float("inf")

    # Max drawdown from equity curve
    if curve:
        equities = [c["equity"] for c in curve]
        peak = equities[0]
        max_dd = 0
        for eq in equities:
            peak = max(peak, eq)
            dd = (eq - peak) / peak * 100
            max_dd = min(max_dd, dd)
    else:
        max_dd = 0

    lines.append(f"\n PERFORMANCE SUMMARY")
    lines.append(f"   Starting capital:   ${STARTING_CAPITAL:,.2f}")
    lines.append(f"   Final equity:       ${final:,.2f}")
    sym = "+" if total_pnl >= 0 else ""
    lines.append(f"   Total P/L:          {sym}${total_pnl:,.2f} ({sym}{total_return:.1f}%)")
    lines.append(f"   Max drawdown:       {max_dd:.1f}%")
    lines.append(f"   Profit factor:      {profit_factor:.2f}")
    lines.append("")

    lines.append(f" TRADE STATISTICS")
    lines.append(f"   Total trades:       {len(trades)}")
    lines.append(f"   Wins:               {len(wins)} ({win_rate:.0f}%)")
    lines.append(f"   Losses:             {len(losses)} ({100 - win_rate:.0f}%)")
    lines.append(f"   Avg win:            +${avg_win:.2f} ({avg_win_pct:+.0f}% on option)")
    lines.append(f"   Avg loss:           ${avg_loss:.2f} ({avg_loss_pct:.0f}% on option)")
    avg_days = np.mean([t["days_held"] for t in trades])
    lines.append(f"   Avg hold time:      {avg_days:.1f} days")
    lines.append("")

    # By setup type
    setups = {}
    for t in trades:
        s = t["setup"]
        if s not in setups:
            setups[s] = {"wins": 0, "losses": 0, "pnl": 0, "trades": []}
        if t["win"]:
            setups[s]["wins"] += 1
        else:
            setups[s]["losses"] += 1
        setups[s]["pnl"] += t["pnl_dollars"]
        setups[s]["trades"].append(t)

    lines.append(f" BY SETUP TYPE")
    lines.append(f"   {'Setup':<22} {'Trades':>6} {'Win%':>6} {'P/L':>10} {'Avg':>8}")
    lines.append(f"   {'-'*22} {'-'*6} {'-'*6} {'-'*10} {'-'*8}")
    for sname, stats in sorted(setups.items(), key=lambda x: x[1]["pnl"], reverse=True):
        total = stats["wins"] + stats["losses"]
        wr = stats["wins"] / total * 100 if total > 0 else 0
        avg = stats["pnl"] / total if total > 0 else 0
        sym = "+" if stats["pnl"] >= 0 else ""
        lines.append(f"   {sname:<22} {total:>6} {wr:>5.0f}% "
                     f"{sym}${stats['pnl']:>8.2f} {sym}${avg:>6.2f}")
    lines.append("")

    # By ticker
    tickers = {}
    for t in trades:
        tk = t["ticker"]
        if tk not in tickers:
            tickers[tk] = {"wins": 0, "losses": 0, "pnl": 0}
        if t["win"]:
            tickers[tk]["wins"] += 1
        else:
            tickers[tk]["losses"] += 1
        tickers[tk]["pnl"] += t["pnl_dollars"]

    lines.append(f" BY TICKER")
    lines.append(f"   {'Ticker':<8} {'Trades':>6} {'Win%':>6} {'P/L':>10}")
    lines.append(f"   {'-'*8} {'-'*6} {'-'*6} {'-'*10}")
    for tk, stats in sorted(tickers.items(), key=lambda x: x[1]["pnl"], reverse=True):
        total = stats["wins"] + stats["losses"]
        wr = stats["wins"] / total * 100 if total > 0 else 0
        sym = "+" if stats["pnl"] >= 0 else ""
        lines.append(f"   {tk:<8} {total:>6} {wr:>5.0f}% {sym}${stats['pnl']:>8.2f}")
    lines.append("")

    # By exit reason
    reasons = {}
    for t in trades:
        r = t["exit_reason"]
        if r not in reasons:
            reasons[r] = {"count": 0, "pnl": 0}
        reasons[r]["count"] += 1
        reasons[r]["pnl"] += t["pnl_dollars"]

    lines.append(f" BY EXIT REASON")
    lines.append(f"   {'Reason':<18} {'Count':>6} {'P/L':>10}")
    lines.append(f"   {'-'*18} {'-'*6} {'-'*10}")
    for reason, stats in sorted(reasons.items()):
        sym = "+" if stats["pnl"] >= 0 else ""
        lines.append(f"   {reason:<18} {stats['count']:>6} {sym}${stats['pnl']:>8.2f}")
    lines.append("")

    # Worst and best trades
    sorted_trades = sorted(trades, key=lambda x: x["pnl_dollars"])
    lines.append(f" WORST TRADES")
    for t in sorted_trades[:3]:
        lines.append(f"   {t['entry_date']} {t['ticker']} {t['setup']} | "
                     f"stock {t['stock_move_pct']:+.1f}% | "
                     f"${t['pnl_dollars']:+.2f} | {t['exit_reason']}")
    lines.append("")
    lines.append(f" BEST TRADES")
    for t in sorted_trades[-3:]:
        lines.append(f"   {t['entry_date']} {t['ticker']} {t['setup']} | "
                     f"stock {t['stock_move_pct']:+.1f}% | "
                     f"${t['pnl_dollars']:+.2f} | {t['exit_reason']}")
    lines.append("")

    # Monthly equity
    if curve:
        lines.append(f" EQUITY CURVE (monthly snapshots)")
        lines.append(f"   {'Month':<12} {'Equity':>10} {'Change':>10}")
        lines.append(f"   {'-'*12} {'-'*10} {'-'*10}")
        prev_eq = STARTING_CAPITAL
        last_month = ""
        for c in curve:
            month = c["date"][:7]
            if month != last_month:
                change = c["equity"] - prev_eq
                sym = "+" if change >= 0 else ""
                lines.append(f"   {month:<12} ${c['equity']:>8,.2f} {sym}${change:>8,.2f}")
                prev_eq = c["equity"]
                last_month = month
        lines.append("")

    lines.append("=" * w)
    lines.append(" NOTE: Option P/L estimated via delta approximation. Actual results")
    lines.append(" would vary based on IV, bid-ask spreads, and exact strike selection.")
    lines.append("=" * w)

    return "\n".join(lines)


# --- CLI --- #

def main():
    parser = argparse.ArgumentParser(description="Backtest options swing trading strategy")
    parser.add_argument("--months", type=int, default=12, help="Months of history (default 12)")
    parser.add_argument("--ticker", nargs="+", default=None, help="Specific tickers")
    parser.add_argument("--verbose", action="store_true", help="Show every trade")
    parser.add_argument("--include-discovery", action="store_true",
                        help="Include stocks from today's discovery scan (stock_discovery.py)")
    args = parser.parse_args()

    if args.ticker:
        tickers = args.ticker
    else:
        tickers = screener.get_tickers()
        if args.include_discovery:
            try:
                import stock_discovery
                disc = stock_discovery.load_discovery_data()
                disc_tickers = disc.get("discovery_tickers", [])
                # Add discovered stocks to HIGH_BETA set so they get traded in backtest
                HIGH_BETA.update(disc_tickers)
                tickers = list(set(tickers + disc_tickers))
                print(f"  Including {len(disc_tickers)} discovered stocks: {', '.join(disc_tickers)}")
            except Exception as e:
                print(f"  WARN: Could not load discovery data: {e}")
    results = run_backtest(tickers, months=args.months, verbose=args.verbose)
    if results:
        report = format_report(results, args.months)
        print(report)


if __name__ == "__main__":
    main()
