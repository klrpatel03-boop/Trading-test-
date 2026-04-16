# IRA Trading Strategy & Portfolio Tracker

Trading strategy and portfolio management tools for a **$1,200 Rollover IRA** at Fidelity Investments.

## Overview

This repository contains a core-satellite investment strategy tailored for a small tax-advantaged retirement account, along with Python scripts for tracking and managing the portfolio.

- **STRATEGY.md** -- Detailed trading strategy document covering IRA rules, the core-satellite approach, specific allocations, entry/rebalancing/risk management rules, and tax advantages.
- **portfolio.py** -- Portfolio tracker that defines target allocations, tracks positions, calculates rebalancing trades, monitors performance over time, and runs risk checks.
- **watchlist.py** -- Curated watchlist of ETFs and individual stocks suitable for a small IRA, organized by category (core index, sector, growth, dividend).

## Quick Start

No external dependencies are required -- everything uses the Python standard library.

```bash
# View target allocations and portfolio dashboard
python3 portfolio.py

# View the full watchlist
python3 watchlist.py
```

### Tracking Your Portfolio

```python
from portfolio import update_position, record_snapshot, print_positions

# Record your holdings after purchasing
update_position("VOO", 0.89, 472.15)
update_position("VXUS", 3.12, 57.80)
# ... add all positions

# Take a performance snapshot
record_snapshot("Initial deployment")

# View your dashboard
print_positions()
```

## Strategy Summary

| Component | Allocation | Purpose |
|-----------|-----------|---------|
| **Core** (75%) | $900 | Broad market index ETFs for low-cost diversification |
| **Satellite** (25%) | $300 | Sector ETFs and tactical positions for alpha generation |

See [STRATEGY.md](STRATEGY.md) for the full plan.
