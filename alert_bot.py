#!/usr/bin/env python3
"""
Automated alert bot for options swing trading.
Monitors high-beta watchlist stocks in real-time during market hours.
Fires alerts when entry conditions are met.

Usage:
  python alert_bot.py                        # run with console alerts
  python alert_bot.py --webhook <URL>        # send alerts to Discord/Slack webhook
  python alert_bot.py --interval 10          # check every 10 minutes (default 15)
  python alert_bot.py --once                 # run one scan and exit

Set up as a background service:
  nohup python alert_bot.py --webhook <URL> > alert_bot.log 2>&1 &
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, date, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import yfinance as yf
import indicators

ALERT_LOG = Path(__file__).parent / "alerts.json"
ET = ZoneInfo("America/New_York")

import stock_discovery

# --- Watchlist: core proven winners + dynamic discovery --- #

CORE_WATCHLIST = {
    "AMD":  {"oversold_rsi": 40, "20ma_watch": True, "tier": "A"},
    "TSLA": {"oversold_rsi": 40, "20ma_watch": True, "tier": "A"},
    "NVDA": {"oversold_rsi": 40, "20ma_watch": True, "tier": "A"},
    "ROKU": {"oversold_rsi": 35, "20ma_watch": True, "tier": "A"},
    "SHOP": {"oversold_rsi": 35, "20ma_watch": True, "tier": "A"},
    "SOFI": {"oversold_rsi": 35, "20ma_watch": True, "tier": "A"},
    "COIN": {"oversold_rsi": 35, "20ma_watch": True, "tier": "B"},
    "MARA": {"oversold_rsi": 35, "20ma_watch": True, "tier": "B"},
    "PLTR": {"oversold_rsi": 40, "20ma_watch": True, "tier": "B"},
    "CRWD": {"oversold_rsi": 40, "20ma_watch": True, "tier": "B"},
    "META": {"oversold_rsi": 40, "20ma_watch": True, "tier": "B"},
    "ARKK": {"oversold_rsi": 35, "20ma_watch": True, "tier": "B"},
}


def get_active_watchlist() -> dict:
    """Build watchlist from core + daily discovery."""
    watchlist = dict(CORE_WATCHLIST)
    try:
        data = stock_discovery.load_discovery_data()
        for ticker in data.get("discovery_tickers", []):
            if ticker not in watchlist:
                watchlist[ticker] = {
                    "oversold_rsi": 38,
                    "20ma_watch": True,
                    "tier": "D",
                }
        for ticker in data.get("proven_tickers", []):
            if ticker not in watchlist:
                watchlist[ticker] = {
                    "oversold_rsi": 38,
                    "20ma_watch": True,
                    "tier": "P",
                }
    except Exception:
        pass
    return watchlist

# SPY regime thresholds
SPY_OVERBOUGHT = 72
SPY_COOLDOWN = 50


# --- Alert conditions --- #

def check_alerts(price_data: dict, spy_df=None, watchlist: dict | None = None) -> list[dict]:
    """Run all alert checks across the watchlist. Returns list of fired alerts."""
    alerts = []
    now = datetime.now(ET).strftime("%Y-%m-%d %H:%M")

    # SPY regime check
    spy_rsi = None
    spy_status = "unknown"
    if spy_df is not None and len(spy_df) >= 50:
        spy_a = indicators.analyze(spy_df)
        spy_rsi = spy_a.get("rsi")
        if spy_rsi and spy_rsi > SPY_OVERBOUGHT:
            spy_status = "overbought"
            alerts.append({
                "time": now,
                "ticker": "SPY",
                "type": "REGIME",
                "priority": "INFO",
                "message": f"SPY RSI {spy_rsi:.0f} — OVERBOUGHT. Avoid new entries.",
                "rsi": spy_rsi,
            })
        elif spy_rsi and spy_rsi < SPY_COOLDOWN:
            spy_status = "cooled"
            alerts.append({
                "time": now,
                "ticker": "SPY",
                "type": "REGIME",
                "priority": "GO",
                "message": f"SPY RSI {spy_rsi:.0f} — Market cooled off. Scan for entries.",
                "rsi": spy_rsi,
            })
        else:
            spy_status = "neutral"

    wl = watchlist or get_active_watchlist()
    for ticker, config in wl.items():
        df = price_data.get(ticker)
        if df is None or len(df) < 50:
            continue

        try:
            a = indicators.analyze(df)
        except Exception:
            continue

        price = a["price"]
        rsi = a.get("rsi")
        mfi = a.get("mfi")
        adx = a.get("adx")
        ma_20 = a.get("ma_20")
        obv_sig = a.get("obv_signal")
        macd_cross = a.get("macd_cross")
        stoch_k = a.get("stoch_k")
        hv_rank = a.get("hv_rank", 50)
        bb_pct = a.get("bb_pct_b")
        mtf = a.get("multi_timeframe", {})

        if rsi is None:
            continue

        # ---- ENTRY ALERTS ---- #

        # 1. RSI oversold — primary entry signal
        if rsi <= config["oversold_rsi"]:
            priority = "ENTRY" if rsi <= 30 else "WATCH"
            factors = [f"RSI {rsi:.0f}"]
            if mfi and mfi < 30:
                factors.append(f"MFI {mfi:.0f} (selling exhausted)")
                priority = "ENTRY"
            if obv_sig == "bullish_divergence":
                factors.append("OBV bullish divergence")
                priority = "ENTRY"
            if stoch_k and stoch_k < 20:
                factors.append(f"Stochastic {stoch_k:.0f}")
            if bb_pct is not None and bb_pct < 0.05:
                factors.append("Below lower Bollinger Band")
            if ma_20 and abs(price - ma_20) / ma_20 < 0.02:
                factors.append(f"At 20MA ${ma_20:.2f}")

            # Upgrade to ENTRY if multiple confirmations
            if len(factors) >= 3:
                priority = "ENTRY"

            alerts.append({
                "time": now,
                "ticker": ticker,
                "type": "OVERSOLD",
                "priority": priority,
                "price": price,
                "rsi": rsi,
                "message": f"{ticker} ${price:.2f} OVERSOLD — {' | '.join(factors)}",
                "factors": factors,
                "order_details": (
                    f"BUY ATM long call, 30-45 DTE | Limit @ mid | TIF: DAY\n"
                    f"           After fill: set GTC limit sell at +40% (profit target)\n"
                    f"           Price alert: {ticker} stock @ 5% below entry = manual exit (no hard stop on option)"
                ) if priority == "ENTRY" else None,
                "action": f"BUY ATM call, 30 DTE, risk $120" if priority == "ENTRY" else "Watch for MACD bullish cross to confirm",
            })

        # 2. MACD bullish crossover on a stock that was recently oversold
        if macd_cross == "bullish" and rsi < 55:
            alerts.append({
                "time": now,
                "ticker": ticker,
                "type": "MACD_CROSS",
                "priority": "ENTRY" if rsi < 45 else "WATCH",
                "price": price,
                "rsi": rsi,
                "message": f"{ticker} ${price:.2f} MACD BULLISH CROSS — RSI {rsi:.0f}, momentum turning up",
                "action": f"BUY ATM call, 30 DTE. Entry confirmation signal.",
                "order_details": (
                    f"BUY ATM long call, 30-45 DTE | Limit @ mid | TIF: DAY\n"
                    f"           After fill: set GTC limit sell at +40% (profit target)\n"
                    f"           Price alert: {ticker} stock @ 5% below entry = manual exit"
                ) if rsi < 45 else None,
            })

        # 3. Price at 20MA support in an uptrend
        if (ma_20 and abs(price - ma_20) / ma_20 < 0.015
                and mtf.get("long") == "up" and rsi < 50):
            alerts.append({
                "time": now,
                "ticker": ticker,
                "type": "20MA_SUPPORT",
                "priority": "WATCH",
                "price": price,
                "rsi": rsi,
                "message": f"{ticker} ${price:.2f} touching 20MA ${ma_20:.2f} — long-term uptrend intact",
                "action": "Watch for bounce confirmation (next green candle with volume)",
            })

        # 4. OBV bullish divergence (institutions buying while price drops)
        if obv_sig == "bullish_divergence" and rsi < 50:
            alerts.append({
                "time": now,
                "ticker": ticker,
                "type": "OBV_DIVERGENCE",
                "priority": "WATCH",
                "price": price,
                "rsi": rsi,
                "message": f"{ticker} ${price:.2f} OBV BULLISH DIVERGENCE — smart money accumulating",
                "action": "Institutions buying. Wait for RSI < 40 or MACD cross for entry.",
            })

        # ---- WARNING ALERTS ---- #

        # 5. Overbought warning (don't enter)
        if rsi >= 75:
            alerts.append({
                "time": now,
                "ticker": ticker,
                "type": "OVERBOUGHT",
                "priority": "AVOID",
                "price": price,
                "rsi": rsi,
                "message": f"{ticker} ${price:.2f} RSI {rsi:.0f} OVERBOUGHT — pullback expected",
                "action": "DO NOT enter. Set RSI < {0} alert for pullback entry.".format(config["oversold_rsi"]),
            })

        # 6. OBV bearish divergence (price up but volume not confirming)
        if obv_sig == "bearish_divergence" and rsi > 60:
            alerts.append({
                "time": now,
                "ticker": ticker,
                "type": "OBV_WARN",
                "priority": "CAUTION",
                "price": price,
                "rsi": rsi,
                "message": f"{ticker} ${price:.2f} OBV BEARISH DIVERGENCE — rally not confirmed by volume",
                "action": "Rally may fade. Don't chase. Wait for pullback.",
            })

    return alerts


# --- Notification --- #

def send_webhook(url: str, alerts: list[dict]) -> None:
    """Send alerts to a Discord or Slack webhook."""
    entry_alerts = [a for a in alerts if a["priority"] in ("ENTRY", "GO")]
    watch_alerts = [a for a in alerts if a["priority"] == "WATCH"]

    if not entry_alerts and not watch_alerts:
        return

    lines = [f"**ALERT BOT — {datetime.now(ET).strftime('%H:%M ET')}**\n"]

    if entry_alerts:
        lines.append("**ENTRY SIGNALS:**")
        for a in entry_alerts:
            lines.append(f"  {a['message']}")
            lines.append(f"  >> {a.get('action', '')}")
            if a.get("order_details"):
                lines.append(f"  `{a['order_details']}`")
            lines.append("")

    if watch_alerts:
        lines.append("**ON WATCH:**")
        for a in watch_alerts:
            lines.append(f"  {a['message']}")

    text = "\n".join(lines)

    # Discord format
    payload = json.dumps({"content": text[:2000]}).encode("utf-8")
    req = urllib.request.Request(url, data=payload,
                                 headers={"Content-Type": "application/json",
                                          "User-Agent": "TradingAlertBot/1.0"})
    try:
        urllib.request.urlopen(req)
    except urllib.error.URLError as e:
        print(f"  Webhook failed: {e}")


def print_alerts(alerts: list[dict]) -> None:
    """Print alerts to console."""
    if not alerts:
        return

    # Group by priority
    entries = [a for a in alerts if a["priority"] == "ENTRY"]
    watches = [a for a in alerts if a["priority"] == "WATCH"]
    regime = [a for a in alerts if a["priority"] in ("GO", "INFO")]
    cautions = [a for a in alerts if a["priority"] in ("CAUTION", "AVOID")]

    if entries:
        print(f"\n  {'!'*3} ENTRY SIGNALS {'!'*3}")
        for a in entries:
            print(f"  >> {a['message']}")
            print(f"     ACTION: {a.get('action', '')}")
            if a.get("order_details"):
                print(f"     ORDER:  {a['order_details']}")
        print()

    if watches:
        print(f"  --- ON WATCH ---")
        for a in watches:
            print(f"  {a['message']}")
        print()

    if regime:
        for a in regime:
            print(f"  [{a['priority']}] {a['message']}")

    if cautions:
        print(f"  --- CAUTIONS ---")
        for a in cautions:
            print(f"  {a['message']}")
        print()


def log_alerts(alerts: list[dict]) -> None:
    """Append alerts to the log file."""
    actionable = [a for a in alerts if a["priority"] in ("ENTRY", "WATCH", "GO")]
    if not actionable:
        return
    existing = []
    if ALERT_LOG.exists():
        try:
            with open(ALERT_LOG) as f:
                existing = json.load(f)
        except Exception:
            existing = []
    existing.extend(actionable)
    # Keep last 500 alerts
    existing = existing[-500:]
    with open(ALERT_LOG, "w") as f:
        json.dump(existing, f, indent=2)


# --- Dedup: don't fire the same alert repeatedly --- #

def dedup_alerts(alerts: list[dict], last_alerts: dict) -> list[dict]:
    """Filter out alerts that already fired within the cooldown period."""
    new = []
    for a in alerts:
        key = f"{a['ticker']}_{a['type']}"
        last_time = last_alerts.get(key)
        if last_time:
            elapsed = (datetime.now() - datetime.fromisoformat(last_time)).seconds
            # Don't repeat the same alert within 2 hours
            if elapsed < 7200:
                continue
        last_alerts[key] = datetime.now().isoformat()
        new.append(a)
    return new


# --- Market hours check --- #

def is_market_hours() -> bool:
    """Check if US stock market is open (9:30 AM - 4:00 PM ET, weekdays)."""
    now = datetime.now(ET)
    if now.weekday() >= 5:  # weekend
        return False
    market_open = now.replace(hour=9, minute=30, second=0)
    market_close = now.replace(hour=16, minute=0, second=0)
    return market_open <= now <= market_close


def is_premarket() -> bool:
    """Check if we're in pre-market scanning window (7-9:30 AM ET)."""
    now = datetime.now(ET)
    if now.weekday() >= 5:
        return False
    return now.replace(hour=7, minute=0, second=0) <= now < now.replace(hour=9, minute=30, second=0)


# --- Main loop --- #

def fetch_data(tickers: list[str]) -> dict:
    """Batch download current data."""
    all_t = list(set(tickers + ["SPY"]))
    try:
        data = yf.download(all_t, period="3mo", group_by="ticker",
                           threads=True, progress=False)
        result = {}
        for t in all_t:
            try:
                df = data[t].dropna(subset=["Close"]) if len(all_t) > 1 else data.dropna(subset=["Close"])
                if len(df) >= 50:
                    result[t] = df
            except Exception:
                pass
        return result
    except Exception as e:
        print(f"  Data fetch error: {e}")
        return {}


def run_once(webhook_url: str | None = None, watchlist: dict | None = None) -> list[dict]:
    """Run a single scan cycle."""
    wl = watchlist or get_active_watchlist()
    now_et = datetime.now(ET).strftime("%H:%M ET")
    print(f"\n  [{now_et}] Scanning {len(wl)} stocks (core + discovery)...")

    tickers = list(wl.keys())
    data = fetch_data(tickers)

    if not data:
        print("  No data retrieved.")
        return []

    spy_df = data.get("SPY")
    alerts = check_alerts(data, spy_df, wl)

    if alerts:
        print_alerts(alerts)
        log_alerts(alerts)
        if webhook_url:
            send_webhook(webhook_url, alerts)
    else:
        print(f"  No alerts. All clear.")

    return alerts


def run_loop(interval_min: int = 15, webhook_url: str | None = None,
             no_discovery: bool = False) -> None:
    """Run continuously during market hours."""
    wl = get_active_watchlist()
    print(f"\n{'='*60}")
    print(f" ALERT BOT STARTED")
    print(f" Monitoring: {len(wl)} stocks (core + discovery)")
    print(f" Core: {', '.join(CORE_WATCHLIST.keys())}")
    disc = [t for t in wl if t not in CORE_WATCHLIST]
    if disc:
        print(f" Discovery: {', '.join(disc)}")
    print(f" Interval: every {interval_min} minutes")
    print(f" Webhook: {'configured' if webhook_url else 'none (console only)'}")
    print(f" Discovery: {'disabled' if no_discovery else 'enabled (7AM ET daily)'}")
    print(f"{'='*60}")

    last_alerts: dict[str, str] = {}
    last_discovery_date = None

    while True:
        now_et = datetime.now(ET)

        # Pre-market discovery scan at 7AM ET (once per day)
        if (not no_discovery and is_premarket()
                and now_et.hour >= 7 and last_discovery_date != now_et.date()):
            print(f"\n  [{now_et.strftime('%H:%M ET')}] Running pre-market discovery scan...")
            try:
                result = stock_discovery.build_dynamic_watchlist(quick=False)
                last_discovery_date = now_et.date()
                wl = get_active_watchlist()
                new_disc = result.get("discovery_tickers", [])
                print(f"  Discovery complete. Now monitoring {len(wl)} stocks.")
                if webhook_url and new_disc:
                    disc_msg = (f"**DISCOVERY SCAN — {now_et.strftime('%H:%M ET')}**\n"
                                f"Scanned {result['scan_stats']['total_scanned']} stocks, "
                                f"found {len(new_disc)} new candidates:\n"
                                + "\n".join(f"  {t}" for t in new_disc[:10]))
                    payload = json.dumps({"content": disc_msg[:2000]}).encode("utf-8")
                    req = urllib.request.Request(webhook_url, data=payload,
                                                 headers={"Content-Type": "application/json",
                                                          "User-Agent": "TradingAlertBot/1.0"})
                    try:
                        urllib.request.urlopen(req)
                    except Exception:
                        pass
            except Exception as e:
                print(f"  Discovery scan failed: {e}")

        if is_market_hours() or is_premarket():
            wl = get_active_watchlist()
            alerts = run_once(webhook_url=None, watchlist=wl)

            new_alerts = dedup_alerts(alerts, last_alerts)
            if new_alerts and webhook_url:
                send_webhook(webhook_url, new_alerts)

            print(f"  Next scan in {interval_min} minutes...")
            time.sleep(interval_min * 60)
        else:
            print(f"  [{now_et.strftime('%H:%M ET')}] Market closed. Waiting for pre-market (7 AM ET)...")
            time.sleep(1800)


# --- CLI --- #

def main():
    parser = argparse.ArgumentParser(description="Options swing trading alert bot")
    parser.add_argument("--webhook", type=str, default=None,
                        help="Discord or Slack webhook URL for push notifications")
    parser.add_argument("--interval", type=int, default=15,
                        help="Minutes between scans (default 15)")
    parser.add_argument("--once", action="store_true",
                        help="Run one scan and exit")
    parser.add_argument("--no-discovery", action="store_true",
                        help="Use only core watchlist, skip discovery scanner")
    args = parser.parse_args()

    if args.once:
        wl = CORE_WATCHLIST if args.no_discovery else get_active_watchlist()
        run_once(webhook_url=args.webhook, watchlist=wl)
    else:
        run_loop(interval_min=args.interval, webhook_url=args.webhook,
                 no_discovery=args.no_discovery)


if __name__ == "__main__":
    main()
