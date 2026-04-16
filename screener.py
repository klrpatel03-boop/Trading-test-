#!/usr/bin/env python3
"""
Options swing trading screener and watchlist.
Provides a curated list of high-liquidity stocks ideal for options swing trading,
with technical setup checklists and position sizing calculators.
No external dependencies — uses only the Python standard library.
"""

import sys
from datetime import date

# ---------- Watchlist ---------- #

WATCHLIST = [
    # --- Tier 1: Ultra-Liquid Mega-Caps (tightest options spreads) ---
    {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "tier": 1,
        "sector": "Technology",
        "avg_weekly_range": "3-5%",
        "options_liquidity": "Excellent",
        "strike_width": "$2.50",
        "why": "Ultra-liquid options, clean technicals, consistent trends. Penny-wide bid-ask on ATM options.",
    },
    {
        "ticker": "NVDA",
        "name": "NVIDIA Corp.",
        "tier": 1,
        "sector": "Semiconductors",
        "avg_weekly_range": "5-10%",
        "options_liquidity": "Excellent",
        "strike_width": "$5",
        "why": "High volatility + massive options volume. AI narrative drives strong trends. Great for directional plays.",
    },
    {
        "ticker": "AMD",
        "name": "Advanced Micro Devices",
        "tier": 1,
        "sector": "Semiconductors",
        "avg_weekly_range": "5-8%",
        "options_liquidity": "Excellent",
        "strike_width": "$1",
        "why": "Volatile, follows NVDA, affordable premiums. $1 wide strikes = precise spread construction.",
    },
    {
        "ticker": "TSLA",
        "name": "Tesla Inc.",
        "tier": 1,
        "sector": "Auto/Tech",
        "avg_weekly_range": "5-12%",
        "options_liquidity": "Excellent",
        "strike_width": "$5",
        "why": "Massive moves, extremely liquid options. Best stock for swing trading volatility.",
    },
    {
        "ticker": "META",
        "name": "Meta Platforms",
        "tier": 1,
        "sector": "Technology",
        "avg_weekly_range": "3-6%",
        "options_liquidity": "Excellent",
        "strike_width": "$5",
        "why": "Strong trends, reacts well to catalysts. Liquid options with tight spreads.",
    },
    {
        "ticker": "AMZN",
        "name": "Amazon.com",
        "tier": 1,
        "sector": "Consumer/Tech",
        "avg_weekly_range": "3-5%",
        "options_liquidity": "Excellent",
        "strike_width": "$5",
        "why": "Clean breakout patterns, liquid options. AWS earnings are major catalysts.",
    },
    {
        "ticker": "MSFT",
        "name": "Microsoft Corp.",
        "tier": 1,
        "sector": "Technology",
        "avg_weekly_range": "2-4%",
        "options_liquidity": "Excellent",
        "strike_width": "$5",
        "why": "Steady trends, reliable support/resistance. Lower volatility = good for spreads.",
    },
    {
        "ticker": "GOOGL",
        "name": "Alphabet Inc.",
        "tier": 1,
        "sector": "Technology",
        "avg_weekly_range": "3-5%",
        "options_liquidity": "Excellent",
        "strike_width": "$5",
        "why": "Liquid options, clean patterns. Trades at reasonable multiples for mega-cap tech.",
    },

    # --- Tier 2: High-Volatility Swing Candidates (bigger moves, wider spreads) ---
    {
        "ticker": "COIN",
        "name": "Coinbase Global",
        "tier": 2,
        "sector": "Crypto/Fintech",
        "avg_weekly_range": "8-15%",
        "options_liquidity": "Good",
        "strike_width": "$5",
        "why": "Extreme volatility correlated with crypto. Massive earnings moves. Size small.",
    },
    {
        "ticker": "XYZ",
        "name": "Block Inc. (fka Square)",
        "tier": 2,
        "sector": "Fintech",
        "avg_weekly_range": "5-8%",
        "options_liquidity": "Good",
        "strike_width": "$1",
        "why": "Volatile fintech, follows market sentiment. Affordable options premiums.",
    },
    {
        "ticker": "SHOP",
        "name": "Shopify Inc.",
        "tier": 2,
        "sector": "E-commerce",
        "avg_weekly_range": "5-8%",
        "options_liquidity": "Good",
        "strike_width": "$2.50",
        "why": "Big moves on earnings and macro. Growth stock with high beta.",
    },
    {
        "ticker": "SOFI",
        "name": "SoFi Technologies",
        "tier": 2,
        "sector": "Fintech",
        "avg_weekly_range": "5-10%",
        "options_liquidity": "Good",
        "strike_width": "$0.50",
        "why": "Low share price = cheap options contracts. Volatile. Good for small accounts.",
    },
    {
        "ticker": "PLTR",
        "name": "Palantir Technologies",
        "tier": 2,
        "sector": "AI/Defense",
        "avg_weekly_range": "5-10%",
        "options_liquidity": "Good",
        "strike_width": "$1",
        "why": "AI narrative, high retail interest, volatile. Affordable premiums.",
    },
    {
        "ticker": "CRWD",
        "name": "CrowdStrike Holdings",
        "tier": 2,
        "sector": "Cybersecurity",
        "avg_weekly_range": "4-7%",
        "options_liquidity": "Good",
        "strike_width": "$5",
        "why": "Strong trends, reacts to cybersecurity news cycle. Clear support/resistance.",
    },
    {
        "ticker": "MARA",
        "name": "Marathon Digital",
        "tier": 2,
        "sector": "Crypto Mining",
        "avg_weekly_range": "10-20%",
        "options_liquidity": "Good",
        "strike_width": "$0.50",
        "why": "Extreme volatility, very cheap options. High risk/reward. Tiny position sizes only.",
    },
    {
        "ticker": "ROKU",
        "name": "Roku Inc.",
        "tier": 2,
        "sector": "Streaming",
        "avg_weekly_range": "5-10%",
        "options_liquidity": "Good",
        "strike_width": "$2.50",
        "why": "High beta, large earnings moves. Good for earnings plays and momentum swings.",
    },

    # --- Tier 3: Sector ETFs for Macro/Sector Swings ---
    {
        "ticker": "SPY",
        "name": "SPDR S&P 500 ETF",
        "tier": 3,
        "sector": "Broad Market",
        "avg_weekly_range": "1-3%",
        "options_liquidity": "Best in world",
        "strike_width": "$1",
        "why": "Most liquid options on earth. Perfect for macro directional bets. Penny-wide spreads.",
    },
    {
        "ticker": "QQQ",
        "name": "Invesco Nasdaq 100 ETF",
        "tier": 3,
        "sector": "Tech-Heavy",
        "avg_weekly_range": "2-4%",
        "options_liquidity": "Excellent",
        "strike_width": "$1",
        "why": "Tech-weighted broad bet. More volatile than SPY. Excellent options liquidity.",
    },
    {
        "ticker": "SMH",
        "name": "VanEck Semiconductor ETF",
        "tier": 3,
        "sector": "Semiconductors",
        "avg_weekly_range": "3-6%",
        "options_liquidity": "Very Good",
        "strike_width": "$1",
        "why": "AI/chip cycle plays without single-stock risk. Good alternative to NVDA/AMD options.",
    },
    {
        "ticker": "XLE",
        "name": "Energy Select Sector SPDR",
        "tier": 3,
        "sector": "Energy",
        "avg_weekly_range": "2-5%",
        "options_liquidity": "Very Good",
        "strike_width": "$1",
        "why": "Oil price swings = clear directional setups. Good for macro-driven trades.",
    },
    {
        "ticker": "XLF",
        "name": "Financial Select Sector SPDR",
        "tier": 3,
        "sector": "Financials",
        "avg_weekly_range": "2-4%",
        "options_liquidity": "Very Good",
        "strike_width": "$0.50",
        "why": "Rate-sensitive sector. Fed decisions = clear catalysts. Affordable premiums.",
    },
    {
        "ticker": "GLD",
        "name": "SPDR Gold Shares",
        "tier": 3,
        "sector": "Commodities",
        "avg_weekly_range": "2-4%",
        "options_liquidity": "Very Good",
        "strike_width": "$1",
        "why": "Flight-to-safety / inflation hedge. Uncorrelated to tech. Good for portfolio hedging.",
    },
    {
        "ticker": "ARKK",
        "name": "ARK Innovation ETF",
        "tier": 3,
        "sector": "Innovation",
        "avg_weekly_range": "4-8%",
        "options_liquidity": "Good",
        "strike_width": "$1",
        "why": "High beta speculative tech basket. Cheap premiums. Good for aggressive directional bets.",
    },
]


# ---------- Watchlist Access Helpers ---------- #

def get_tickers(tier: int = 0) -> list[str]:
    """Return list of ticker symbols, optionally filtered by tier."""
    items = WATCHLIST if tier == 0 else [w for w in WATCHLIST if w["tier"] == tier]
    return [w["ticker"] for w in items]


def get_watchlist_entry(ticker: str) -> dict | None:
    """Return the watchlist dict for a given ticker."""
    for w in WATCHLIST:
        if w["ticker"].upper() == ticker.upper():
            return w
    return None


def get_sector_map() -> dict[str, list[str]]:
    """Return {sector: [tickers]} mapping."""
    sectors: dict[str, list[str]] = {}
    for w in WATCHLIST:
        sectors.setdefault(w["sector"], []).append(w["ticker"])
    return sectors


# ---------- Setup Checklists ---------- #

SETUPS = {
    "breakout": {
        "name": "Breakout Swing",
        "strategy": "Bull Call Spread or Long Call",
        "checklist": [
            "Stock consolidating in tight range for 5+ days",
            "Volume drying up during consolidation",
            "Price breaks above resistance on above-average volume",
            "RSI between 40-60 (not overbought yet)",
            "No major earnings within 7 days (unless intentional)",
        ],
        "entry": "Buy ATM call or bull call spread, 21-30 DTE",
        "target": "80-150% of debit paid",
        "stop": "Close at 40% loss of spread value",
    },
    "oversold_bounce": {
        "name": "Oversold Bounce",
        "strategy": "Bull Call Spread or Long Call",
        "checklist": [
            "RSI below 30 on daily chart",
            "Price at major support (50-day MA, prior low, VWAP)",
            "Bullish reversal candle (hammer, engulfing, morning star)",
            "Volume increasing on the reversal day",
            "Broader market not in freefall (check SPY)",
        ],
        "entry": "Buy ATM/slightly ITM call, 30-45 DTE",
        "target": "50-100% gain on option premium",
        "stop": "Close if stock breaks below support level",
    },
    "momentum_pullback": {
        "name": "Momentum Pullback",
        "strategy": "Long Call",
        "checklist": [
            "Stock in strong uptrend (above rising 20-day and 50-day MA)",
            "Pulls back to 20-day MA on declining volume",
            "RSI pulls back to 40-50 range (not oversold, just cooled off)",
            "Bounces off 20-day MA with increasing volume",
            "Sector/market also trending up",
        ],
        "entry": "Buy slightly ITM call, 30-45 DTE",
        "target": "Trail stop — ride the next leg up",
        "stop": "Close if stock closes below 50-day MA",
    },
    "earnings_play": {
        "name": "Earnings Play",
        "strategy": "Debit Spread or Long Straddle",
        "checklist": [
            "Stock has history of 5%+ earnings moves",
            "IV has not fully expanded yet (enter 5-7 days before)",
            "Clear directional bias from sector/guidance trends",
            "Options pricing implies move smaller than historical average",
            "Position sized SMALL — max $60-$100 risk",
        ],
        "entry": "Directional spread or straddle, closest expiration after earnings",
        "target": "Close day after earnings — capture the move",
        "stop": "Accept max loss on defined-risk spreads",
    },
    "mean_reversion_csp": {
        "name": "Mean Reversion (Cash-Secured Put)",
        "strategy": "Cash-Secured Put",
        "checklist": [
            "High-quality stock drops 10%+ on broad market weakness",
            "Drop NOT caused by company-specific bad news",
            "RSI deeply oversold (below 25)",
            "You would happily own shares at the strike price",
            "Enough cash to cover assignment",
        ],
        "entry": "Sell put 5-10% below current price, 30-45 DTE",
        "target": "Keep full premium if stock stays above strike",
        "stop": "Accept assignment — you get shares at a discount",
    },
}


# ---------- Position Sizing Calculator ---------- #

def calculate_position_size(account_value: float, risk_pct: float = 0.05) -> dict:
    """Calculate position sizing limits for a given account value."""
    max_risk = round(account_value * risk_pct, 2)
    max_single = round(account_value * 0.15, 2)
    max_deployed = round(account_value * 0.80, 2)
    cash_reserve = round(account_value * 0.20, 2)

    return {
        "account_value": account_value,
        "max_risk_per_trade": max_risk,
        "max_single_position": max_single,
        "max_total_deployed": max_deployed,
        "min_cash_reserve": cash_reserve,
        "max_open_positions": 4,
        "suggested_spread_cost": f"${max_risk * 0.5:.0f}-${max_risk:.0f}",
    }


# ---------- Display ---------- #

def print_watchlist(tier: int = 0) -> None:
    """Print the watchlist, optionally filtered by tier."""
    items = WATCHLIST if tier == 0 else [w for w in WATCHLIST if w["tier"] == tier]

    tier_names = {
        1: "TIER 1: Ultra-Liquid Mega-Caps",
        2: "TIER 2: High-Volatility Swing Candidates",
        3: "TIER 3: Sector ETFs for Macro Swings",
    }

    print(f"\n{'='*90}")
    print(f" Options Swing Trading Watchlist  |  {date.today().isoformat()}")
    print(f"{'='*90}")

    current_tier = 0
    for w in items:
        if w["tier"] != current_tier:
            current_tier = w["tier"]
            print(f"\n  --- {tier_names.get(current_tier, f'TIER {current_tier}')} ---\n")
            print(f"  {'Ticker':<7} {'Name':<25} {'Sector':<16} {'Weekly Range':<12} {'Liquidity':<12}")
            print(f"  {'-'*7} {'-'*25} {'-'*16} {'-'*12} {'-'*12}")

        print(f"  {w['ticker']:<7} {w['name']:<25} {w['sector']:<16} "
              f"{w['avg_weekly_range']:<12} {w['options_liquidity']:<12}")

    print(f"\n{'='*90}\n")


def print_watchlist_detail(ticker: str) -> None:
    """Print detailed info for a specific watchlist stock."""
    match = [w for w in WATCHLIST if w["ticker"].upper() == ticker.upper()]
    if not match:
        print(f"  {ticker} not found in watchlist.")
        return

    w = match[0]
    print(f"\n  {w['ticker']} — {w['name']}")
    print(f"  Tier: {w['tier']}  |  Sector: {w['sector']}")
    print(f"  Avg Weekly Range: {w['avg_weekly_range']}")
    print(f"  Options Liquidity: {w['options_liquidity']}")
    print(f"  Strike Width: {w['strike_width']}")
    print(f"  Why: {w['why']}\n")


def print_setup(setup_name: str) -> None:
    """Print a trade setup checklist."""
    setup = SETUPS.get(setup_name)
    if not setup:
        print(f"  Unknown setup: {setup_name}")
        print(f"  Available: {', '.join(SETUPS.keys())}")
        return

    print(f"\n{'='*60}")
    print(f"  Setup: {setup['name']}")
    print(f"  Strategy: {setup['strategy']}")
    print(f"{'='*60}")
    print(f"\n  Checklist:")
    for i, item in enumerate(setup["checklist"], 1):
        print(f"    [ ] {i}. {item}")
    print(f"\n  Entry:  {setup['entry']}")
    print(f"  Target: {setup['target']}")
    print(f"  Stop:   {setup['stop']}")
    print()


def print_sizing(account_value: float = 1200.00) -> None:
    """Print position sizing rules."""
    sizing = calculate_position_size(account_value)
    print(f"\n{'='*50}")
    print(f"  Position Sizing — Account: ${account_value:,.2f}")
    print(f"{'='*50}")
    print(f"  Max risk per trade:    ${sizing['max_risk_per_trade']:>8,.2f}")
    print(f"  Max single position:   ${sizing['max_single_position']:>8,.2f}")
    print(f"  Max total deployed:    ${sizing['max_total_deployed']:>8,.2f}")
    print(f"  Min cash reserve:      ${sizing['min_cash_reserve']:>8,.2f}")
    print(f"  Max open positions:    {sizing['max_open_positions']}")
    print(f"  Suggested spread cost: {sizing['suggested_spread_cost']}")
    print(f"{'='*50}\n")


# ---------- CLI ---------- #

USAGE = """
--- Options Swing Trading Screener ---

Commands:
  watchlist               Show full watchlist
  watchlist <tier>        Show watchlist for tier 1, 2, or 3
  detail <ticker>         Show detailed info for a stock
  setup <name>            Show trade setup checklist
  setups                  List all available setups
  sizing [account_value]  Show position sizing rules

Examples:
  python screener.py watchlist 1
  python screener.py detail NVDA
  python screener.py setup breakout
  python screener.py sizing 1500
"""


def main():
    if len(sys.argv) < 2:
        print(USAGE)
        return

    cmd = sys.argv[1].lower()

    if cmd == "watchlist":
        tier = int(sys.argv[2]) if len(sys.argv) > 2 else 0
        print_watchlist(tier)
    elif cmd == "detail":
        if len(sys.argv) < 3:
            print("Usage: detail <ticker>")
            return
        print_watchlist_detail(sys.argv[2])
    elif cmd == "setup":
        if len(sys.argv) < 3:
            print("Usage: setup <name>")
            print(f"Available: {', '.join(SETUPS.keys())}")
            return
        print_setup(sys.argv[2])
    elif cmd == "setups":
        print("\nAvailable setups:")
        for name, setup in SETUPS.items():
            print(f"  {name:<22} — {setup['name']} ({setup['strategy']})")
        print()
    elif cmd == "sizing":
        val = float(sys.argv[2]) if len(sys.argv) > 2 else 1200.00
        print_sizing(val)
    else:
        print(f"Unknown command: {cmd}")
        print(USAGE)


if __name__ == "__main__":
    main()
