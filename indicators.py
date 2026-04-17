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


# --- Advanced Indicators --- #

def macd(close: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> dict:
    """MACD — trend momentum and crossover detection."""
    ema_fast = ema(close, fast)
    ema_slow = ema(close, slow)
    macd_line = ema_fast - ema_slow
    signal_line = ema(macd_line, signal)
    histogram = macd_line - signal_line
    return {"macd": macd_line, "signal": signal_line, "histogram": histogram}


def adx(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    """Average Directional Index — measures trend strength regardless of direction.
    >25 = strong trend, <20 = weak/no trend."""
    plus_dm = high.diff()
    minus_dm = -low.diff()
    plus_dm = plus_dm.where((plus_dm > minus_dm) & (plus_dm > 0), 0.0)
    minus_dm = minus_dm.where((minus_dm > plus_dm) & (minus_dm > 0), 0.0)
    atr_vals = atr(high, low, close, period)
    plus_di = 100 * (plus_dm.ewm(alpha=1/period, min_periods=period, adjust=False).mean() /
                     atr_vals.replace(0, np.nan))
    minus_di = 100 * (minus_dm.ewm(alpha=1/period, min_periods=period, adjust=False).mean() /
                      atr_vals.replace(0, np.nan))
    dx = 100 * ((plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan))
    return dx.ewm(alpha=1/period, min_periods=period, adjust=False).mean()


def obv(close: pd.Series, volume: pd.Series) -> pd.Series:
    """On-Balance Volume — cumulative volume flow showing accumulation/distribution."""
    direction = np.sign(close.diff())
    return (volume * direction).cumsum()


def obv_trend(close: pd.Series, volume: pd.Series, period: int = 20) -> str:
    """Classify OBV trend vs price trend to detect divergences."""
    obv_vals = obv(close, volume)
    obv_slope = obv_vals.iloc[-1] - obv_vals.iloc[-period] if len(obv_vals) >= period else 0
    price_slope = close.iloc[-1] - close.iloc[-period] if len(close) >= period else 0
    if obv_slope > 0 and price_slope > 0:
        return "confirmed_up"
    elif obv_slope < 0 and price_slope < 0:
        return "confirmed_down"
    elif obv_slope > 0 and price_slope <= 0:
        return "bullish_divergence"
    elif obv_slope < 0 and price_slope >= 0:
        return "bearish_divergence"
    return "neutral"


def mfi(high: pd.Series, low: pd.Series, close: pd.Series,
        volume: pd.Series, period: int = 14) -> pd.Series:
    """Money Flow Index — volume-weighted RSI. Detects institutional buying/selling."""
    typical_price = (high + low + close) / 3
    raw_mf = typical_price * volume
    delta = typical_price.diff()
    pos_mf = raw_mf.where(delta > 0, 0.0)
    neg_mf = raw_mf.where(delta <= 0, 0.0)
    pos_sum = pos_mf.rolling(window=period, min_periods=period).sum()
    neg_sum = neg_mf.rolling(window=period, min_periods=period).sum()
    mf_ratio = pos_sum / neg_sum.replace(0, np.nan)
    return 100 - (100 / (1 + mf_ratio))


def relative_strength(stock: pd.Series, benchmark: pd.Series, period: int = 20) -> dict:
    """Relative strength of a stock vs a benchmark (e.g., SPY or sector ETF).
    RS > 1 = outperforming, RS < 1 = underperforming."""
    rs_line = stock / benchmark
    rs_now = rs_line.iloc[-1]
    rs_prev = rs_line.iloc[-period] if len(rs_line) >= period else rs_now
    rs_change = ((rs_now - rs_prev) / rs_prev * 100) if rs_prev != 0 else 0
    # Percentile rank over lookback
    lookback = min(len(rs_line), 252)
    rs_pctile = (rs_line.tail(lookback) < rs_now).sum() / lookback * 100
    return {
        "rs_ratio": round(rs_now, 4),
        "rs_change_pct": round(rs_change, 2),
        "rs_percentile": round(rs_pctile, 1),
        "outperforming": rs_change > 0,
    }


def historical_volatility_rank(close: pd.Series, window: int = 30,
                                lookback: int = 252) -> float:
    """HV rank — proxy for IV rank. Where is current vol vs the past year? 0-100."""
    log_returns = np.log(close / close.shift(1))
    rolling_vol = log_returns.rolling(window=window).std() * np.sqrt(252) * 100
    recent_vol = rolling_vol.iloc[-1]
    if np.isnan(recent_vol):
        return 50.0
    hist = rolling_vol.tail(lookback).dropna()
    if len(hist) < 30:
        return 50.0
    rank = (hist < recent_vol).sum() / len(hist) * 100
    return round(rank, 1)


def roc(series: pd.Series, period: int = 10) -> pd.Series:
    """Rate of Change — momentum as percentage change over N periods."""
    return ((series - series.shift(period)) / series.shift(period).replace(0, np.nan)) * 100


def stochastic(high: pd.Series, low: pd.Series, close: pd.Series,
               k_period: int = 14, d_period: int = 3) -> dict:
    """Stochastic Oscillator — momentum within a trading range."""
    lowest_low = low.rolling(window=k_period).min()
    highest_high = high.rolling(window=k_period).max()
    k = 100 * (close - lowest_low) / (highest_high - lowest_low).replace(0, np.nan)
    d = k.rolling(window=d_period).mean()
    return {"k": k, "d": d}


def accumulation_distribution(high: pd.Series, low: pd.Series,
                               close: pd.Series, volume: pd.Series) -> pd.Series:
    """Accumulation/Distribution Line — measures money flow based on close position in range."""
    clv = ((close - low) - (high - close)) / (high - low).replace(0, np.nan)
    clv = clv.fillna(0)
    return (clv * volume).cumsum()


def multi_timeframe_trend(daily_close: pd.Series) -> dict:
    """Assess trend on multiple timeframes from daily data."""
    # Weekly approximation: resample or use 5-day chunks
    price = daily_close.iloc[-1]
    ma_10 = sma(daily_close, 10).iloc[-1]   # ~2 week
    ma_20 = sma(daily_close, 20).iloc[-1]   # ~1 month
    ma_50 = sma(daily_close, 50).iloc[-1]   # ~quarter
    ma_200 = sma(daily_close, 200).iloc[-1] if len(daily_close) >= 200 else np.nan

    short_trend = "up" if not np.isnan(ma_10) and price > ma_10 else "down"
    med_trend = "up" if not np.isnan(ma_50) and price > ma_50 else "down"
    long_trend = "up" if not np.isnan(ma_200) and price > ma_200 else ("down" if not np.isnan(ma_200) else "N/A")

    aligned = short_trend == med_trend == "up"
    all_aligned = aligned and long_trend == "up"

    return {
        "short": short_trend,
        "medium": med_trend,
        "long": long_trend,
        "aligned_bullish": aligned,
        "fully_aligned": all_aligned,
        "ma_10": round(ma_10, 2) if not np.isnan(ma_10) else None,
        "ma_200": round(ma_200, 2) if not np.isnan(ma_200) else None,
    }


def bounce_confirmed(df: pd.DataFrame, lookback: int = 3) -> dict:
    """
    Check if an oversold stock has CONFIRMED a bounce (vs still falling).
    Requires: yesterday closed green, RSI turning up, price off recent low,
    volume confirmation on the reversal.

    This is the fix for the "falling knife" problem. Just being oversold
    isn't enough — we need evidence the bounce has actually started.
    """
    if len(df) < lookback + 2:
        return {"confirmed": False, "reason": "not enough data"}

    close = df["Close"]
    open_ = df["Open"]
    high = df["High"]
    low = df["Low"]
    volume = df["Volume"]

    # Yesterday's candle (last completed bar)
    last_close = close.iloc[-1]
    last_open = open_.iloc[-1]
    prev_close = close.iloc[-2]
    prev_low = low.iloc[-2]

    reasons = []

    # Test 1: Yesterday closed green (bullish candle)
    green_candle = last_close > last_open
    if green_candle:
        reasons.append("green candle")

    # Test 2: Price above yesterday's low (not making new lows)
    above_prev_low = last_close > prev_low
    if above_prev_low:
        reasons.append("above prior low")

    # Test 3: RSI turning up (RSI today > RSI yesterday)
    rsi_series = rsi(close)
    rsi_turning = len(rsi_series) >= 2 and rsi_series.iloc[-1] > rsi_series.iloc[-2]
    if rsi_turning:
        reasons.append("RSI turning up")

    # Test 4: Volume confirmation (reversal on above-average volume)
    avg_vol = volume.tail(20).mean()
    vol_confirmation = volume.iloc[-1] > avg_vol * 1.1
    if vol_confirmation:
        reasons.append("volume confirmation")

    # Test 5: Not making lower lows in last 3 days (stabilization)
    recent_lows = low.tail(lookback)
    stabilizing = recent_lows.iloc[-1] >= recent_lows.min()
    if stabilizing:
        reasons.append("lows stabilizing")

    # Require at least 3 of 5 tests to pass
    tests_passed = sum([green_candle, above_prev_low, rsi_turning,
                        vol_confirmation, stabilizing])
    confirmed = tests_passed >= 3

    return {
        "confirmed": confirmed,
        "tests_passed": tests_passed,
        "tests_total": 5,
        "reasons": reasons,
    }


def weekly_uptrend_intact(close: pd.Series) -> bool:
    """
    Check if the long-term (weekly) uptrend is still intact.
    Requires price above 50-week MA (approximated by 250-day MA).
    Prevents catching knives in structural downtrends.
    """
    if len(close) < 200:
        return True  # not enough data, don't filter
    ma_200 = close.rolling(window=200, min_periods=150).mean().iloc[-1]
    if pd.isna(ma_200):
        return True
    return close.iloc[-1] >= ma_200 * 0.97  # within 3% of 200MA counts


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

    # Advanced indicators
    macd_data = macd(close)
    macd_val = macd_data["macd"].iloc[-1]
    macd_sig = macd_data["signal"].iloc[-1]
    macd_hist = macd_data["histogram"].iloc[-1]
    macd_prev_hist = macd_data["histogram"].iloc[-2] if len(macd_data["histogram"]) >= 2 else 0

    adx_val = adx(high, low, close).iloc[-1]
    mfi_val = mfi(high, low, close, volume).iloc[-1]
    obv_signal = obv_trend(close, volume)
    hv_rank = historical_volatility_rank(close)
    roc_val = roc(close, 10).iloc[-1]
    stoch = stochastic(high, low, close)
    stoch_k = stoch["k"].iloc[-1]
    stoch_d = stoch["d"].iloc[-1]
    mtf = multi_timeframe_trend(close)

    # MACD crossover detection
    macd_cross = "none"
    if macd_hist > 0 and macd_prev_hist <= 0:
        macd_cross = "bullish"
    elif macd_hist < 0 and macd_prev_hist >= 0:
        macd_cross = "bearish"

    def _safe(val, decimals=2):
        return round(val, decimals) if not (isinstance(val, float) and np.isnan(val)) else None

    return {
        "price": round(price, 2),
        # Classic
        "rsi": _safe(rsi_val, 1),
        "atr": _safe(atr_val),
        "atr_pct": _safe(atr_val / price * 100) if not np.isnan(atr_val) and price > 0 else None,
        "ma_20": _safe(ma_20),
        "ma_50": _safe(ma_50),
        "dist_20ma_pct": round(dist_20ma, 2) if dist_20ma is not None else None,
        "dist_50ma_pct": round(dist_50ma, 2) if dist_50ma is not None else None,
        "bb_upper": _safe(bb["upper"].iloc[-1]),
        "bb_lower": _safe(bb["lower"].iloc[-1]),
        "bb_pct_b": _safe(bb["pct_b"].iloc[-1]),
        "volume_ratio": _safe(vol_ratio),
        "consolidation_pct": round(consol, 2),
        "trend": trend,
        "support_resistance": sr,
        # Advanced — momentum
        "macd": _safe(macd_val),
        "macd_signal": _safe(macd_sig),
        "macd_histogram": _safe(macd_hist),
        "macd_cross": macd_cross,
        "roc_10": _safe(roc_val),
        "stoch_k": _safe(stoch_k, 1),
        "stoch_d": _safe(stoch_d, 1),
        # Advanced — trend strength
        "adx": _safe(adx_val, 1),
        "multi_timeframe": mtf,
        # Advanced — money flow
        "mfi": _safe(mfi_val, 1),
        "obv_signal": obv_signal,
        # Advanced — volatility context
        "hv_rank": hv_rank,
        # Bounce confirmation (anti-falling-knife)
        "bounce": bounce_confirmed(df),
        "weekly_uptrend_intact": weekly_uptrend_intact(close),
    }
