#!/usr/bin/env python3
"""
Technical indicator calculations for options swing trading.
All functions operate on pandas Series/DataFrames from yfinance.
"""

import numpy as np
import pandas as pd


def sma(series: pd.Series, period: int) -> pd.Series:
    """Simple Moving Average."""
    return series.rolling(window=period, min_periods=period).mean()


def ema(series: pd.Series, period: int) -> pd.Series:
    """Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()


def rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index (Wilder's method)."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


def atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    """Average True Range."""
    prev_close = close.shift(1)
    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low - prev_close).abs(),
    ], axis=1).max(axis=1)
    return tr.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()


def bollinger_bands(series: pd.Series, period: int = 20, std_dev: float = 2.0) -> dict:
    """Bollinger Bands — returns dict with 'upper', 'middle', 'lower', 'pct_b'."""
    middle = sma(series, period)
    std = series.rolling(window=period, min_periods=period).std()
    upper = middle + std_dev * std
    lower = middle - std_dev * std
    pct_b = (series - lower) / (upper - lower)
    return {"upper": upper, "middle": middle, "lower": lower, "pct_b": pct_b}


def volume_ratio(volume: pd.Series, period: int = 20) -> pd.Series:
    """Current volume relative to average volume (1.0 = average)."""
    avg_vol = sma(volume, period)
    return volume / avg_vol.replace(0, np.nan)


def consolidation_score(high: pd.Series, low: pd.Series, lookback: int = 10) -> float:
    """
    Measure how tight the price range has been over the lookback period.
    Lower score = tighter consolidation. Returns the range as a % of the midpoint.
    """
    recent_high = high.tail(lookback).max()
    recent_low = low.tail(lookback).min()
    midpoint = (recent_high + recent_low) / 2
    if midpoint == 0:
        return float("inf")
    return ((recent_high - recent_low) / midpoint) * 100


def support_resistance(close: pd.Series, high: pd.Series, low: pd.Series,
                       lookback: int = 60) -> dict:
    """
    Estimate key support and resistance levels from recent price action.
    Uses rolling min/max and pivot points.
    """
    recent = close.tail(lookback)
    recent_high = high.tail(lookback)
    recent_low = low.tail(lookback)

    # Key levels
    highest = recent_high.max()
    lowest = recent_low.min()
    current = close.iloc[-1]

    # Simple pivot-based S/R
    pivot = (highest + lowest + current) / 3
    r1 = 2 * pivot - lowest
    s1 = 2 * pivot - highest
    r2 = pivot + (highest - lowest)
    s2 = pivot - (highest - lowest)

    return {
        "resistance_2": round(r2, 2),
        "resistance_1": round(r1, 2),
        "pivot": round(pivot, 2),
        "support_1": round(s1, 2),
        "support_2": round(s2, 2),
        "range_high": round(highest, 2),
        "range_low": round(lowest, 2),
    }


def trend_strength(close: pd.Series) -> dict:
    """
    Assess trend direction and strength based on moving average alignment.
    Returns trend direction, strength score, and MA values.
    """
    ma_20 = sma(close, 20).iloc[-1]
    ma_50 = sma(close, 50).iloc[-1]
    price = close.iloc[-1]

    if np.isnan(ma_20) or np.isnan(ma_50):
        return {"direction": "unknown", "strength": 0, "ma_20": None, "ma_50": None}

    # Score: +2 for price > 20MA, +1 for 20MA > 50MA, +1 for price > 50MA
    score = 0
    if price > ma_20:
        score += 2
    if ma_20 > ma_50:
        score += 1
    if price > ma_50:
        score += 1
    # Negative mirror
    if price < ma_20:
        score -= 2
    if ma_20 < ma_50:
        score -= 1
    if price < ma_50:
        score -= 1

    if score >= 3:
        direction = "strong_uptrend"
    elif score >= 1:
        direction = "uptrend"
    elif score <= -3:
        direction = "strong_downtrend"
    elif score <= -1:
        direction = "downtrend"
    else:
        direction = "sideways"

    return {
        "direction": direction,
        "strength": score,
        "ma_20": round(ma_20, 2),
        "ma_50": round(ma_50, 2),
    }


def analyze(df: pd.DataFrame) -> dict:
    """
    Run full technical analysis on a yfinance DataFrame.
    Returns a dict of all indicator values at the most recent bar.
    """
    close = df["Close"]
    high = df["High"]
    low = df["Low"]
    volume = df["Volume"]
    price = close.iloc[-1]

    rsi_val = rsi(close).iloc[-1]
    atr_val = atr(high, low, close).iloc[-1]
    bb = bollinger_bands(close)
    vol_ratio = volume_ratio(volume).iloc[-1]
    trend = trend_strength(close)
    sr = support_resistance(close, high, low)
    consol = consolidation_score(high, low, lookback=10)

    ma_20 = sma(close, 20).iloc[-1]
    ma_50 = sma(close, 50).iloc[-1]

    # Distance from MAs (%)
    dist_20ma = ((price - ma_20) / ma_20 * 100) if not np.isnan(ma_20) and ma_20 != 0 else None
    dist_50ma = ((price - ma_50) / ma_50 * 100) if not np.isnan(ma_50) and ma_50 != 0 else None

    return {
        "price": round(price, 2),
        "rsi": round(rsi_val, 1) if not np.isnan(rsi_val) else None,
        "atr": round(atr_val, 2) if not np.isnan(atr_val) else None,
        "atr_pct": round(atr_val / price * 100, 2) if not np.isnan(atr_val) and price > 0 else None,
        "ma_20": round(ma_20, 2) if not np.isnan(ma_20) else None,
        "ma_50": round(ma_50, 2) if not np.isnan(ma_50) else None,
        "dist_20ma_pct": round(dist_20ma, 2) if dist_20ma is not None else None,
        "dist_50ma_pct": round(dist_50ma, 2) if dist_50ma is not None else None,
        "bb_upper": round(bb["upper"].iloc[-1], 2) if not np.isnan(bb["upper"].iloc[-1]) else None,
        "bb_lower": round(bb["lower"].iloc[-1], 2) if not np.isnan(bb["lower"].iloc[-1]) else None,
        "bb_pct_b": round(bb["pct_b"].iloc[-1], 2) if not np.isnan(bb["pct_b"].iloc[-1]) else None,
        "volume_ratio": round(vol_ratio, 2) if not np.isnan(vol_ratio) else None,
        "consolidation_pct": round(consol, 2),
        "trend": trend,
        "support_resistance": sr,
    }
