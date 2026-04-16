#!/usr/bin/env python3
"""
Options swing trading portfolio tracker for a $1,200 Rollover IRA.
Tracks positions, P/L, cash balance, and account value over time.
No external dependencies — uses only the Python standard library.
"""

import json
import sys
from datetime import date
from pathlib import Path

DATA_FILE = Path(__file__).parent / "portfolio_data.json"
STARTING_CAPITAL = 1200.00


def _load() -> dict:
    if DATA_FILE.exists():
        with open(DATA_FILE) as f:
            return json.load(f)
    return {
        "cash": STARTING_CAPITAL,
        "positions": [],
        "closed": [],
        "snapshots": [],
    }


def _save(data: dict) -> None:
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)


# ---------- Position Management ---------- #

def open_position(ticker: str, strategy: str, contracts: int,
                  entry_price: float, max_risk: float, target: float,
                  expiration: str, notes: str = "") -> None:
    """Open a new options position."""
    data = _load()
    cost = entry_price * contracts * 100  # options priced per share, 100 shares/contract
    if cost > data["cash"]:
        print(f"ERROR: Insufficient cash. Need ${cost:.2f}, have ${data['cash']:.2f}")
        return

    position = {
        "id": len(data["positions"]) + len(data["closed"]) + 1,
        "ticker": ticker,
        "strategy": strategy,
        "contracts": contracts,
        "entry_price": entry_price,
        "entry_date": date.today().isoformat(),
        "cost": round(cost, 2),
        "max_risk": round(max_risk, 2),
        "target": round(target, 2),
        "expiration": expiration,
        "notes": notes,
        "status": "open",
    }

    data["cash"] = round(data["cash"] - cost, 2)
    data["positions"].append(position)
    _save(data)

    print(f"\nOpened: {strategy} on {ticker}")
    print(f"  Contracts: {contracts} @ ${entry_price:.2f} = ${cost:.2f}")
    print(f"  Max risk: ${max_risk:.2f} | Target: ${target:.2f}")
    print(f"  Expiration: {expiration}")
    print(f"  Remaining cash: ${data['cash']:.2f}\n")


def close_position(position_id: int, exit_price: float, reason: str = "") -> None:
    """Close an existing position and realize P/L."""
    data = _load()

    pos = None
    pos_idx = None
    for i, p in enumerate(data["positions"]):
        if p["id"] == position_id:
            pos = p
            pos_idx = i
            break

    if pos is None:
        print(f"ERROR: Position #{position_id} not found.")
        return

    proceeds = exit_price * pos["contracts"] * 100
    pnl = round(proceeds - pos["cost"], 2)
    pnl_pct = round((pnl / pos["cost"]) * 100, 2) if pos["cost"] > 0 else 0

    closed_pos = {
        **pos,
        "exit_price": exit_price,
        "exit_date": date.today().isoformat(),
        "proceeds": round(proceeds, 2),
        "pnl": pnl,
        "pnl_pct": pnl_pct,
        "reason": reason,
        "status": "closed",
    }

    data["positions"].pop(pos_idx)
    data["closed"].append(closed_pos)
    data["cash"] = round(data["cash"] + proceeds, 2)
    _save(data)

    sym = "+" if pnl >= 0 else ""
    print(f"\nClosed: {pos['strategy']} on {pos['ticker']}")
    print(f"  Entry: ${pos['entry_price']:.2f} -> Exit: ${exit_price:.2f}")
    print(f"  P/L: {sym}${pnl:.2f} ({sym}{pnl_pct:.1f}%)")
    print(f"  Reason: {reason}")
    print(f"  Cash balance: ${data['cash']:.2f}\n")


def show_positions() -> None:
    """Display all open positions."""
    data = _load()
    positions = data["positions"]

    print(f"\n{'='*80}")
    print(f" Open Positions  |  Cash: ${data['cash']:.2f}")
    print(f"{'='*80}")

    if not positions:
        print("  No open positions.\n")
        return

    total_deployed = 0
    print(f" {'ID':<4} {'Ticker':<7} {'Strategy':<20} {'Qty':<4} {'Entry':>8} {'Cost':>9} {'Exp':<12}")
    print(f" {'-'*4} {'-'*7} {'-'*20} {'-'*4} {'-'*8} {'-'*9} {'-'*12}")
    for p in positions:
        total_deployed += p["cost"]
        print(f" {p['id']:<4} {p['ticker']:<7} {p['strategy']:<20} {p['contracts']:<4} "
              f"${p['entry_price']:>6.2f} ${p['cost']:>7.2f} {p['expiration']:<12}")

    total_value = data["cash"] + total_deployed
    pct_deployed = (total_deployed / total_value * 100) if total_value > 0 else 0
    print(f"\n  Capital deployed: ${total_deployed:.2f}")
    print(f"  Cash reserve:    ${data['cash']:.2f}")
    print(f"  Account value:   ${total_value:.2f} (at cost — update with current prices)")
    print(f"  Utilization:     {pct_deployed:.0f}% deployed, {100-pct_deployed:.0f}% cash")
    print(f"{'='*80}\n")


def show_closed() -> None:
    """Display trade history with P/L."""
    data = _load()
    closed = data["closed"]

    print(f"\n{'='*85}")
    print(f" Trade History")
    print(f"{'='*85}")

    if not closed:
        print("  No closed trades yet.\n")
        return

    print(f" {'Ticker':<7} {'Strategy':<18} {'Entry':>7} {'Exit':>7} {'P/L':>9} {'P/L%':>7} {'Reason':<15}")
    print(f" {'-'*7} {'-'*18} {'-'*7} {'-'*7} {'-'*9} {'-'*7} {'-'*15}")

    total_pnl = 0
    wins = 0
    losses = 0
    for t in closed:
        total_pnl += t["pnl"]
        if t["pnl"] >= 0:
            wins += 1
        else:
            losses += 1
        sym = "+" if t["pnl"] >= 0 else ""
        print(f" {t['ticker']:<7} {t['strategy']:<18} ${t['entry_price']:>5.2f} ${t['exit_price']:>5.2f} "
              f"{sym}${t['pnl']:>7.2f} {sym}{t['pnl_pct']:>5.1f}% {t.get('reason', ''):<15}")

    total_trades = wins + losses
    win_rate = (wins / total_trades * 100) if total_trades > 0 else 0
    sym = "+" if total_pnl >= 0 else ""
    print(f"\n  Total trades: {total_trades}  |  Wins: {wins}  |  Losses: {losses}  |  Win rate: {win_rate:.0f}%")
    print(f"  Net P/L: {sym}${total_pnl:.2f}")
    print(f"  Current cash: ${data['cash']:.2f}")
    print(f"{'='*85}\n")


def take_snapshot() -> None:
    """Record a point-in-time snapshot of account value."""
    data = _load()
    deployed = sum(p["cost"] for p in data["positions"])
    total = data["cash"] + deployed
    data["snapshots"].append({
        "date": date.today().isoformat(),
        "cash": data["cash"],
        "deployed": round(deployed, 2),
        "total": round(total, 2),
        "open_positions": len(data["positions"]),
    })
    _save(data)
    print(f"Snapshot saved: ${total:.2f} on {date.today().isoformat()}")


def show_snapshots() -> None:
    """Show account value history."""
    data = _load()
    snaps = data["snapshots"]

    if not snaps:
        print("\nNo snapshots recorded yet. Use 'snapshot' to save one.\n")
        return

    print(f"\n{'='*60}")
    print(f" Account Value History")
    print(f"{'='*60}")
    print(f" {'Date':<12} {'Total':>10} {'Cash':>10} {'Deployed':>10} {'Positions':>10}")
    print(f" {'-'*12} {'-'*10} {'-'*10} {'-'*10} {'-'*10}")
    for s in snaps:
        print(f" {s['date']:<12} ${s['total']:>8,.2f} ${s['cash']:>8,.2f} "
              f"${s['deployed']:>8,.2f} {s['open_positions']:>10}")

    if len(snaps) >= 2:
        first, last = snaps[0]["total"], snaps[-1]["total"]
        gain = last - first
        gain_pct = (gain / first) * 100 if first else 0
        sym = "+" if gain >= 0 else ""
        print(f"\n  Overall: {sym}${gain:.2f} ({sym}{gain_pct:.1f}%) from {snaps[0]['date']} to {snaps[-1]['date']}")
    print(f"{'='*60}\n")


def reset_account(starting_cash: float = STARTING_CAPITAL) -> None:
    """Reset the portfolio to starting state."""
    _save({
        "cash": starting_cash,
        "positions": [],
        "closed": [],
        "snapshots": [],
    })
    print(f"Account reset to ${starting_cash:.2f}")


# ---------- Risk Check ---------- #

def risk_check(cost: float) -> None:
    """Check if a proposed trade meets risk management rules."""
    data = _load()
    deployed = sum(p["cost"] for p in data["positions"])
    total = data["cash"] + deployed

    print(f"\n--- Risk Check for ${cost:.2f} trade ---")
    print(f"  Account value: ${total:.2f}")
    print(f"  Current cash:  ${data['cash']:.2f}")
    print(f"  Deployed:      ${deployed:.2f}")
    print(f"  Open positions: {len(data['positions'])}")

    issues = []
    if cost > total * 0.05:
        issues.append(f"  WARN: Trade cost ${cost:.2f} exceeds 5% max risk (${total*0.05:.2f})")
    if (deployed + cost) > total * 0.80:
        issues.append(f"  WARN: Would push deployment to {(deployed+cost)/total*100:.0f}% (max 80%)")
    if len(data["positions"]) >= 4:
        issues.append(f"  WARN: Already have {len(data['positions'])} open positions (max 4)")
    if cost > data["cash"]:
        issues.append(f"  BLOCK: Insufficient cash. Need ${cost:.2f}, have ${data['cash']:.2f}")

    if issues:
        print("\n  RISK ISSUES:")
        for issue in issues:
            print(issue)
    else:
        print("  ALL CLEAR — trade within risk parameters.")
    print()


# ---------- CLI ---------- #

USAGE = """
--- IRA Options Swing Trading Portfolio Manager ---

Commands:
  positions                     Show all open positions
  open <ticker> <strategy> <contracts> <entry_price> <max_risk> <target> <exp> [notes]
                                Open a new position
  close <id> <exit_price> [reason]
                                Close a position
  history                       Show closed trade history with stats
  snapshot                      Save current account snapshot
  snapshots                     Show account value history
  risk <cost>                   Risk-check a proposed trade
  reset [amount]                Reset portfolio (default $1200)

Examples:
  python portfolio.py open NVDA bull_call_spread 1 1.50 150 250 2026-05-16 "breakout above 900"
  python portfolio.py close 1 2.80 "hit profit target"
  python portfolio.py risk 150
"""


def main():
    if len(sys.argv) < 2:
        print(USAGE)
        return

    cmd = sys.argv[1].lower()

    if cmd == "positions":
        show_positions()
    elif cmd == "open":
        if len(sys.argv) < 9:
            print("Usage: open <ticker> <strategy> <contracts> <entry> <max_risk> <target> <exp> [notes]")
            return
        open_position(
            ticker=sys.argv[2].upper(),
            strategy=sys.argv[3],
            contracts=int(sys.argv[4]),
            entry_price=float(sys.argv[5]),
            max_risk=float(sys.argv[6]),
            target=float(sys.argv[7]),
            expiration=sys.argv[8],
            notes=" ".join(sys.argv[9:]) if len(sys.argv) > 9 else "",
        )
    elif cmd == "close":
        if len(sys.argv) < 4:
            print("Usage: close <id> <exit_price> [reason]")
            return
        close_position(
            position_id=int(sys.argv[2]),
            exit_price=float(sys.argv[3]),
            reason=" ".join(sys.argv[4:]) if len(sys.argv) > 4 else "",
        )
    elif cmd == "history":
        show_closed()
    elif cmd == "snapshot":
        take_snapshot()
    elif cmd == "snapshots":
        show_snapshots()
    elif cmd == "risk":
        if len(sys.argv) < 3:
            print("Usage: risk <cost>")
            return
        risk_check(float(sys.argv[2]))
    elif cmd == "reset":
        amount = float(sys.argv[2]) if len(sys.argv) > 2 else STARTING_CAPITAL
        reset_account(amount)
    else:
        print(f"Unknown command: {cmd}")
        print(USAGE)


if __name__ == "__main__":
    main()
