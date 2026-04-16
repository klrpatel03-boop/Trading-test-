#!/usr/bin/env python3
"""
Automated morning scanner for options swing trading.
Fetches live market data, runs technical analysis, detects setups,
and outputs actionable trade ideas with strike recommendations.

Usage:
  python morning_scan.py              # full scan with options chains
  python morning_scan.py --fast       # skip options chains (faster)
  python morning_scan.py --ticker NVDA AMD
  python morning_scan.py --account 1500
"""

import argparse
import sys
import time
from datetime import date, datetime, timedelta

import numpy as np
import yfinance as yf

import indicators
import screener
import portfolio

# --- Config --- #

DTE_PREFS = {
    "breakout": (21, 30),
    "oversold_bounce": (30, 45),
    "momentum_pullback": (30, 45),
    "mean_reversion_csp": (30, 45),
}

MAX_IDEAS = 5
MAX_RISK_PCT = 0.05
MAX_DEPLOY_PCT = 0.80
MAX_POSITIONS = 4


# --- Data Fetching --- #

def fetch_all_data(tickers: list[str], period: str = "6mo") -> dict:
    """Batch-download price history for all tickers."""
    result = {}
    try:
        data = yf.download(tickers, period=period, group_by="ticker",
                           threads=True, progress=False)
        if data.empty:
            print("  WARN: yfinance returned empty data.")
            return result
        for t in tickers:
            try:
                if len(tickers) == 1:
                    df = data.copy()
                else:
                    df = data[t].copy()
                df = df.dropna(subset=["Close"])
                if len(df) >= 50:
                    result[t] = df
            except Exception:
                pass
    except Exception as e:
        print(f"  WARN: Batch download failed ({e}). Trying individually...")
        for t in tickers:
            try:
                df = yf.download(t, period=period, progress=False)
                df = df.dropna(subset=["Close"])
                if len(df) >= 50:
                    result[t] = df
            except Exception:
                pass
    return result


def fetch_options_chain(ticker: str, min_dte: int = 14, max_dte: int = 45) -> dict | None:
    """Fetch options chain for the best expiration in the DTE window."""
    try:
        tk = yf.Ticker(ticker)
        expirations = tk.options
        if not expirations:
            return None

        today = date.today()
        best_exp = None
        best_dte = None
        for exp_str in expirations:
            exp_date = datetime.strptime(exp_str, "%Y-%m-%d").date()
            dte = (exp_date - today).days
            if min_dte <= dte <= max_dte:
                if best_dte is None or abs(dte - 30) < abs(best_dte - 30):
                    best_exp = exp_str
                    best_dte = dte

        if best_exp is None:
            for exp_str in expirations:
                exp_date = datetime.strptime(exp_str, "%Y-%m-%d").date()
                dte = (exp_date - today).days
                if dte >= 7:
                    best_exp = exp_str
                    best_dte = dte
                    break

        if best_exp is None:
            return None

        chain = tk.option_chain(best_exp)
        calls = chain.calls
        puts = chain.puts
        calls = calls[(calls["bid"] > 0) & (calls["openInterest"] > 5)].copy()
        puts = puts[(puts["bid"] > 0) & (puts["openInterest"] > 5)].copy()

        return {
            "expiration": best_exp,
            "dte": best_dte,
            "calls": calls,
            "puts": puts,
        }
    except Exception:
        return None


# --- Setup Detection --- #

def detect_breakout(ticker: str, a: dict) -> dict | None:
    """Detect breakout from consolidation."""
    rsi_val = a.get("rsi")
    vol = a.get("volume_ratio")
    consol = a.get("consolidation_pct")
    sr = a.get("support_resistance", {})
    price = a.get("price", 0)

    if rsi_val is None or vol is None:
        return None

    r1 = sr.get("resistance_1", price * 1.1)
    near_resistance = price >= r1 * 0.98

    if consol is not None and consol < 7 and vol >= 1.2 and 38 <= rsi_val <= 68 and near_resistance:
        score = 50
        if consol < 4:
            score += 15
        elif consol < 5.5:
            score += 8
        if vol >= 1.8:
            score += 12
        elif vol >= 1.4:
            score += 6
        if 45 <= rsi_val <= 58:
            score += 8
        score = min(score, 95)

        return {
            "setup": "breakout",
            "ticker": ticker,
            "score": score,
            "detail": f"Tight range ({consol:.1f}%), vol {vol:.1f}x avg, near R1 ${r1:.2f}",
            "direction": "bullish",
            "strategy": "bull_call_spread",
        }
    return None


def detect_oversold_bounce(ticker: str, a: dict) -> dict | None:
    """Detect oversold bounce at support."""
    rsi_val = a.get("rsi")
    vol = a.get("volume_ratio")
    price = a.get("price", 0)
    ma_50 = a.get("ma_50")
    sr = a.get("support_resistance", {})
    bb_pct = a.get("bb_pct_b")

    if rsi_val is None or rsi_val > 35:
        return None

    s1 = sr.get("support_1", 0)
    near_support = ma_50 and abs(price - ma_50) / ma_50 < 0.03
    near_sr_support = s1 > 0 and abs(price - s1) / s1 < 0.03
    at_bb_lower = bb_pct is not None and bb_pct < 0.1

    if near_support or near_sr_support or at_bb_lower:
        score = 55
        if rsi_val < 25:
            score += 15
        elif rsi_val < 30:
            score += 8
        if vol and vol >= 1.3:
            score += 10
        if at_bb_lower:
            score += 5
        if near_support and near_sr_support:
            score += 8
        score = min(score, 95)

        support_desc = f"50MA ${ma_50:.2f}" if near_support else f"S1 ${s1:.2f}"
        return {
            "setup": "oversold_bounce",
            "ticker": ticker,
            "score": score,
            "detail": f"RSI {rsi_val:.0f}, near {support_desc}, vol {vol:.1f}x" if vol else f"RSI {rsi_val:.0f}",
            "direction": "bullish",
            "strategy": "bull_call_spread",
        }
    return None


def detect_momentum_pullback(ticker: str, a: dict) -> dict | None:
    """Detect pullback to 20MA in an uptrend."""
    trend = a.get("trend", {})
    dist_20 = a.get("dist_20ma_pct")
    dist_50 = a.get("dist_50ma_pct")
    rsi_val = a.get("rsi")
    ma_20 = a.get("ma_20")

    if trend.get("direction") not in ("uptrend", "strong_uptrend"):
        return None
    if dist_20 is None or dist_50 is None:
        return None
    if not (-3.0 <= dist_20 <= 1.5 and dist_50 > 0):
        return None
    if rsi_val is not None and (rsi_val < 35 or rsi_val > 60):
        return None

    score = 50
    if abs(dist_20) < 1.0:
        score += 15
    elif abs(dist_20) < 2.0:
        score += 8
    if trend.get("direction") == "strong_uptrend":
        score += 10
    if rsi_val and 42 <= rsi_val <= 55:
        score += 8
    score = min(score, 95)

    return {
        "setup": "momentum_pullback",
        "ticker": ticker,
        "score": score,
        "detail": f"Uptrend, pulled back to 20MA ${ma_20:.2f} ({dist_20:+.1f}%), RSI {rsi_val:.0f}",
        "direction": "bullish",
        "strategy": "long_call",
    }


def detect_mean_reversion_csp(ticker: str, a: dict, cash: float) -> dict | None:
    """Detect deeply oversold stock suitable for cash-secured put."""
    rsi_val = a.get("rsi")
    price = a.get("price", 0)

    if price * 100 > cash:
        return None
    if rsi_val is None or rsi_val > 30:
        return None

    score = 50
    if rsi_val < 20:
        score += 20
    elif rsi_val < 25:
        score += 12
    bb_pct = a.get("bb_pct_b")
    if bb_pct is not None and bb_pct < 0.05:
        score += 10
    score = min(score, 95)

    strike_target = round(price * 0.92, 2)
    return {
        "setup": "mean_reversion_csp",
        "ticker": ticker,
        "score": score,
        "detail": f"RSI {rsi_val:.0f}, price ${price:.2f}, CSP strike ~${strike_target:.2f}",
        "direction": "neutral_bullish",
        "strategy": "cash_secured_put",
    }


def detect_all(ticker: str, analysis: dict, cash: float) -> list[dict]:
    """Run all setup detectors on a ticker."""
    results = []
    for fn in [detect_breakout, detect_oversold_bounce, detect_momentum_pullback]:
        r = fn(ticker, analysis)
        if r:
            results.append(r)
    r = detect_mean_reversion_csp(ticker, analysis, cash)
    if r:
        results.append(r)
    return results


# --- Options Recommendations --- #

def recommend_trade(ticker: str, setup: dict, analysis: dict,
                    chain: dict | None, account_value: float) -> dict:
    """Build a specific trade recommendation with strikes and sizing."""
    price = analysis["price"]
    max_risk = round(account_value * MAX_RISK_PCT, 2)
    strategy = setup["strategy"]
    rec = {
        "ticker": ticker,
        "strategy_name": strategy,
        "has_chain": chain is not None,
    }

    if chain is None:
        rec["note"] = "No options chain — run without --fast for strike recs"
        rec["estimated_cost"] = None
        return rec

    exp = chain["expiration"]
    dte = chain["dte"]
    calls = chain["calls"]
    puts = chain["puts"]

    if strategy == "bull_call_spread" and len(calls) >= 2:
        atm_idx = (calls["strike"] - price).abs().idxmin()
        atm_row = calls.loc[atm_idx]
        buy_strike = atm_row["strike"]
        otm = calls[calls["strike"] > buy_strike].head(3)
        if len(otm) >= 1:
            sell_idx = otm.index[-1] if len(otm) >= 2 else otm.index[0]
            sell_row = calls.loc[sell_idx]
            sell_strike = sell_row["strike"]
            debit = round((atm_row["ask"] + atm_row["bid"]) / 2
                          - (sell_row["bid"] + sell_row["ask"]) / 2, 2)
            debit = max(debit, 0.05)
            width = sell_strike - buy_strike
            max_profit = round((width - debit) * 100, 2)
            cost = round(debit * 100, 2)
            rr = round(max_profit / cost, 2) if cost > 0 else 0
            rec.update({
                "buy_strike": buy_strike, "sell_strike": sell_strike,
                "expiration": exp, "dte": dte,
                "estimated_debit": debit, "total_cost": cost,
                "max_profit": max_profit, "risk_reward": f"1:{rr}",
                "contracts": 1,
                "stop_loss": round(debit * 0.60, 2),
                "profit_target": round(debit * 1.80, 2),
                "acct_risk_pct": round(cost / account_value * 100, 1),
            })
        else:
            rec["note"] = "Not enough OTM strikes for spread"

    elif strategy == "long_call" and len(calls) >= 1:
        atm_idx = (calls["strike"] - price).abs().idxmin()
        row = calls.loc[atm_idx]
        premium = round((row["ask"] + row["bid"]) / 2, 2)
        cost = round(premium * 100, 2)
        rec.update({
            "buy_strike": row["strike"], "sell_strike": None,
            "expiration": exp, "dte": dte,
            "estimated_debit": premium, "total_cost": cost,
            "max_profit": "unlimited", "risk_reward": "N/A",
            "contracts": 1,
            "stop_loss": round(premium * 0.50, 2),
            "profit_target": round(premium * 2.0, 2),
            "acct_risk_pct": round(cost / account_value * 100, 1),
        })

    elif strategy == "cash_secured_put" and len(puts) >= 1:
        target_strike = price * 0.92
        put_idx = (puts["strike"] - target_strike).abs().idxmin()
        row = puts.loc[put_idx]
        credit = round((row["bid"] + row["ask"]) / 2, 2)
        collateral = round(row["strike"] * 100, 2)
        rec.update({
            "buy_strike": None, "sell_strike": row["strike"],
            "expiration": exp, "dte": dte,
            "estimated_credit": credit, "collateral": collateral,
            "total_cost": collateral, "max_profit": round(credit * 100, 2),
            "contracts": 1,
            "stop_loss": round(credit * 2, 2),
            "acct_risk_pct": round(collateral / account_value * 100, 1),
        })
    else:
        rec["note"] = "Insufficient chain data"

    return rec


# --- Scoring --- #

def score_idea(setup: dict, rec: dict, wl_entry: dict | None) -> float:
    """Score a trade idea 0-100."""
    base = setup.get("score", 50)
    tier = wl_entry.get("tier", 3) if wl_entry else 3
    tier_bonus = {1: 15, 2: 8, 3: 3}.get(tier, 0)
    cost = rec.get("total_cost")
    afford_bonus = 10 if cost and cost < 100 else (5 if cost and cost < 200 else 0)
    rr_str = rec.get("risk_reward", "")
    rr_bonus = 0
    if rr_str and ":" in rr_str:
        try:
            rr_val = float(rr_str.split(":")[1])
            rr_bonus = min(int(rr_val * 8), 20)
        except (ValueError, IndexError):
            pass
    return min(base * 0.45 + tier_bonus + afford_bonus + rr_bonus, 99)


# --- Morning Brief Formatter --- #

def format_brief(ideas: list[dict], account: dict, market: dict,
                 all_analyses: dict) -> str:
    """Format the full morning brief."""
    lines = []
    w = 68
    lines.append("=" * w)
    lines.append(f" MORNING SCAN — {date.today().strftime('%A, %B %d, %Y')}")
    lines.append(f" Account: ${account['total']:,.0f} | Cash: ${account['cash']:,.0f}"
                 f" | Open: {account['num_open']} | Capacity: {MAX_POSITIONS - account['num_open']} more")
    lines.append("=" * w)

    # Market pulse
    lines.append("\n MARKET PULSE")
    for sym in ["SPY", "QQQ"]:
        if sym in market:
            m = market[sym]
            lines.append(f"   {sym}: ${m['price']:.2f} | RSI {m['rsi']:.0f}"
                         f" | Trend: {m['trend']['direction']}")
    lines.append("")

    # Trade ideas
    if ideas:
        lines.append(f" {'—'*3} TOP TRADE IDEAS {'—'*3}\n")
        for i, idea in enumerate(ideas[:MAX_IDEAS], 1):
            s = idea["setup_data"]
            r = idea["recommendation"]
            a = idea["analysis"]
            lines.append(f" #{i}  {s['ticker']} — {s['setup'].replace('_', ' ').title()}"
                         f"  [Score: {idea['final_score']:.0f}]")
            lines.append(f"     ${a['price']:.2f} | RSI {a['rsi']:.0f}"
                         f" | Vol {a.get('volume_ratio', 0):.1f}x")
            lines.append(f"     {s['detail']}")

            if r.get("buy_strike") is not None or r.get("sell_strike") is not None:
                sname = s["strategy"].replace("_", " ").title()
                lines.append(f"     >> {sname}")
                if s["strategy"] == "bull_call_spread":
                    lines.append(f"        BUY ${r['buy_strike']}C / SELL ${r['sell_strike']}C"
                                 f" | {r['expiration']} ({r['dte']} DTE)")
                    lines.append(f"        Debit: ~${r['estimated_debit']:.2f}"
                                 f" (${r['total_cost']:.0f})"
                                 f" | Max Profit: ${r['max_profit']:.0f}"
                                 f" | R:R {r['risk_reward']}")
                elif s["strategy"] == "long_call":
                    lines.append(f"        BUY ${r['buy_strike']}C"
                                 f" | {r['expiration']} ({r['dte']} DTE)")
                    lines.append(f"        Premium: ~${r['estimated_debit']:.2f}"
                                 f" (${r['total_cost']:.0f})")
                elif s["strategy"] == "cash_secured_put":
                    lines.append(f"        SELL ${r['sell_strike']}P"
                                 f" | {r['expiration']} ({r['dte']} DTE)")
                    lines.append(f"        Credit: ~${r.get('estimated_credit', 0):.2f}"
                                 f" | Collateral: ${r.get('collateral', 0):.0f}")

                if r.get("stop_loss"):
                    lines.append(f"        Stop: ${r['stop_loss']:.2f}"
                                 f" | Target: ${r.get('profit_target', 0):.2f}"
                                 f" | Acct risk: {r.get('acct_risk_pct', 0):.1f}%")
            elif r.get("note"):
                lines.append(f"     >> {r['note']}")
            lines.append("")
    else:
        lines.append(" No setups detected today. Patience is a strategy.\n")

    # Watchlist notes
    lines.append(f" {'—'*3} WATCHLIST NOTES {'—'*3}")
    noted = 0
    for ticker, a in sorted(all_analyses.items()):
        if any(ticker == idea["setup_data"]["ticker"] for idea in ideas):
            continue
        rsi_val = a.get("rsi")
        trend = a.get("trend", {}).get("direction", "?")
        if rsi_val is None:
            continue
        note = ""
        if rsi_val > 65:
            note = f"RSI {rsi_val:.0f} — getting overbought, wait for pullback"
        elif rsi_val < 38:
            note = f"RSI {rsi_val:.0f} — approaching oversold, watch for bounce"
        elif trend in ("uptrend", "strong_uptrend"):
            ma20 = a.get("ma_20")
            note = f"RSI {rsi_val:.0f}, {trend}" + (f", watch for dip to 20MA ${ma20:.0f}" if ma20 else "")
        else:
            continue
        lines.append(f"   {ticker}: {note}")
        noted += 1
        if noted >= 6:
            break
    lines.append("")

    # Risk dashboard
    lines.append(f" {'—'*3} RISK DASHBOARD {'—'*3}")
    lines.append(f"   Open positions: {account['num_open']}")
    lines.append(f"   Capital deployed: {account['utilization_pct']:.0f}%")
    reserve = account["total"] * (1 - MAX_DEPLOY_PCT)
    avail = max(0, account["cash"] - reserve)
    lines.append(f"   Available for trades: ${avail:,.0f} (after 20% reserve)")
    lines.append(f"   Max risk next trade: ${account['total'] * MAX_RISK_PCT:,.0f}")
    lines.append("")
    lines.append("=" * w)

    return "\n".join(lines)


# --- Main Scanner --- #

def run_scan(tickers: list[str] | None = None, account_override: float | None = None,
             fast: bool = False) -> None:
    """Run the full morning scan."""
    print("\n  Initializing morning scan...\n")

    # Account state
    try:
        account = portfolio.get_account_state()
    except Exception:
        account = {"cash": 1200, "deployed": 0, "total": 1200,
                   "open_positions": [], "num_open": 0,
                   "open_tickers": [], "utilization_pct": 0}
    if account_override:
        account["total"] = account_override
        account["cash"] = account_override

    # Tickers
    if tickers is None:
        tickers = screener.get_tickers()
    if "SPY" not in tickers:
        tickers.append("SPY")
    if "QQQ" not in tickers:
        tickers.append("QQQ")

    # Fetch data
    print(f"  Fetching data for {len(tickers)} tickers...")
    price_data = fetch_all_data(tickers)
    print(f"  Got data for {len(price_data)}/{len(tickers)} tickers.\n")

    if not price_data:
        print("  ERROR: No data retrieved. Check internet connection.")
        return

    # Run technical analysis
    print("  Running technical analysis...")
    all_analyses = {}
    for t, df in price_data.items():
        try:
            all_analyses[t] = indicators.analyze(df)
        except Exception as e:
            print(f"    WARN: Analysis failed for {t}: {e}")

    # Market context
    market = {}
    for sym in ["SPY", "QQQ"]:
        if sym in all_analyses:
            market[sym] = all_analyses[sym]

    # Detect setups
    print("  Scanning for setups...")
    raw_ideas = []
    for t, a in all_analyses.items():
        setups = detect_all(t, a, account["cash"])
        for s in setups:
            raw_ideas.append({"setup_data": s, "analysis": a})

    print(f"  Found {len(raw_ideas)} raw setups.\n")

    # Fetch options chains for top candidates (unless --fast)
    raw_ideas.sort(key=lambda x: x["setup_data"]["score"], reverse=True)
    top_ideas = raw_ideas[:MAX_IDEAS + 3]

    for idea in top_ideas:
        t = idea["setup_data"]["ticker"]
        wl = screener.get_watchlist_entry(t)

        if fast:
            rec = {"ticker": t, "has_chain": False,
                   "note": "Run without --fast for strike recommendations"}
        else:
            print(f"  Fetching options chain for {t}...")
            setup_name = idea["setup_data"]["setup"]
            dte_range = DTE_PREFS.get(setup_name, (21, 45))
            chain = fetch_options_chain(t, dte_range[0], dte_range[1])
            rec = recommend_trade(t, idea["setup_data"], idea["analysis"],
                                  chain, account["total"])

        idea["recommendation"] = rec
        idea["final_score"] = score_idea(idea["setup_data"], rec, wl)

    # Re-sort by final score
    top_ideas.sort(key=lambda x: x.get("final_score", 0), reverse=True)

    # Output
    brief = format_brief(top_ideas, account, market, all_analyses)
    print(brief)


# --- CLI --- #

def main():
    parser = argparse.ArgumentParser(description="Morning Options Swing Trading Scanner")
    parser.add_argument("--fast", action="store_true",
                        help="Skip options chain fetching (faster, no strike recs)")
    parser.add_argument("--ticker", nargs="+", default=None,
                        help="Scan specific tickers only")
    parser.add_argument("--account", type=float, default=None,
                        help="Override account value")
    args = parser.parse_args()

    run_scan(tickers=args.ticker, account_override=args.account, fast=args.fast)


if __name__ == "__main__":
    main()
