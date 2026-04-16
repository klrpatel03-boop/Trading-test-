# Aggressive Options Swing Trading — $1,200 Rollover IRA

Options swing trading strategy and tools for a **$1,200 Rollover IRA** at Fidelity. Built for aggressive, active trading using debit spreads, long calls/puts, cash-secured puts, and credit spreads.

## Files

| File               | Purpose                                            |
|--------------------|----------------------------------------------------|
| `STRATEGY.md`      | Full trading playbook — setups, rules, risk management |
| `portfolio.py`     | Track open positions, P/L, cash, and account value |
| `screener.py`      | Watchlist with options liquidity data + setup checklists |
| `trade_journal.py` | Log every trade with thesis, outcome, and self-grading |

## Quick Start

No dependencies — everything uses the Python standard library.

```bash
# View the trading strategy
cat STRATEGY.md

# Portfolio management
python3 portfolio.py positions           # Show open positions
python3 portfolio.py open NVDA bull_call_spread 1 1.50 150 250 2026-05-16 "breakout"
python3 portfolio.py close 1 2.80 "profit target hit"
python3 portfolio.py history             # Trade history with P/L stats
python3 portfolio.py risk 150            # Risk-check before entering

# Screener and watchlist
python3 screener.py watchlist            # Full watchlist
python3 screener.py watchlist 1          # Tier 1 only (mega-caps)
python3 screener.py detail NVDA          # Detailed stock info
python3 screener.py setup breakout       # Setup checklist
python3 screener.py sizing 1200         # Position sizing rules

# Trade journal
python3 trade_journal.py log NVDA bull_call_spread breakout 1.50 1 2026-05-16 "880/900" "breaking out"
python3 trade_journal.py close 1 2.80 "hit target" A
python3 trade_journal.py stats           # Win rate, P/L by setup, by strategy
```

## Strategy Summary

- **Style**: Aggressive options swing trading (2-15 day holds)
- **Primary tool**: Debit spreads (defined risk, capital efficient)
- **Risk per trade**: Max 5% of account ($60 on $1,200)
- **Max deployed**: 80% of account (20% always in cash)
- **Max positions**: 4 open at any time

See [STRATEGY.md](STRATEGY.md) for the full playbook.
