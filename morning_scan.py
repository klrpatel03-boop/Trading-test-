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
import sector_analysis
import stock_discovery

# --- Config --- #

DTE_PREFS = {
    "breakout": (21, 30),
    "oversold_bounce": (30, 45),
    "momentum_pullback": (30, 45),
    "mean_reversion_csp": (30, 45),
}

MAX_IDEAS = 5
MAX_RISK_PCT = 0.10
MAX_DEPLOY_PCT = 0.90
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


# --- Multi-Factor Setup Detection --- #

def _build_thesis(factors: list[str]) -> str:
    """Combine factor descriptions into a trade thesis."""
    return " | ".join(factors)


def detect_breakout(ticker: str, a: dict, rs: dict | None, sector_rank: dict | None) -> dict | None:
    """Breakout: consolidation + volume surge + sector tailwind + money flow confirmation."""
    rsi_val = a.get("rsi")
    vol = a.get("volume_ratio")
    consol = a.get("consolidation_pct")
    sr = a.get("support_resistance", {})
    price = a.get("price", 0)
    adx_val = a.get("adx")
    macd_cross = a.get("macd_cross")
    obv_sig = a.get("obv_signal")
    mfi_val = a.get("mfi")
    mtf = a.get("multi_timeframe", {})

    if rsi_val is None or vol is None or consol is None:
        return None

    r1 = sr.get("resistance_1", price * 1.1)
    near_resistance = price >= r1 * 0.98

    if not (consol < 8 and vol >= 1.1 and 35 <= rsi_val <= 72 and near_resistance):
        return None

    score = 40
    factors = []

    # Consolidation quality
    if consol < 4:
        score += 12; factors.append(f"very tight range {consol:.1f}%")
    elif consol < 6:
        score += 6; factors.append(f"tight range {consol:.1f}%")

    # Volume confirmation
    if vol >= 2.0:
        score += 12; factors.append(f"strong volume surge {vol:.1f}x")
    elif vol >= 1.4:
        score += 7; factors.append(f"vol {vol:.1f}x avg")

    # MACD crossover = momentum igniting
    if macd_cross == "bullish":
        score += 10; factors.append("MACD bullish crossover")

    # Money flow — institutional accumulation
    if obv_sig == "confirmed_up":
        score += 8; factors.append("OBV confirming accumulation")
    elif obv_sig == "bullish_divergence":
        score += 12; factors.append("OBV bullish divergence (stealth buying)")

    if mfi_val and mfi_val > 60:
        score += 5; factors.append(f"MFI {mfi_val:.0f} (strong money flow)")

    # Trend strength — ADX rising = real trend forming
    if adx_val and adx_val > 25:
        score += 6; factors.append(f"ADX {adx_val:.0f} (strong trend)")

    # Multi-timeframe alignment
    if mtf.get("aligned_bullish"):
        score += 8; factors.append("all timeframes aligned bullish")

    # Sector tailwind
    if sector_rank and sector_rank.get("momentum_score", 0) > 2:
        score += 8; factors.append(f"sector HOT ({sector_rank['sector']})")
    elif sector_rank and sector_rank.get("momentum_score", 0) > 0.5:
        score += 3; factors.append(f"sector positive ({sector_rank['sector']})")

    # Relative strength — outperforming peers
    if rs and rs.get("outperforming_sector"):
        score += 6; factors.append("outperforming sector")
    if rs and rs.get("outperforming_spy"):
        score += 4; factors.append("outperforming SPY")

    score = min(score, 97)
    if score < 50:
        return None

    return {
        "setup": "breakout",
        "ticker": ticker,
        "score": score,
        "detail": _build_thesis(factors),
        "direction": "bullish",
        "strategy": "long_call",
    }


def detect_oversold_bounce(ticker: str, a: dict, rs: dict | None, sector_rank: dict | None) -> dict | None:
    """Oversold reversal: RSI + MFI + OBV divergence + sector not collapsing."""
    rsi_val = a.get("rsi")
    vol = a.get("volume_ratio")
    price = a.get("price", 0)
    ma_50 = a.get("ma_50")
    sr = a.get("support_resistance", {})
    bb_pct = a.get("bb_pct_b")
    mfi_val = a.get("mfi")
    obv_sig = a.get("obv_signal")
    stoch_k = a.get("stoch_k")
    macd_cross = a.get("macd_cross")
    hv_rank = a.get("hv_rank", 50)
    mtf = a.get("multi_timeframe", {})

    if rsi_val is None or rsi_val > 38:
        return None

    # HARD REQUIREMENT 1: Weekly uptrend intact (no catching knives in downtrends)
    if not a.get("weekly_uptrend_intact", True):
        return None

    # HARD REQUIREMENT 2: Bounce must be CONFIRMED (green candle + RSI turning + volume)
    bounce = a.get("bounce", {})
    if not bounce.get("confirmed", False):
        return None

    # HARD REQUIREMENT 3: Sector not in freefall
    if sector_rank and sector_rank.get("momentum_score", 0) < -2:
        return None

    s1 = sr.get("support_1", 0)
    near_support = ma_50 and abs(price - ma_50) / ma_50 < 0.04
    near_sr = s1 > 0 and abs(price - s1) / s1 < 0.04
    at_bb_lower = bb_pct is not None and bb_pct < 0.15

    if not (near_support or near_sr or at_bb_lower):
        return None

    score = 42
    factors = []

    # Depth of oversold
    if rsi_val < 22:
        score += 15; factors.append(f"deeply oversold RSI {rsi_val:.0f}")
    elif rsi_val < 30:
        score += 8; factors.append(f"oversold RSI {rsi_val:.0f}")
    else:
        factors.append(f"RSI {rsi_val:.0f}")

    # Support confluence — multiple levels aligning = stronger
    supports_hit = 0
    support_desc = []
    if near_support:
        supports_hit += 1; support_desc.append(f"50MA ${ma_50:.0f}")
    if near_sr:
        supports_hit += 1; support_desc.append(f"S1 ${s1:.0f}")
    if at_bb_lower:
        supports_hit += 1; support_desc.append("lower BB")
    if supports_hit >= 2:
        score += 10; factors.append(f"support confluence: {', '.join(support_desc)}")
    else:
        score += 4; factors.append(f"at {support_desc[0]}")

    # Stochastic oversold with potential crossover
    if stoch_k is not None and stoch_k < 20:
        score += 6; factors.append(f"stochastic oversold ({stoch_k:.0f})")

    # OBV divergence = smart money buying while price drops
    if obv_sig == "bullish_divergence":
        score += 14; factors.append("OBV bullish divergence — institutions accumulating")
    elif obv_sig == "confirmed_up":
        score += 6; factors.append("OBV positive despite price drop")

    # MFI showing buying pressure despite oversold price
    if mfi_val and mfi_val > 40:
        score += 5; factors.append(f"MFI {mfi_val:.0f} (buying pressure despite drop)")

    # MACD turning = momentum shifting
    if macd_cross == "bullish":
        score += 10; factors.append("MACD bullish crossover — reversal signal")

    # Volume on reversal
    if vol and vol >= 1.5:
        score += 6; factors.append(f"reversal on high volume ({vol:.1f}x)")

    # IV context — high HV rank means expensive options, prefer spreads
    if hv_rank > 70:
        factors.append(f"HV rank {hv_rank:.0f}% — use spreads (premiums rich)")

    # Sector context — don't catch a knife in a dying sector
    if sector_rank and sector_rank.get("momentum_score", 0) < -3:
        score -= 15; factors.append("WARN: sector in freefall")
    elif sector_rank and "oversold" in sector_rank.get("status", ""):
        score += 4; factors.append("sector also oversold — potential broad reversal")

    # Long-term trend still intact?
    if mtf.get("long") == "up":
        score += 5; factors.append("long-term uptrend intact (above 200MA)")

    score = min(score, 97)
    if score < 50:
        return None

    return {
        "setup": "oversold_bounce",
        "ticker": ticker,
        "score": score,
        "detail": _build_thesis(factors),
        "direction": "bullish",
        "strategy": "long_call",
    }


def detect_momentum_pullback(ticker: str, a: dict, rs: dict | None, sector_rank: dict | None) -> dict | None:
    """Momentum pullback: trending stock pulls to MA + multi-timeframe + sector strength."""
    trend = a.get("trend", {})
    dist_20 = a.get("dist_20ma_pct")
    dist_50 = a.get("dist_50ma_pct")
    rsi_val = a.get("rsi")
    ma_20 = a.get("ma_20")
    adx_val = a.get("adx")
    obv_sig = a.get("obv_signal")
    macd_hist = a.get("macd_histogram")
    mfi_val = a.get("mfi")
    mtf = a.get("multi_timeframe", {})

    if trend.get("direction") not in ("uptrend", "strong_uptrend"):
        return None
    if dist_20 is None or dist_50 is None:
        return None
    if not (-4.0 <= dist_20 <= 2.0 and dist_50 > 0):
        return None

    # HARD REQUIREMENT 1: Weekly uptrend intact
    if not a.get("weekly_uptrend_intact", True):
        return None

    # HARD REQUIREMENT 2: Bounce from pullback CONFIRMED (not still falling)
    bounce = a.get("bounce", {})
    if not bounce.get("confirmed", False):
        return None

    # HARD REQUIREMENT 3: MACD histogram turning positive (momentum resuming)
    macd_c = a.get("macd_cross", "none")
    macd_h = a.get("macd_histogram", 0) or 0
    if macd_c != "bullish" and macd_h <= 0:
        return None

    # HARD REQUIREMENT 4: Sector must be positive (no fighting the tape)
    if sector_rank and sector_rank.get("momentum_score", 0) < 0:
        return None

    score = 40
    factors = []

    # Pullback precision
    if -1.5 <= dist_20 <= 0.5:
        score += 14; factors.append(f"right at 20MA ${ma_20:.0f} ({dist_20:+.1f}%)")
    elif -3.0 <= dist_20 <= 1.5:
        score += 7; factors.append(f"near 20MA ${ma_20:.0f} ({dist_20:+.1f}%)")

    # Trend quality — ADX confirms real trend, not choppy market
    if adx_val and adx_val > 30:
        score += 10; factors.append(f"strong trend ADX {adx_val:.0f}")
    elif adx_val and adx_val > 22:
        score += 5; factors.append(f"trending ADX {adx_val:.0f}")

    # Multi-timeframe — all timeframes aligned = high probability
    if mtf.get("fully_aligned"):
        score += 10; factors.append("all timeframes bullish (10/20/50/200 MA)")
    elif mtf.get("aligned_bullish"):
        score += 6; factors.append("short+med timeframes bullish")

    # OBV — accumulation during pullback = strong hands holding
    if obv_sig in ("confirmed_up", "bullish_divergence"):
        score += 8; factors.append("OBV shows accumulation during pullback")

    # MACD histogram turning up from below = momentum resuming
    if macd_hist and macd_hist > 0:
        score += 5; factors.append("MACD positive — momentum intact")

    # MFI above 50 = net buying pressure
    if mfi_val and mfi_val > 50:
        score += 4; factors.append(f"MFI {mfi_val:.0f} — buying pressure")

    # Relative strength — want stocks outperforming during pullbacks
    if rs and rs.get("outperforming_sector") and rs.get("outperforming_spy"):
        score += 10; factors.append("relative strength leader (beating sector + SPY)")
    elif rs and rs.get("outperforming_spy"):
        score += 5; factors.append("outperforming SPY")

    # Sector tailwind
    if sector_rank and sector_rank.get("momentum_score", 0) > 2:
        score += 8; factors.append(f"hot sector tailwind ({sector_rank['sector']})")
    elif sector_rank and sector_rank.get("momentum_score", 0) > 0.5:
        score += 3

    score = min(score, 97)
    if score < 50:
        return None

    return {
        "setup": "momentum_pullback",
        "ticker": ticker,
        "score": score,
        "detail": _build_thesis(factors),
        "direction": "bullish",
        "strategy": "long_call",
    }


def detect_mean_reversion_csp(ticker: str, a: dict, cash: float,
                               rs: dict | None, sector_rank: dict | None) -> dict | None:
    """Mean reversion CSP: deeply oversold + MFI divergence + sector not dead."""
    rsi_val = a.get("rsi")
    price = a.get("price", 0)
    obv_sig = a.get("obv_signal")
    mfi_val = a.get("mfi")
    mtf = a.get("multi_timeframe", {})

    if price * 100 > cash:
        return None
    if rsi_val is None or rsi_val > 32:
        return None

    score = 42
    factors = []

    if rsi_val < 20:
        score += 18; factors.append(f"extreme oversold RSI {rsi_val:.0f}")
    elif rsi_val < 25:
        score += 10; factors.append(f"deeply oversold RSI {rsi_val:.0f}")
    else:
        score += 4; factors.append(f"oversold RSI {rsi_val:.0f}")

    bb_pct = a.get("bb_pct_b")
    if bb_pct is not None and bb_pct < 0.05:
        score += 8; factors.append("below lower Bollinger Band")

    if obv_sig == "bullish_divergence":
        score += 12; factors.append("OBV divergence — accumulation on the dip")

    if mfi_val and 30 < mfi_val < 50:
        score += 5; factors.append("MFI stabilizing")

    if mtf.get("long") == "up":
        score += 6; factors.append("long-term trend still up — pullback, not breakdown")

    if sector_rank and sector_rank.get("momentum_score", 0) < -4:
        score -= 12; factors.append("WARN: sector collapsing")

    score = min(score, 97)
    if score < 50:
        return None

    strike_target = round(price * 0.92, 2)
    factors.append(f"CSP target strike ~${strike_target:.2f}")
    return {
        "setup": "mean_reversion_csp",
        "ticker": ticker,
        "score": score,
        "detail": _build_thesis(factors),
        "direction": "neutral_bullish",
        "strategy": "cash_secured_put",
    }


def detect_all(ticker: str, analysis: dict, cash: float,
               rs: dict | None = None, sector_rank: dict | None = None) -> list[dict]:
    """Run all multi-factor setup detectors on a ticker."""
    results = []
    for fn in [detect_breakout, detect_oversold_bounce, detect_momentum_pullback]:
        r = fn(ticker, analysis, rs, sector_rank)
        if r:
            results.append(r)
    r = detect_mean_reversion_csp(ticker, analysis, cash, rs, sector_rank)
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

def score_idea(setup: dict, rec: dict, wl_entry: dict | None,
               rs: dict | None = None) -> float:
    """Multi-factor final score 0-100."""
    base = setup.get("score", 50)
    tier = wl_entry.get("tier", 3) if wl_entry else 3
    tier_bonus = {1: 12, 2: 6, 3: 2}.get(tier, 0)
    cost = rec.get("total_cost")
    afford_bonus = 8 if cost and cost < 100 else (4 if cost and cost < 200 else 0)
    rr_str = rec.get("risk_reward", "")
    rr_bonus = 0
    if rr_str and ":" in rr_str:
        try:
            rr_val = float(rr_str.split(":")[1])
            rr_bonus = min(int(rr_val * 6), 15)
        except (ValueError, IndexError):
            pass
    # Relative strength bonus — we want the leaders
    rs_bonus = 0
    if rs:
        if rs.get("outperforming_spy") and rs.get("outperforming_sector"):
            rs_bonus = 10
        elif rs.get("outperforming_spy"):
            rs_bonus = 5
    return min(base * 0.5 + tier_bonus + afford_bonus + rr_bonus + rs_bonus, 99)


# --- Morning Brief Formatter --- #

def format_brief(ideas: list[dict], account: dict, market: dict,
                 all_analyses: dict, sector_report: str,
                 rs_data: dict) -> str:
    """Format the full morning brief with sector analysis and relative strength."""
    lines = []
    w = 76
    lines.append("=" * w)
    lines.append(f" MORNING SCAN — {date.today().strftime('%A, %B %d, %Y')}")
    lines.append(f" Account: ${account['total']:,.0f} | Cash: ${account['cash']:,.0f}"
                 f" | Open: {account['num_open']} | Capacity: {MAX_POSITIONS - account['num_open']} more")
    lines.append("=" * w)

    # Market pulse with advanced context
    lines.append("\n MARKET PULSE")
    for sym in ["SPY", "QQQ"]:
        if sym in market:
            m = market[sym]
            mtf = m.get("multi_timeframe", {})
            adx_v = m.get("adx")
            hv = m.get("hv_rank", 0)
            trend_str = m["trend"]["direction"]
            adx_str = f" | ADX {adx_v:.0f}" if adx_v else ""
            mtf_str = " | ALL TF aligned" if mtf.get("fully_aligned") else ""
            lines.append(f"   {sym}: ${m['price']:.2f} | RSI {m['rsi']:.0f} | {trend_str}"
                         f"{adx_str} | HV rank {hv:.0f}%{mtf_str}")
    lines.append("")

    # Sector rotation
    if sector_report:
        lines.append(sector_report)
        lines.append("")

    # Trade ideas with full thesis
    if ideas:
        lines.append(f" {'—'*3} TOP TRADE IDEAS {'—'*3}\n")
        for i, idea in enumerate(ideas[:MAX_IDEAS], 1):
            s = idea["setup_data"]
            r = idea["recommendation"]
            a = idea["analysis"]
            t = s["ticker"]
            rs_info = rs_data.get(t, {})

            # Header
            lines.append(f" #{i}  {t} — {s['setup'].replace('_', ' ').title()}"
                         f"  [Score: {idea['final_score']:.0f}]")

            # Price context
            hv = a.get("hv_rank", 0)
            adx_v = a.get("adx")
            mfi_v = a.get("mfi")
            price_line = f"     ${a['price']:.2f} | RSI {a['rsi']:.0f}"
            if adx_v:
                price_line += f" | ADX {adx_v:.0f}"
            if mfi_v:
                price_line += f" | MFI {mfi_v:.0f}"
            price_line += f" | HV rank {hv:.0f}%"
            lines.append(price_line)

            # Relative strength
            rs_vs_spy = rs_info.get("rs_vs_spy")
            rs_vs_sec = rs_info.get("rs_vs_sector")
            if rs_vs_spy or rs_vs_sec:
                rs_parts = []
                if rs_vs_spy:
                    rs_parts.append(f"vs SPY: {rs_vs_spy['rs_change_pct']:+.1f}%")
                if rs_vs_sec:
                    rs_parts.append(f"vs sector: {rs_vs_sec['rs_change_pct']:+.1f}%")
                lines.append(f"     Relative strength: {' | '.join(rs_parts)}")

            # Thesis
            lines.append(f"     THESIS: {s['detail']}")

            # Trade recommendation
            if r.get("buy_strike") is not None or r.get("sell_strike") is not None:
                sname = s["strategy"].replace("_", " ").upper()
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
        lines.append(" No high-conviction setups today. Patience is a strategy.")
        lines.append(" (Setups require multi-factor confirmation: technicals + money flow")
        lines.append("  + sector strength + relative strength alignment)\n")

    # Watchlist notes with richer context
    lines.append(f" {'—'*3} WATCHLIST NOTES {'—'*3}")
    noted = 0
    for ticker, a in sorted(all_analyses.items()):
        if any(ticker == idea["setup_data"]["ticker"] for idea in ideas):
            continue
        rsi_val = a.get("rsi")
        if rsi_val is None:
            continue
        obv_sig = a.get("obv_signal", "")
        macd_cross = a.get("macd_cross", "")
        trend = a.get("trend", {}).get("direction", "?")
        note = ""
        if obv_sig == "bullish_divergence" and rsi_val < 45:
            note = f"RSI {rsi_val:.0f} — OBV bullish divergence, watch for reversal"
        elif macd_cross == "bullish" and trend in ("uptrend", "strong_uptrend"):
            note = f"RSI {rsi_val:.0f} — fresh MACD bullish cross, momentum building"
        elif rsi_val > 68:
            note = f"RSI {rsi_val:.0f} — overbought, wait for pullback"
        elif rsi_val < 35:
            note = f"RSI {rsi_val:.0f} — approaching oversold, on watch"
        elif trend in ("uptrend", "strong_uptrend"):
            ma20 = a.get("ma_20")
            note = f"RSI {rsi_val:.0f}, {trend}" + (f", pullback entry at 20MA ${ma20:.0f}" if ma20 else "")
        else:
            continue
        lines.append(f"   {ticker}: {note}")
        noted += 1
        if noted >= 8:
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
    """Run the full morning scan with sector rotation and relative strength."""
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

    # Tickers: core + dynamic discovery
    if tickers is None:
        core_tickers = screener.get_tickers()
        try:
            disc_data = stock_discovery.load_discovery_data()
            disc_tickers = disc_data.get("discovery_tickers", [])
            if disc_tickers:
                print(f"  Discovery watchlist: {len(disc_tickers)} stocks from last scan")
        except Exception:
            disc_tickers = []
        tickers = list(dict.fromkeys(core_tickers + disc_tickers))
    if "SPY" not in tickers:
        tickers.append("SPY")
    if "QQQ" not in tickers:
        tickers.append("QQQ")

    # Fetch stock data
    print(f"  Fetching data for {len(tickers)} tickers...")
    price_data = fetch_all_data(tickers)
    print(f"  Got data for {len(price_data)}/{len(tickers)} tickers.")

    if not price_data:
        print("  ERROR: No data retrieved. Check internet connection.")
        return

    # Fetch sector data
    print("  Analyzing sector rotation...")
    sector_data = sector_analysis.fetch_sector_data()
    sector_rankings = sector_analysis.sector_performance(sector_data) if sector_data else []
    rotation = sector_analysis.identify_rotation(sector_rankings) if sector_rankings else {}
    sector_report = sector_analysis.format_sector_report(sector_rankings, rotation) if sector_rankings else ""

    # Build sector lookup for quick access
    sector_lookup = {}
    for r in sector_rankings:
        sector_lookup[r["etf"]] = r

    # Run technical analysis
    print("  Running advanced technical analysis...")
    all_analyses = {}
    for t, df in price_data.items():
        try:
            all_analyses[t] = indicators.analyze(df)
        except Exception as e:
            print(f"    WARN: Analysis failed for {t}: {e}")

    # Relative strength analysis
    print("  Computing relative strength rankings...")
    spy_df = price_data.get("SPY")
    rs_data = sector_analysis.stock_relative_strength(price_data, sector_data, spy_df)

    # Market context
    market = {}
    for sym in ["SPY", "QQQ"]:
        if sym in all_analyses:
            market[sym] = all_analyses[sym]

    # Detect setups with full context
    print("  Scanning for multi-factor setups...")
    raw_ideas = []
    for t, a in all_analyses.items():
        rs = rs_data.get(t)
        # Find this stock's sector ranking
        sec_etf = sector_analysis.STOCK_TO_SECTOR.get(t)
        if sec_etf is None:
            disc_data = stock_discovery.load_discovery_data()
            sec_etf = disc_data.get("sector_map", {}).get(t)
            if sec_etf:
                sector_analysis.STOCK_TO_SECTOR[t] = sec_etf
        sec_rank = sector_lookup.get(sec_etf)
        setups = detect_all(t, a, account["cash"], rs, sec_rank)
        for s in setups:
            # Skip low-conviction oversold bounces — backtest shows they lose money
            if s["setup"] == "oversold_bounce" and s["score"] < 70:
                continue
            raw_ideas.append({"setup_data": s, "analysis": a})

    print(f"  Found {len(raw_ideas)} setups passing multi-factor filter.\n")

    # Fetch options chains for top candidates (unless --fast)
    raw_ideas.sort(key=lambda x: x["setup_data"]["score"], reverse=True)
    top_ideas = raw_ideas[:MAX_IDEAS + 3]

    for idea in top_ideas:
        t = idea["setup_data"]["ticker"]
        wl = screener.get_watchlist_entry(t)
        rs = rs_data.get(t)

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
        idea["final_score"] = score_idea(idea["setup_data"], rec, wl, rs)

    # Re-sort by final score
    top_ideas.sort(key=lambda x: x.get("final_score", 0), reverse=True)

    # Output
    brief = format_brief(top_ideas, account, market, all_analyses,
                         sector_report, rs_data)
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
