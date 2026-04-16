#!/usr/bin/env python3
"""
Portfolio Tracker for $1,200 Rollover IRA at Fidelity

Core-satellite approach:
  - CORE (75%): Broad market index ETFs
  - SATELLITE (25%): Sector ETFs and tactical positions

Uses only the Python standard library -- no external dependencies required.
"""

import json
import os
from datetime import datetime, date
from typing import Optional

# ---------------------------------------------------------------------------
# Portfolio definition
# ---------------------------------------------------------------------------

ACCOUNT_BALANCE = 1200.00

TARGET_ALLOCATIONS = {
    # CORE holdings (75%)
    "VOO":  {"pct": 0.35, "category": "core",      "name": "Vanguard S&P 500 ETF"},
    "VXF":  {"pct": 0.10, "category": "core",      "name": "Vanguard Extended Market ETF"},
    "SCHD": {"pct": 0.10, "category": "core",      "name": "Schwab US Dividend Equity ETF"},
    "VXUS": {"pct": 0.15, "category": "core",      "name": "Vanguard Total International ETF"},
    "SCHE": {"pct": 0.05, "category": "core",      "name": "Schwab Emerging Markets Equity ETF"},
    # SATELLITE holdings (25%)
    "XLK":  {"pct": 0.10, "category": "satellite",  "name": "Technology Select Sector SPDR"},
    "XLV":  {"pct": 0.05, "category": "satellite",  "name": "Health Care Select Sector SPDR"},
    "SOXX": {"pct": 0.05, "category": "satellite",  "name": "iShares Semiconductor ETF"},
    "CASH": {"pct": 0.05, "category": "satellite",  "name": "Cash Reserve"},
}

# File where we persist position snapshots
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "portfolio_data.json")

# Risk-management thresholds
REBALANCE_THRESHOLD = 0.05      # 5 percentage points drift triggers rebalance
SATELLITE_STOP_LOSS = -0.15     # -15% per satellite position
PORTFOLIO_DRAWDOWN_WARNING = -0.10
PORTFOLIO_DRAWDOWN_DEFENSIVE = -0.20


# ---------------------------------------------------------------------------
# Target allocation helpers
# ---------------------------------------------------------------------------

def target_dollars(ticker: str, balance: float = ACCOUNT_BALANCE) -> float:
    """Return the dollar amount a ticker should hold at target weight."""
    info = TARGET_ALLOCATIONS.get(ticker)
    if info is None:
        raise ValueError(f"Unknown ticker: {ticker}")
    return round(balance * info["pct"], 2)


def print_target_allocations(balance: float = ACCOUNT_BALANCE) -> None:
    """Print a table of target allocations and dollar amounts."""
    print(f"\n{'='*72}")
    print(f"  Target Allocations  --  Account Balance: ${balance:,.2f}")
    print(f"{'='*72}")
    print(f"  {'Ticker':<8} {'Name':<38} {'Pct':>5}  {'Amount':>9}")
    print(f"  {'-'*8} {'-'*38} {'-'*5}  {'-'*9}")

    core_total = 0.0
    sat_total = 0.0

    for ticker, info in TARGET_ALLOCATIONS.items():
        amt = target_dollars(ticker, balance)
        pct_str = f"{info['pct']*100:.0f}%"
        print(f"  {ticker:<8} {info['name']:<38} {pct_str:>5}  ${amt:>8,.2f}")
        if info["category"] == "core":
            core_total += amt
        else:
            sat_total += amt

    print(f"  {'-'*8} {'-'*38} {'-'*5}  {'-'*9}")
    print(f"  {'CORE total':<47} {'':>5}  ${core_total:>8,.2f}")
    print(f"  {'SATELLITE total':<47} {'':>5}  ${sat_total:>8,.2f}")
    print(f"  {'GRAND TOTAL':<47} {'':>5}  ${core_total + sat_total:>8,.2f}")
    print()


# ---------------------------------------------------------------------------
# Position tracking
# ---------------------------------------------------------------------------

def _load_data() -> dict:
    """Load persisted portfolio data from disk."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {"snapshots": [], "positions": {}}


def _save_data(data: dict) -> None:
    """Save portfolio data to disk."""
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def update_position(ticker: str, shares: float, price: float) -> None:
    """Record or update a position with current share count and price."""
    data = _load_data()
    positions = data.setdefault("positions", {})
    positions[ticker] = {
        "shares": shares,
        "price": price,
        "market_value": round(shares * price, 2),
        "updated": datetime.now().isoformat(),
    }
    _save_data(data)
    print(f"  Updated {ticker}: {shares} shares @ ${price:.2f} = ${shares * price:,.2f}")


def get_positions() -> dict:
    """Return the current positions dict."""
    return _load_data().get("positions", {})


def print_positions() -> None:
    """Pretty-print current positions and compare to targets."""
    positions = get_positions()
    if not positions:
        print("\n  No positions recorded yet. Use update_position() to add holdings.\n")
        return

    total_value = sum(p["market_value"] for p in positions.values())
    print(f"\n{'='*78}")
    print(f"  Current Positions  --  Portfolio Value: ${total_value:,.2f}")
    print(f"{'='*78}")
    print(f"  {'Ticker':<8} {'Shares':>8} {'Price':>9} {'Value':>10} {'Actual%':>8} {'Target%':>8} {'Drift':>7}")
    print(f"  {'-'*8} {'-'*8} {'-'*9} {'-'*10} {'-'*8} {'-'*8} {'-'*7}")

    for ticker, pos in sorted(positions.items()):
        actual_pct = pos["market_value"] / total_value if total_value else 0
        target_info = TARGET_ALLOCATIONS.get(ticker, {})
        target_pct = target_info.get("pct", 0)
        drift = actual_pct - target_pct
        drift_flag = " *" if abs(drift) >= REBALANCE_THRESHOLD else ""
        print(
            f"  {ticker:<8} {pos['shares']:>8.4f} ${pos['price']:>8.2f} "
            f"${pos['market_value']:>9,.2f} {actual_pct*100:>7.1f}% {target_pct*100:>7.1f}% "
            f"{drift*100:>+6.1f}%{drift_flag}"
        )

    print(f"\n  * = drift exceeds {REBALANCE_THRESHOLD*100:.0f}% threshold; rebalancing recommended\n")


# ---------------------------------------------------------------------------
# Rebalancing calculator
# ---------------------------------------------------------------------------

def calculate_rebalancing(extra_cash: float = 0.0) -> list[dict]:
    """
    Given current positions (and optional new cash to deploy), compute the
    trades needed to return to target allocations.

    Returns a list of dicts: [{"ticker", "action", "amount"}, ...]
    """
    positions = get_positions()
    current_values = {t: p["market_value"] for t, p in positions.items()}
    total_value = sum(current_values.values()) + extra_cash

    if total_value == 0:
        print("  No portfolio value to rebalance.")
        return []

    trades: list[dict] = []

    print(f"\n{'='*60}")
    print(f"  Rebalancing Plan  --  Total Value: ${total_value:,.2f}")
    if extra_cash > 0:
        print(f"  (includes ${extra_cash:,.2f} new cash to deploy)")
    print(f"{'='*60}")
    print(f"  {'Ticker':<8} {'Current':>10} {'Target':>10} {'Trade':>10} {'Action':<6}")
    print(f"  {'-'*8} {'-'*10} {'-'*10} {'-'*10} {'-'*6}")

    for ticker, info in TARGET_ALLOCATIONS.items():
        current = current_values.get(ticker, 0.0)
        target_val = round(total_value * info["pct"], 2)
        diff = round(target_val - current, 2)
        action = "BUY" if diff > 0 else ("SELL" if diff < 0 else "HOLD")
        trades.append({"ticker": ticker, "action": action, "amount": abs(diff)})
        print(
            f"  {ticker:<8} ${current:>9,.2f} ${target_val:>9,.2f} "
            f"${abs(diff):>9,.2f}  {action}"
        )

    print()
    return trades


# ---------------------------------------------------------------------------
# Performance snapshot tracker
# ---------------------------------------------------------------------------

def record_snapshot(label: Optional[str] = None) -> None:
    """Save a point-in-time snapshot of portfolio value for performance tracking."""
    positions = get_positions()
    total = sum(p["market_value"] for p in positions.values())
    data = _load_data()
    snapshots = data.setdefault("snapshots", [])
    snapshots.append({
        "date": date.today().isoformat(),
        "total_value": total,
        "positions": {t: p["market_value"] for t, p in positions.items()},
        "label": label or "",
    })
    _save_data(data)
    print(f"  Snapshot recorded: {date.today().isoformat()} -- ${total:,.2f}")


def print_performance() -> None:
    """Print performance history from saved snapshots."""
    data = _load_data()
    snapshots = data.get("snapshots", [])
    if not snapshots:
        print("\n  No snapshots recorded yet. Use record_snapshot() after updating positions.\n")
        return

    first_value = snapshots[0]["total_value"]
    print(f"\n{'='*60}")
    print(f"  Performance History  --  Starting Value: ${first_value:,.2f}")
    print(f"{'='*60}")
    print(f"  {'Date':<12} {'Value':>10} {'Change':>10} {'Return':>8} {'Label'}")
    print(f"  {'-'*12} {'-'*10} {'-'*10} {'-'*8} {'-'*20}")

    for snap in snapshots:
        val = snap["total_value"]
        change = val - first_value
        ret = (change / first_value * 100) if first_value else 0
        print(
            f"  {snap['date']:<12} ${val:>9,.2f} ${change:>+9,.2f} {ret:>+7.2f}%  {snap.get('label', '')}"
        )
    print()


# ---------------------------------------------------------------------------
# Risk management checks
# ---------------------------------------------------------------------------

def check_risk() -> None:
    """Run risk checks against current positions."""
    positions = get_positions()
    if not positions:
        print("  No positions to check.")
        return

    total = sum(p["market_value"] for p in positions.values())
    print(f"\n{'='*60}")
    print(f"  Risk Check  --  Portfolio Value: ${total:,.2f}")
    print(f"{'='*60}")

    data = _load_data()
    snapshots = data.get("snapshots", [])

    # Portfolio drawdown check
    if snapshots:
        peak = max(s["total_value"] for s in snapshots)
        drawdown = (total - peak) / peak if peak else 0
        print(f"  Portfolio drawdown from peak (${peak:,.2f}): {drawdown*100:+.1f}%")
        if drawdown <= PORTFOLIO_DRAWDOWN_DEFENSIVE:
            print("  ** ALERT: Drawdown exceeds -20%. Consider shifting to 90% core / 10% satellite. **")
        elif drawdown <= PORTFOLIO_DRAWDOWN_WARNING:
            print("  ** WARNING: Drawdown exceeds -10%. Review satellite positions and tighten stops. **")
        else:
            print("  Drawdown within acceptable range.")

    # Position concentration check
    print()
    for ticker, pos in positions.items():
        weight = pos["market_value"] / total if total else 0
        info = TARGET_ALLOCATIONS.get(ticker, {})
        category = info.get("category", "unknown")

        if category == "satellite" and weight > 0.10:
            print(f"  ** WARNING: {ticker} is {weight*100:.1f}% of portfolio (satellite max is 10%) **")
        elif category != "core" and weight > 0.05 and ticker != "CASH":
            print(f"  ** NOTE: {ticker} individual stock at {weight*100:.1f}% (max recommended 5%) **")

    print("  Risk check complete.\n")


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------

def main() -> None:
    """Run a full portfolio dashboard."""
    print_target_allocations()
    print_positions()

    positions = get_positions()
    if positions:
        calculate_rebalancing()
        print_performance()
        check_risk()
    else:
        print("  Tip: Start by calling update_position('VOO', shares, price) for each holding.")
        print("  Then run this script again to see your dashboard.\n")
        print("  Example interactive session:")
        print("    >>> from portfolio import update_position, record_snapshot")
        print("    >>> update_position('VOO', 0.89, 472.15)")
        print("    >>> update_position('VXF', 0.78, 153.20)")
        print("    >>> record_snapshot('Initial deployment')")
        print()


if __name__ == "__main__":
    main()
