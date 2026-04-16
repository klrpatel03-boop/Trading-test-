#!/usr/bin/env python3
"""
Sector rotation and relative strength analysis.
Tracks money flows across market sectors, identifies hot/cold sectors,
and ranks stocks by relative performance vs their sector and SPY.
"""

import numpy as np
import pandas as pd
import yfinance as yf

import indicators

# The 11 GICS sectors via SPDR ETFs + broad market
SECTOR_ETFS = {
    "XLK": "Technology",
    "XLV": "Health Care",
    "XLF": "Financials",
    "XLE": "Energy",
    "XLI": "Industrials",
    "XLC": "Communication Svcs",
    "XLY": "Consumer Disc.",
    "XLP": "Consumer Staples",
    "XLRE": "Real Estate",
    "XLU": "Utilities",
    "XLB": "Materials",
}

# Map each watchlist stock to its sector ETF for relative strength
STOCK_TO_SECTOR = {
    "AAPL": "XLK", "MSFT": "XLK", "NVDA": "XLK", "AMD": "XLK", "GOOGL": "XLC",
    "META": "XLC", "AMZN": "XLY", "TSLA": "XLY", "SHOP": "XLY",
    "COIN": "XLF", "XYZ": "XLF", "SOFI": "XLF", "CRWD": "XLK",
    "PLTR": "XLK", "MARA": "XLF", "ROKU": "XLC",
    "SPY": "SPY", "QQQ": "QQQ", "SMH": "XLK", "XLE": "XLE",
    "XLF": "XLF", "GLD": "GLD", "ARKK": "XLK",
}


def fetch_sector_data(period: str = "6mo") -> dict[str, pd.DataFrame]:
    """Download price data for all sector ETFs + SPY."""
    tickers = list(SECTOR_ETFS.keys()) + ["SPY"]
    try:
        data = yf.download(tickers, period=period, group_by="ticker",
                           threads=True, progress=False)
        result = {}
        for t in tickers:
            try:
                df = data[t].dropna(subset=["Close"])
                if len(df) >= 20:
                    result[t] = df
            except Exception:
                pass
        return result
    except Exception:
        return {}


def sector_performance(sector_data: dict[str, pd.DataFrame]) -> list[dict]:
    """
    Rank sectors by multi-timeframe momentum.
    Returns sorted list: strongest to weakest.
    """
    rankings = []
    spy_close = sector_data.get("SPY", pd.DataFrame()).get("Close")

    for etf, name in SECTOR_ETFS.items():
        df = sector_data.get(etf)
        if df is None or "Close" not in df.columns:
            continue

        close = df["Close"]
        price = close.iloc[-1]

        # Performance over multiple windows
        def _pct(n):
            if len(close) >= n:
                return round((price / close.iloc[-n] - 1) * 100, 2)
            return None

        perf_1w = _pct(5)
        perf_1m = _pct(21)
        perf_3m = _pct(63)

        # Momentum score: weighted blend
        scores = []
        if perf_1w is not None:
            scores.append(perf_1w * 0.4)
        if perf_1m is not None:
            scores.append(perf_1m * 0.35)
        if perf_3m is not None:
            scores.append(perf_3m * 0.25)
        momentum_score = sum(scores) if scores else 0

        # Relative strength vs SPY
        rs_vs_spy = None
        if spy_close is not None and len(spy_close) >= 21 and len(close) >= 21:
            rs = indicators.relative_strength(close, spy_close, 21)
            rs_vs_spy = rs

        # Volume trend (is volume increasing = money flowing in?)
        volume = df["Volume"]
        vol_5d = volume.tail(5).mean()
        vol_20d = volume.tail(20).mean()
        vol_trend = round(vol_5d / vol_20d, 2) if vol_20d > 0 else 1.0

        # RSI for overbought/oversold context
        rsi_val = indicators.rsi(close).iloc[-1]

        # MACD for trend momentum
        macd_data = indicators.macd(close)
        macd_hist = macd_data["histogram"].iloc[-1]

        rankings.append({
            "etf": etf,
            "sector": name,
            "price": round(price, 2),
            "perf_1w": perf_1w,
            "perf_1m": perf_1m,
            "perf_3m": perf_3m,
            "momentum_score": round(momentum_score, 2),
            "rs_vs_spy": rs_vs_spy,
            "vol_trend": vol_trend,
            "rsi": round(rsi_val, 1) if not np.isnan(rsi_val) else None,
            "macd_bullish": not np.isnan(macd_hist) and macd_hist > 0,
            "status": _classify_sector(momentum_score, rsi_val, vol_trend, macd_hist),
        })

    rankings.sort(key=lambda x: x["momentum_score"], reverse=True)
    return rankings


def _classify_sector(momentum: float, rsi: float, vol_trend: float, macd_hist: float) -> str:
    """Classify sector health into actionable labels."""
    if np.isnan(rsi):
        return "unknown"
    if momentum > 3 and rsi < 70 and vol_trend > 1.0:
        return "HOT — strong inflows"
    if momentum > 1.5 and not np.isnan(macd_hist) and macd_hist > 0:
        return "leading"
    if momentum > 0:
        return "positive"
    if momentum > -1.5:
        return "neutral"
    if rsi < 35:
        return "oversold — watch for reversal"
    return "lagging"


def stock_relative_strength(stock_data: dict[str, pd.DataFrame],
                             sector_data: dict[str, pd.DataFrame],
                             spy_data: pd.DataFrame | None) -> dict[str, dict]:
    """
    Calculate relative strength for each stock vs its sector ETF and vs SPY.
    Returns dict of ticker -> {rs_vs_sector, rs_vs_spy, sector_etf, outperforming}.
    """
    results = {}

    for ticker, df in stock_data.items():
        if "Close" not in df.columns or len(df) < 21:
            continue

        close = df["Close"]
        sector_etf = STOCK_TO_SECTOR.get(ticker)

        rs_sector = None
        if sector_etf and sector_etf in sector_data:
            sec_close = sector_data[sector_etf]["Close"]
            if len(sec_close) >= 21:
                rs_sector = indicators.relative_strength(close, sec_close, 21)

        rs_spy = None
        if spy_data is not None and "Close" in spy_data.columns:
            spy_close = spy_data["Close"]
            if len(spy_close) >= 21:
                rs_spy = indicators.relative_strength(close, spy_close, 21)

        results[ticker] = {
            "sector_etf": sector_etf,
            "rs_vs_sector": rs_sector,
            "rs_vs_spy": rs_spy,
            "outperforming_sector": rs_sector["outperforming"] if rs_sector else None,
            "outperforming_spy": rs_spy["outperforming"] if rs_spy else None,
        }

    return results


def identify_rotation(rankings: list[dict]) -> dict:
    """
    Identify sector rotation patterns.
    Returns a summary of where money is flowing.
    """
    if not rankings:
        return {"pattern": "unknown", "leaders": [], "laggards": []}

    leaders = [r for r in rankings if r["momentum_score"] > 1.5]
    laggards = [r for r in rankings if r["momentum_score"] < -1.5]
    hot = [r for r in rankings if "HOT" in r.get("status", "")]

    # Detect rotation patterns
    leader_sectors = {r["sector"] for r in leaders}
    laggard_sectors = {r["sector"] for r in laggards}

    if {"Technology", "Consumer Disc."} & leader_sectors and {"Utilities", "Consumer Staples"} & laggard_sectors:
        pattern = "risk-on"
        desc = "Money flowing into growth/tech, out of defensives"
    elif {"Utilities", "Consumer Staples", "Health Care"} & leader_sectors and {"Technology"} & laggard_sectors:
        pattern = "risk-off"
        desc = "Money rotating into defensives, out of growth"
    elif {"Energy", "Materials", "Industrials"} & leader_sectors:
        pattern = "reflation"
        desc = "Money flowing into cyclicals/commodities — inflation trade"
    elif {"Financials"} & leader_sectors:
        pattern = "rate-play"
        desc = "Financials leading — rates/yield curve trade"
    else:
        pattern = "mixed"
        desc = "No clear rotation pattern"

    return {
        "pattern": pattern,
        "description": desc,
        "leaders": [f"{r['etf']} ({r['sector']}: {r['perf_1w']:+.1f}% 1W)" for r in leaders[:3]],
        "laggards": [f"{r['etf']} ({r['sector']}: {r['perf_1w']:+.1f}% 1W)" for r in laggards[:3]],
        "hot_sectors": [f"{r['etf']} ({r['sector']})" for r in hot],
    }


def format_sector_report(rankings: list[dict], rotation: dict) -> str:
    """Format sector analysis for the morning brief."""
    lines = []
    lines.append(" SECTOR ROTATION ANALYSIS")
    lines.append(f"   Pattern: {rotation['pattern'].upper()} — {rotation['description']}")

    if rotation["hot_sectors"]:
        lines.append(f"   Hot sectors: {', '.join(rotation['hot_sectors'])}")
    if rotation["leaders"]:
        lines.append(f"   Leading: {', '.join(rotation['leaders'])}")
    if rotation["laggards"]:
        lines.append(f"   Lagging: {', '.join(rotation['laggards'])}")

    lines.append("")
    lines.append(f"   {'Sector':<20} {'1W':>6} {'1M':>6} {'3M':>6} {'RSI':>5} {'Vol':>5} {'Status'}")
    lines.append(f"   {'-'*20} {'-'*6} {'-'*6} {'-'*6} {'-'*5} {'-'*5} {'-'*25}")
    for r in rankings:
        w = f"{r['perf_1w']:+.1f}%" if r["perf_1w"] is not None else "  N/A"
        m = f"{r['perf_1m']:+.1f}%" if r["perf_1m"] is not None else "  N/A"
        q = f"{r['perf_3m']:+.1f}%" if r["perf_3m"] is not None else "  N/A"
        rsi_s = f"{r['rsi']:.0f}" if r["rsi"] is not None else "N/A"
        lines.append(f"   {r['sector']:<20} {w:>6} {m:>6} {q:>6} {rsi_s:>5} {r['vol_trend']:>5.2f} {r['status']}")

    return "\n".join(lines)
