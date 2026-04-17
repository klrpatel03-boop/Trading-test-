#!/usr/bin/env python3
"""
Dynamic stock discovery engine for options swing trading.
Scans the entire US market via yfinance screeners, filters for
options-tradeable high-beta swing candidates, and produces a
daily dynamic watchlist that feeds into alert_bot.py and morning_scan.py.

Usage:
  python stock_discovery.py --full    # complete scan with options check (~3 min)
  python stock_discovery.py --quick   # screeners + filters only (~30 sec)
  python stock_discovery.py --show    # display cached watchlist
"""

import argparse
import json
import sys
import time
from datetime import datetime, date
from pathlib import Path

import numpy as np
import yfinance as yf

import indicators
import screener

DISCOVERY_FILE = Path(__file__).parent / "discovery_data.json"

MIN_MARKET_CAP = 500_000_000
MIN_AVG_VOLUME = 2_000_000
MIN_PRICE = 5.0
MIN_ATR_PCT = 3.0
MAX_DISCOVERY = 15
VALID_EXCHANGES = {"NMS", "NYQ", "NGM", "NCM", "ASE", "PCX"}

YF_SECTOR_TO_ETF = {
    "Technology": "XLK",
    "Consumer Cyclical": "XLY",
    "Communication Services": "XLC",
    "Financial Services": "XLF",
    "Healthcare": "XLV",
    "Energy": "XLE",
    "Industrials": "XLI",
    "Consumer Defensive": "XLP",
    "Real Estate": "XLRE",
    "Utilities": "XLU",
    "Basic Materials": "XLB",
}


# --- Screener Queries --- #

def _safe_screen(query, **kwargs) -> list[dict]:
    """Run a yf.screen() call with error handling."""
    try:
        result = yf.screen(query, **kwargs)
        return result.get("quotes", []) if isinstance(result, dict) else []
    except Exception as e:
        print(f"    WARN: Screen '{query}' failed: {e}")
        return []


def scan_predefined_screens() -> list[dict]:
    """Pull candidates from predefined yfinance screeners."""
    all_quotes = []

    screens = [
        ("day_losers", 100),
        ("most_actives", 100),
        ("day_gainers", 50),
        ("aggressive_small_caps", 50),
        ("most_shorted_stocks", 50),
    ]

    for name, count in screens:
        print(f"    Scanning {name}...")
        quotes = _safe_screen(name, count=count)
        all_quotes.extend(quotes)
        time.sleep(0.5)

    return all_quotes


def scan_custom_queries() -> list[dict]:
    """Run custom EquityQuery screens for specific swing setups."""
    all_quotes = []

    try:
        from yfinance.screener import EquityQuery
        from yfinance.const import PREDEFINED_SCREENER_BODY_MAP

        # Beaten-down large caps (mean reversion candidates)
        print("    Scanning beaten-down large caps...")
        try:
            q = EquityQuery("and", [
                EquityQuery("lt", ["percentchange", -3]),
                EquityQuery("gte", ["intradaymarketcap", 2_000_000_000]),
                EquityQuery("gt", ["dayvolume", 5_000_000]),
            ])
            result = yf.screen(q, size=50)
            all_quotes.extend(result.get("quotes", []) if isinstance(result, dict) else [])
        except Exception as e:
            print(f"    WARN: Custom query failed: {e}")
        time.sleep(0.5)

    except ImportError:
        print("    WARN: EquityQuery not available in this yfinance version")

    return all_quotes


def run_full_screener() -> list[dict]:
    """Run all screener queries and deduplicate."""
    print("  Running market screeners...")
    predefined = scan_predefined_screens()
    custom = scan_custom_queries()

    all_quotes = predefined + custom

    # Deduplicate by symbol
    seen = set()
    unique = []
    for q in all_quotes:
        sym = q.get("symbol", "")
        if sym and sym not in seen:
            seen.add(sym)
            unique.append(q)

    print(f"  Screeners returned {len(unique)} unique stocks (from {len(all_quotes)} total)")
    return unique


# --- Filtering --- #

def filter_candidates(quotes: list[dict]) -> list[dict]:
    """Apply hard filters to screener results. Cheapest checks first."""
    core_tickers = set(screener.get_tickers())
    passed = []

    for q in quotes:
        sym = q.get("symbol", "")
        if not sym:
            continue

        # Market cap
        cap = q.get("marketCap", 0)
        if cap < MIN_MARKET_CAP:
            continue

        # Average volume
        avg_vol = q.get("averageDailyVolume3Month", 0)
        if avg_vol < MIN_AVG_VOLUME:
            continue

        # Price floor
        price = q.get("regularMarketPrice", 0)
        if price < MIN_PRICE:
            continue

        # US exchange only
        exchange = q.get("exchange", "")
        if exchange not in VALID_EXCHANGES:
            continue

        # Equity only (skip ETFs, ADRs)
        qtype = q.get("quoteType", "")
        if qtype != "EQUITY":
            continue

        # Skip if already in core watchlist
        if sym in core_tickers:
            continue

        passed.append(q)

    print(f"  {len(passed)} passed hard filters (cap/vol/price/exchange)")
    return passed


def check_options_available(symbols: list[str], max_checks: int = 30) -> set[str]:
    """Check which symbols have active options chains."""
    has_options = set()
    for sym in symbols[:max_checks]:
        try:
            tk = yf.Ticker(sym)
            exps = tk.options
            if exps and len(exps) >= 2:
                has_options.add(sym)
        except Exception:
            pass
        time.sleep(0.3)
    print(f"  {len(has_options)}/{min(len(symbols), max_checks)} have options chains")
    return has_options


def compute_volatility(symbols: list[str]) -> dict[str, dict]:
    """Batch download and compute ATR% + technical analysis for candidates."""
    if not symbols:
        return {}

    try:
        data = yf.download(symbols, period="3mo", group_by="ticker",
                           threads=True, progress=False)
    except Exception as e:
        print(f"    WARN: Batch download failed: {e}")
        return {}

    results = {}
    for sym in symbols:
        try:
            if len(symbols) == 1:
                df = data.dropna(subset=["Close"])
            else:
                df = data[sym].dropna(subset=["Close"])
            if len(df) < 30:
                continue
            analysis = indicators.analyze(df)
            atr_pct = analysis.get("atr_pct")
            if atr_pct and atr_pct >= MIN_ATR_PCT:
                results[sym] = analysis
        except Exception:
            pass

    print(f"  {len(results)} have ATR% >= {MIN_ATR_PCT}% (swing enough)")
    return results


# --- Scoring --- #

def score_candidate(sym: str, analysis: dict, quote: dict) -> float:
    """Score a candidate 0-100 for swing trading potential."""
    score = 0.0

    # ATR% (30 weight) — higher = more swing potential
    atr_pct = analysis.get("atr_pct", 0) or 0
    score += min(atr_pct * 4, 30)

    # Volume/liquidity (20 weight)
    avg_vol = quote.get("averageDailyVolume3Month", 0)
    if avg_vol > 20_000_000:
        score += 20
    elif avg_vol > 10_000_000:
        score += 15
    elif avg_vol > 5_000_000:
        score += 10
    else:
        score += 5

    # Setup proximity (25 weight) — is it near an entry?
    rsi = analysis.get("rsi", 50) or 50
    if rsi < 30:
        score += 25
    elif rsi < 40:
        score += 18
    elif rsi < 50:
        score += 8
    elif rsi > 75:
        score += 3  # overbought = future pullback candidate

    # Relative strength / momentum (15 weight)
    trend = analysis.get("trend", {}).get("direction", "")
    if trend == "strong_uptrend":
        score += 12
    elif trend == "uptrend":
        score += 8
    elif trend == "strong_downtrend":
        score += 5  # oversold bounce candidate

    obv = analysis.get("obv_signal", "")
    if obv == "bullish_divergence":
        score += 3

    # Market cap size (10 weight) — mid-cap sweet spot for swings
    cap = quote.get("marketCap", 0)
    if 1e9 < cap < 50e9:
        score += 10  # mid-cap = highest swing potential
    elif 500e6 < cap < 1e9:
        score += 8
    elif cap > 50e9:
        score += 5

    return min(score, 100)


# --- Sector Mapping --- #

def map_ticker_to_sector_etf(symbol: str) -> str | None:
    """Map a ticker to its GICS sector ETF using Yahoo Finance data."""
    try:
        info = yf.Ticker(symbol).info
        sector = info.get("sector", "")
        return YF_SECTOR_TO_ETF.get(sector)
    except Exception:
        return None


def batch_map_sectors(symbols: list[str], quotes: list[dict]) -> dict[str, str]:
    """Map multiple tickers to sector ETFs, using quote data where possible."""
    mapping = {}
    # Try to get sector from quote data first (free)
    quote_lookup = {q["symbol"]: q for q in quotes if "symbol" in q}
    for sym in symbols:
        q = quote_lookup.get(sym, {})
        sector = q.get("sector", "")
        if sector and sector in YF_SECTOR_TO_ETF:
            mapping[sym] = YF_SECTOR_TO_ETF[sector]
    # For any missing, do individual lookups (but limit to avoid rate limits)
    missing = [s for s in symbols if s not in mapping]
    for sym in missing[:10]:
        etf = map_ticker_to_sector_etf(sym)
        if etf:
            mapping[sym] = etf
        time.sleep(0.3)
    return mapping


# --- Persistence --- #

def load_discovery_data() -> dict:
    if DISCOVERY_FILE.exists():
        try:
            with open(DISCOVERY_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "last_scan": None,
        "core_tickers": [],
        "discovery_tickers": [],
        "proven_tickers": [],
        "ticker_details": {},
        "ticker_history": {},
        "sector_map": {},
        "scan_stats": {},
    }


def save_discovery_data(data: dict) -> None:
    with open(DISCOVERY_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)


def record_trade_outcome(symbol: str, setup: str, pnl_pct: float) -> None:
    """Record a trade outcome for the refinement loop."""
    data = load_discovery_data()
    history = data.setdefault("ticker_history", {})
    entry = history.setdefault(symbol, {"trades": [], "win_count": 0, "loss_count": 0})
    entry["trades"].append({
        "date": date.today().isoformat(),
        "setup": setup,
        "pnl_pct": round(pnl_pct, 2),
    })
    if pnl_pct > 0:
        entry["win_count"] += 1
        entry["loss_count"] = 0  # reset consecutive losses
    else:
        entry["loss_count"] += 1
    save_discovery_data(data)


def promote_demote() -> dict:
    """Auto-promote winners, auto-demote losers."""
    data = load_discovery_data()
    promoted = []
    demoted = []
    for sym, hist in data.get("ticker_history", {}).items():
        if hist.get("win_count", 0) >= 3 and sym not in data.get("proven_tickers", []):
            promoted.append(sym)
        if hist.get("loss_count", 0) >= 3:
            demoted.append(sym)

    if promoted:
        data.setdefault("proven_tickers", []).extend(promoted)
    if demoted:
        data["discovery_tickers"] = [t for t in data.get("discovery_tickers", []) if t not in demoted]
    save_discovery_data(data)
    return {"promoted": promoted, "demoted": demoted}


def get_combined_watchlist() -> list[str]:
    """Return core + discovery tickers, deduplicated."""
    core = screener.get_tickers()
    data = load_discovery_data()
    discovery = data.get("discovery_tickers", [])
    proven = data.get("proven_tickers", [])
    return list(dict.fromkeys(core + proven + discovery))


# --- Main Pipeline --- #

def build_dynamic_watchlist(quick: bool = False) -> dict:
    """
    Run the full discovery pipeline.
    Returns dict with discovery_tickers, details, scan stats.
    """
    print(f"\n{'='*60}")
    print(f" STOCK DISCOVERY SCAN — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    # 1. Run screeners
    raw_quotes = run_full_screener()

    # 2. Apply hard filters
    candidates = filter_candidates(raw_quotes)
    candidate_syms = [q["symbol"] for q in candidates]

    if quick:
        # Quick mode: skip options check and ATR calculation
        # Just score based on quote data
        print("  (Quick mode — skipping options/ATR checks)")
        scored = []
        for q in candidates[:MAX_DISCOVERY * 2]:
            sym = q["symbol"]
            dummy_analysis = {"atr_pct": 4.0, "rsi": 50, "trend": {"direction": "unknown"},
                              "obv_signal": "neutral", "price": q.get("regularMarketPrice", 0)}
            s = score_candidate(sym, dummy_analysis, q)
            scored.append((sym, s, q, dummy_analysis))
    else:
        # 3. Check options availability
        print("  Checking options availability...")
        has_options = check_options_available(candidate_syms)
        optionable = [q for q in candidates if q["symbol"] in has_options]
        optionable_syms = [q["symbol"] for q in optionable]

        # 4. Compute ATR% and run technical analysis
        print("  Running technical analysis...")
        analyses = compute_volatility(optionable_syms)

        # 5. Score and rank
        scored = []
        quote_lookup = {q["symbol"]: q for q in optionable}
        for sym, analysis in analyses.items():
            q = quote_lookup.get(sym, {})
            s = score_candidate(sym, analysis, q)
            scored.append((sym, s, q, analysis))

    # Sort by score
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:MAX_DISCOVERY]

    # 6. Map sectors
    top_syms = [s[0] for s in top]
    print("  Mapping sectors...")
    sector_map = batch_map_sectors(top_syms, raw_quotes)

    # 7. Build result
    discovery_tickers = [s[0] for s in top]
    details = {}
    for sym, score, quote, analysis in top:
        details[sym] = {
            "score": round(score, 1),
            "price": quote.get("regularMarketPrice", analysis.get("price", 0)),
            "market_cap": quote.get("marketCap", 0),
            "avg_volume": quote.get("averageDailyVolume3Month", 0),
            "rsi": analysis.get("rsi"),
            "atr_pct": analysis.get("atr_pct"),
            "trend": analysis.get("trend", {}).get("direction", "?"),
            "sector_etf": sector_map.get(sym),
        }

    # 8. Persist
    data = load_discovery_data()
    data["last_scan"] = datetime.now().isoformat()
    data["core_tickers"] = screener.get_tickers()
    data["discovery_tickers"] = discovery_tickers
    data["ticker_details"] = details
    data["sector_map"].update(sector_map)
    data["scan_stats"] = {
        "total_scanned": len(raw_quotes),
        "passed_filters": len(candidates),
        "options_checked": len(scored),
        "final_watchlist": len(discovery_tickers),
    }
    # Update history
    for sym in discovery_tickers:
        hist = data.setdefault("ticker_history", {}).setdefault(sym, {
            "first_discovered": date.today().isoformat(),
            "times_discovered": 0,
            "trades": [], "win_count": 0, "loss_count": 0,
        })
        hist["times_discovered"] = hist.get("times_discovered", 0) + 1

    save_discovery_data(data)

    # 9. Print summary
    print(f"\n  {'='*50}")
    print(f"  DISCOVERY RESULTS: {len(discovery_tickers)} candidates")
    print(f"  {'='*50}")
    print(f"  {'Ticker':<8} {'Score':>6} {'Price':>8} {'RSI':>5} {'ATR%':>6} {'Trend':<15} {'Sector'}")
    print(f"  {'-'*8} {'-'*6} {'-'*8} {'-'*5} {'-'*6} {'-'*15} {'-'*5}")
    for sym in discovery_tickers:
        d = details[sym]
        rsi_s = f"{d['rsi']:.0f}" if d['rsi'] else "?"
        atr_s = f"{d['atr_pct']:.1f}" if d['atr_pct'] else "?"
        print(f"  {sym:<8} {d['score']:>5.0f} ${d['price']:>7.2f} {rsi_s:>5} {atr_s:>5}% {d['trend']:<15} {d.get('sector_etf', '?')}")
    print()

    return {
        "discovery_tickers": discovery_tickers,
        "details": details,
        "sector_map": sector_map,
        "scan_stats": data["scan_stats"],
    }


# --- CLI --- #

def main():
    parser = argparse.ArgumentParser(description="Dynamic stock discovery scanner")
    parser.add_argument("--full", action="store_true", help="Full scan with options check (~3 min)")
    parser.add_argument("--quick", action="store_true", help="Quick scan, skip options/ATR (~30 sec)")
    parser.add_argument("--show", action="store_true", help="Show cached discovery watchlist")
    args = parser.parse_args()

    if args.show:
        data = load_discovery_data()
        if not data.get("discovery_tickers"):
            print("\n  No cached discovery data. Run --quick or --full first.\n")
            return
        print(f"\n  Cached discovery from {data.get('last_scan', '?')}")
        print(f"  Scanned {data.get('scan_stats', {}).get('total_scanned', '?')} stocks")
        print(f"  Discovery list: {', '.join(data['discovery_tickers'])}")
        print(f"  Proven tickers: {', '.join(data.get('proven_tickers', [])) or 'none yet'}\n")
        return

    build_dynamic_watchlist(quick=args.quick or not args.full)


if __name__ == "__main__":
    main()
