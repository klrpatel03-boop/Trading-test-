#!/usr/bin/env python3
"""
Trade journal for options swing trading.
Log every trade with setup type, reasoning, and outcome for performance analysis.
No external dependencies — uses only the Python standard library.
"""

import json
import sys
from datetime import date, datetime
from pathlib import Path

JOURNAL_FILE = Path(__file__).parent / "trade_journal.json"


def _load() -> list[dict]:
    if JOURNAL_FILE.exists():
        with open(JOURNAL_FILE) as f:
            return json.load(f)
    return []


def _save(entries: list[dict]) -> None:
    with open(JOURNAL_FILE, "w") as f:
        json.dump(entries, f, indent=2, default=str)


# ---------- Journal Operations ---------- #

def log_trade(
    ticker: str,
    direction: str,      # "long_call", "long_put", "bull_call_spread", "bear_put_spread", "csp", "credit_spread"
    setup: str,           # "breakout", "oversold_bounce", "momentum_pullback", "earnings", "mean_reversion"
    entry_price: float,
    contracts: int,
    expiration: str,
    strikes: str,         # e.g., "180/185" for a spread
    thesis: str,
    notes: str = "",
) -> int:
    """Log a new trade entry."""
    entries = _load()
    entry_id = len(entries) + 1
    entry = {
        "id": entry_id,
        "date_opened": date.today().isoformat(),
        "date_closed": None,
        "ticker": ticker.upper(),
        "direction": direction,
        "setup": setup,
        "entry_price": entry_price,
        "exit_price": None,
        "contracts": contracts,
        "expiration": expiration,
        "strikes": strikes,
        "cost": round(entry_price * contracts * 100, 2),
        "proceeds": None,
        "pnl": None,
        "pnl_pct": None,
        "thesis": thesis,
        "exit_reason": None,
        "lessons": None,
        "grade": None,  # A/B/C/D/F — self-grade the trade
        "notes": notes,
        "status": "open",
    }
    entries.append(entry)
    _save(entries)

    print(f"\n  Trade #{entry_id} logged:")
    print(f"    {ticker} {direction} | {setup} setup")
    print(f"    {contracts} contracts @ ${entry_price:.2f} = ${entry['cost']:.2f}")
    print(f"    Strikes: {strikes} | Exp: {expiration}")
    print(f"    Thesis: {thesis}\n")
    return entry_id


def close_trade(
    trade_id: int,
    exit_price: float,
    exit_reason: str,
    lessons: str = "",
    grade: str = "",
) -> None:
    """Close a trade and record the outcome."""
    entries = _load()

    entry = None
    for e in entries:
        if e["id"] == trade_id:
            entry = e
            break

    if entry is None:
        print(f"  Trade #{trade_id} not found.")
        return

    if entry["status"] == "closed":
        print(f"  Trade #{trade_id} is already closed.")
        return

    proceeds = round(exit_price * entry["contracts"] * 100, 2)
    pnl = round(proceeds - entry["cost"], 2)
    pnl_pct = round((pnl / entry["cost"]) * 100, 2) if entry["cost"] > 0 else 0

    entry["date_closed"] = date.today().isoformat()
    entry["exit_price"] = exit_price
    entry["proceeds"] = proceeds
    entry["pnl"] = pnl
    entry["pnl_pct"] = pnl_pct
    entry["exit_reason"] = exit_reason
    entry["lessons"] = lessons
    entry["grade"] = grade.upper() if grade else None
    entry["status"] = "closed"

    _save(entries)

    sym = "+" if pnl >= 0 else ""
    print(f"\n  Trade #{trade_id} closed:")
    print(f"    {entry['ticker']} {entry['direction']}")
    print(f"    Entry: ${entry['entry_price']:.2f} -> Exit: ${exit_price:.2f}")
    print(f"    P/L: {sym}${pnl:.2f} ({sym}{pnl_pct:.1f}%)")
    print(f"    Reason: {exit_reason}")
    if lessons:
        print(f"    Lessons: {lessons}")
    if grade:
        print(f"    Grade: {grade.upper()}")
    print()


# ---------- Analysis ---------- #

def show_open() -> None:
    """Show all open trades."""
    entries = [e for e in _load() if e["status"] == "open"]
    print(f"\n{'='*80}")
    print(f" Open Trades: {len(entries)}")
    print(f"{'='*80}")

    if not entries:
        print("  No open trades.\n")
        return

    for e in entries:
        days_held = (date.today() - date.fromisoformat(e["date_opened"])).days
        print(f"\n  #{e['id']} | {e['ticker']} {e['direction']} | {e['setup']} setup")
        print(f"       {e['contracts']}x @ ${e['entry_price']:.2f} = ${e['cost']:.2f} | Strikes: {e['strikes']}")
        print(f"       Exp: {e['expiration']} | Held: {days_held} days")
        print(f"       Thesis: {e['thesis']}")
    print()


def show_stats() -> None:
    """Show trading statistics and performance analysis."""
    entries = _load()
    closed = [e for e in entries if e["status"] == "closed"]
    open_trades = [e for e in entries if e["status"] == "open"]

    print(f"\n{'='*70}")
    print(f" Trading Journal Statistics")
    print(f"{'='*70}")

    if not closed:
        print(f"  Total trades: {len(entries)} ({len(open_trades)} open, 0 closed)")
        print("  No closed trades to analyze yet.\n")
        return

    wins = [t for t in closed if t["pnl"] >= 0]
    losses = [t for t in closed if t["pnl"] < 0]
    total_pnl = sum(t["pnl"] for t in closed)
    avg_win = sum(t["pnl"] for t in wins) / len(wins) if wins else 0
    avg_loss = sum(t["pnl"] for t in losses) / len(losses) if losses else 0
    win_rate = len(wins) / len(closed) * 100

    print(f"\n  Overview:")
    print(f"    Total trades:  {len(entries)} ({len(open_trades)} open, {len(closed)} closed)")
    print(f"    Wins:          {len(wins)}")
    print(f"    Losses:        {len(losses)}")
    print(f"    Win rate:      {win_rate:.0f}%")

    sym = "+" if total_pnl >= 0 else ""
    print(f"\n  P/L Summary:")
    print(f"    Total P/L:     {sym}${total_pnl:.2f}")
    print(f"    Avg win:       +${avg_win:.2f}")
    print(f"    Avg loss:      ${avg_loss:.2f}")
    if avg_loss != 0:
        print(f"    Win/Loss ratio: {abs(avg_win/avg_loss):.2f}:1")

    # Breakdown by setup type
    setups = {}
    for t in closed:
        s = t.get("setup", "unknown")
        if s not in setups:
            setups[s] = {"wins": 0, "losses": 0, "pnl": 0}
        if t["pnl"] >= 0:
            setups[s]["wins"] += 1
        else:
            setups[s]["losses"] += 1
        setups[s]["pnl"] += t["pnl"]

    if setups:
        print(f"\n  By Setup Type:")
        print(f"    {'Setup':<22} {'W':>4} {'L':>4} {'Rate':>6} {'P/L':>10}")
        print(f"    {'-'*22} {'-'*4} {'-'*4} {'-'*6} {'-'*10}")
        for setup_name, stats in sorted(setups.items()):
            total = stats["wins"] + stats["losses"]
            rate = stats["wins"] / total * 100 if total > 0 else 0
            sym = "+" if stats["pnl"] >= 0 else ""
            print(f"    {setup_name:<22} {stats['wins']:>4} {stats['losses']:>4} "
                  f"{rate:>5.0f}% {sym}${stats['pnl']:>8.2f}")

    # Breakdown by direction
    directions = {}
    for t in closed:
        d = t.get("direction", "unknown")
        if d not in directions:
            directions[d] = {"wins": 0, "losses": 0, "pnl": 0}
        if t["pnl"] >= 0:
            directions[d]["wins"] += 1
        else:
            directions[d]["losses"] += 1
        directions[d]["pnl"] += t["pnl"]

    if directions:
        print(f"\n  By Strategy:")
        print(f"    {'Strategy':<22} {'W':>4} {'L':>4} {'Rate':>6} {'P/L':>10}")
        print(f"    {'-'*22} {'-'*4} {'-'*4} {'-'*6} {'-'*10}")
        for dir_name, stats in sorted(directions.items()):
            total = stats["wins"] + stats["losses"]
            rate = stats["wins"] / total * 100 if total > 0 else 0
            sym = "+" if stats["pnl"] >= 0 else ""
            print(f"    {dir_name:<22} {stats['wins']:>4} {stats['losses']:>4} "
                  f"{rate:>5.0f}% {sym}${stats['pnl']:>8.2f}")

    # Grade distribution
    grades = {}
    for t in closed:
        g = t.get("grade") or "ungraded"
        grades[g] = grades.get(g, 0) + 1

    if grades:
        print(f"\n  Grade Distribution:")
        for g in sorted(grades.keys()):
            print(f"    {g}: {grades[g]} trades")

    print(f"\n{'='*70}\n")


def show_history(limit: int = 20) -> None:
    """Show recent trade history."""
    entries = _load()
    closed = [e for e in entries if e["status"] == "closed"]
    recent = closed[-limit:]

    print(f"\n{'='*85}")
    print(f" Recent Trade History (last {min(limit, len(closed))} of {len(closed)} closed trades)")
    print(f"{'='*85}")

    if not recent:
        print("  No closed trades yet.\n")
        return

    print(f" {'#':<4} {'Date':<11} {'Ticker':<7} {'Strategy':<18} {'P/L':>9} {'P/L%':>7} {'Grade':<5}")
    print(f" {'-'*4} {'-'*11} {'-'*7} {'-'*18} {'-'*9} {'-'*7} {'-'*5}")
    for t in recent:
        sym = "+" if t["pnl"] >= 0 else ""
        grade = t.get("grade") or "-"
        print(f" {t['id']:<4} {t['date_closed']:<11} {t['ticker']:<7} {t['direction']:<18} "
              f"{sym}${t['pnl']:>7.2f} {sym}{t['pnl_pct']:>5.1f}% {grade:<5}")

    print(f"{'='*85}\n")


# ---------- CLI ---------- #

USAGE = """
--- Options Swing Trading Journal ---

Commands:
  log <ticker> <direction> <setup> <entry_price> <contracts> <exp> <strikes> <thesis>
                                Log a new trade
  close <id> <exit_price> <reason> [lessons] [grade]
                                Close a trade with outcome
  open                          Show open trades
  history [limit]               Show recent closed trades
  stats                         Show trading statistics and analysis

Directions: long_call, long_put, bull_call_spread, bear_put_spread, csp, credit_spread
Setups: breakout, oversold_bounce, momentum_pullback, earnings, mean_reversion

Examples:
  python trade_journal.py log NVDA bull_call_spread breakout 1.50 1 2026-05-16 "880/900" "breaking out of consolidation"
  python trade_journal.py close 1 2.80 "hit profit target" "patience paid off" A
  python trade_journal.py stats
"""


def main():
    if len(sys.argv) < 2:
        print(USAGE)
        return

    cmd = sys.argv[1].lower()

    if cmd == "log":
        if len(sys.argv) < 10:
            print("Usage: log <ticker> <direction> <setup> <entry_price> <contracts> <exp> <strikes> <thesis>")
            return
        log_trade(
            ticker=sys.argv[2],
            direction=sys.argv[3],
            setup=sys.argv[4],
            entry_price=float(sys.argv[5]),
            contracts=int(sys.argv[6]),
            expiration=sys.argv[7],
            strikes=sys.argv[8],
            thesis=" ".join(sys.argv[9:]),
        )
    elif cmd == "close":
        if len(sys.argv) < 5:
            print("Usage: close <id> <exit_price> <reason> [lessons] [grade]")
            return
        # Parse: close <id> <exit_price> <reason> -- everything after is reason
        trade_id = int(sys.argv[2])
        exit_price = float(sys.argv[3])
        remaining = sys.argv[4:]
        # If last arg is a single letter A-F, treat as grade
        grade = ""
        lessons = ""
        if remaining and len(remaining[-1]) == 1 and remaining[-1].upper() in "ABCDF":
            grade = remaining.pop()
        reason = " ".join(remaining)
        close_trade(trade_id, exit_price, reason, lessons, grade)
    elif cmd == "open":
        show_open()
    elif cmd == "history":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
        show_history(limit)
    elif cmd == "stats":
        show_stats()
    else:
        print(f"Unknown command: {cmd}")
        print(USAGE)


if __name__ == "__main__":
    main()
