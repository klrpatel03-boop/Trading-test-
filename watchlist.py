#!/usr/bin/env python3
"""
Watchlist for $1,200 Rollover IRA at Fidelity

Curated list of ETFs and stocks suitable for a small IRA account.
All picks are available commission-free at Fidelity with fractional
share support, making them accessible even with limited capital.

Uses only the Python standard library.
"""

from datetime import date
from typing import Optional

# ---------------------------------------------------------------------------
# Watchlist data
# ---------------------------------------------------------------------------

WATCHLIST: list[dict] = [
    # ------------------------------------------------------------------
    # CORE INDEX ETFs  --  Foundation of the portfolio
    # ------------------------------------------------------------------
    {
        "ticker": "VOO",
        "name": "Vanguard S&P 500 ETF",
        "category": "Core Index ETF",
        "expense_ratio": 0.03,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Gold-standard S&P 500 tracker. 0.03% expense ratio is among "
            "the lowest available. Ideal core holding for US large-cap exposure."
        ),
    },
    {
        "ticker": "VTI",
        "name": "Vanguard Total Stock Market ETF",
        "category": "Core Index ETF",
        "expense_ratio": 0.03,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Total US stock market in one fund (~4,000 stocks). Can replace "
            "VOO + VXF for simplicity. Same rock-bottom 0.03% expense ratio."
        ),
    },
    {
        "ticker": "SCHB",
        "name": "Schwab US Broad Market ETF",
        "category": "Core Index ETF",
        "expense_ratio": 0.03,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Schwab's total market ETF. Comparable to VTI. Useful alternative "
            "if you prefer Schwab-family funds. 0.03% expense ratio."
        ),
    },
    {
        "ticker": "VXF",
        "name": "Vanguard Extended Market ETF",
        "category": "Core Index ETF",
        "expense_ratio": 0.06,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Covers mid-cap and small-cap stocks outside the S&P 500. "
            "Pair with VOO for complete US market coverage at low cost."
        ),
    },
    {
        "ticker": "VXUS",
        "name": "Vanguard Total International Stock ETF",
        "category": "Core Index ETF",
        "expense_ratio": 0.07,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "One-fund international diversification: developed + emerging "
            "markets. Essential for reducing home-country bias in a US portfolio."
        ),
    },
    {
        "ticker": "IXUS",
        "name": "iShares Core MSCI Total International Stock ETF",
        "category": "Core Index ETF",
        "expense_ratio": 0.07,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "iShares alternative to VXUS with nearly identical holdings "
            "and expense ratio. Choose based on personal preference."
        ),
    },

    # ------------------------------------------------------------------
    # SECTOR ETFs  --  Satellite / tactical rotation candidates
    # ------------------------------------------------------------------
    {
        "ticker": "XLK",
        "name": "Technology Select Sector SPDR",
        "category": "Sector ETF",
        "expense_ratio": 0.09,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Broad technology exposure including AAPL, MSFT, NVDA. "
            "Low expense ratio for a sector fund. Good satellite for tech conviction."
        ),
    },
    {
        "ticker": "XLV",
        "name": "Health Care Select Sector SPDR",
        "category": "Sector ETF",
        "expense_ratio": 0.09,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Defensive sector with secular tailwinds (aging demographics). "
            "Includes pharma, biotech, and health insurers. Lower volatility than tech."
        ),
    },
    {
        "ticker": "XLE",
        "name": "Energy Select Sector SPDR",
        "category": "Sector ETF",
        "expense_ratio": 0.09,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Energy sector exposure. Useful as an inflation hedge and for "
            "portfolio diversification during commodity upcycles."
        ),
    },
    {
        "ticker": "XLF",
        "name": "Financial Select Sector SPDR",
        "category": "Sector ETF",
        "expense_ratio": 0.09,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Financials benefit from rising rates and economic expansion. "
            "Includes banks, insurers, and asset managers."
        ),
    },
    {
        "ticker": "SOXX",
        "name": "iShares Semiconductor ETF",
        "category": "Sector ETF",
        "expense_ratio": 0.35,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Concentrated semiconductor exposure (NVDA, AMD, AVGO, etc.). "
            "Higher expense ratio but captures AI infrastructure build-out theme. "
            "More volatile -- size accordingly."
        ),
    },
    {
        "ticker": "ARKK",
        "name": "ARK Innovation ETF",
        "category": "Sector ETF",
        "expense_ratio": 0.75,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "High-conviction disruptive innovation fund. Very volatile and "
            "higher expense ratio (0.75%). Use only as a small speculative "
            "satellite position if you have strong conviction in disruptive tech."
        ),
    },

    # ------------------------------------------------------------------
    # GROWTH STOCKS  --  Individual names for satellite sleeve
    # ------------------------------------------------------------------
    {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "category": "Growth Stock",
        "expense_ratio": None,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Largest US company by market cap. Strong ecosystem, massive "
            "cash flows, consistent buybacks. Blue-chip growth at reasonable "
            "valuation. Fractional shares make it accessible at any account size."
        ),
    },
    {
        "ticker": "MSFT",
        "name": "Microsoft Corp.",
        "category": "Growth Stock",
        "expense_ratio": None,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Cloud (Azure) and AI leader. Recurring revenue model through "
            "Office 365, Azure, and enterprise software. Strong moat."
        ),
    },
    {
        "ticker": "NVDA",
        "name": "NVIDIA Corp.",
        "category": "Growth Stock",
        "expense_ratio": None,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Dominant AI/GPU infrastructure provider. High growth but also "
            "high valuation -- position size carefully in a small account."
        ),
    },
    {
        "ticker": "GOOGL",
        "name": "Alphabet Inc. (Google)",
        "category": "Growth Stock",
        "expense_ratio": None,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Search and cloud giant with growing AI capabilities. "
            "Dominant digital advertising moat. Trades at a reasonable "
            "P/E relative to mega-cap tech peers."
        ),
    },
    {
        "ticker": "AMZN",
        "name": "Amazon.com Inc.",
        "category": "Growth Stock",
        "expense_ratio": None,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "E-commerce and cloud (AWS) leader. AWS is the profit engine. "
            "Fractional shares at Fidelity make the high share price irrelevant."
        ),
    },
    {
        "ticker": "META",
        "name": "Meta Platforms Inc.",
        "category": "Growth Stock",
        "expense_ratio": None,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Social media and advertising powerhouse. Strong cash generation, "
            "heavy AI investment. Trades at a lower multiple than most mega-cap tech."
        ),
    },

    # ------------------------------------------------------------------
    # DIVIDEND ETFs  --  Income + stability inside the IRA
    # ------------------------------------------------------------------
    {
        "ticker": "SCHD",
        "name": "Schwab US Dividend Equity ETF",
        "category": "Dividend ETF",
        "expense_ratio": 0.06,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "High-quality dividend growers. Screens for fundamentals (cash flow, "
            "ROE, dividend growth). 0.06% expense ratio. Excellent core holding "
            "that adds a quality/value tilt."
        ),
    },
    {
        "ticker": "VYM",
        "name": "Vanguard High Dividend Yield ETF",
        "category": "Dividend ETF",
        "expense_ratio": 0.06,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Broad high-yield dividend ETF. More diversified than SCHD with "
            "~400 stocks. Slightly higher yield but less quality screening."
        ),
    },
    {
        "ticker": "DGRO",
        "name": "iShares Core Dividend Growth ETF",
        "category": "Dividend ETF",
        "expense_ratio": 0.08,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Focuses on companies with 5+ years of consecutive dividend growth. "
            "Good blend of income and capital appreciation. Ideal inside an IRA "
            "where dividends compound tax-free."
        ),
    },
    {
        "ticker": "VIG",
        "name": "Vanguard Dividend Appreciation ETF",
        "category": "Dividend ETF",
        "expense_ratio": 0.06,
        "commission_free": True,
        "fractional_shares": True,
        "notes": (
            "Tracks companies with 10+ consecutive years of dividend increases. "
            "More conservative tilt. Strong long-term track record. "
            "0.06% expense ratio keeps costs negligible."
        ),
    },
]


# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

def _category_header(category: str) -> str:
    """Return a formatted section header."""
    icons = {
        "Core Index ETF": "CORE INDEX ETFs",
        "Sector ETF": "SECTOR ETFs",
        "Growth Stock": "GROWTH STOCKS",
        "Dividend ETF": "DIVIDEND ETFs",
    }
    title = icons.get(category, category.upper())
    return f"\n  --- {title} {'-' * (55 - len(title))}"


def print_watchlist(category: Optional[str] = None) -> None:
    """
    Print the watchlist, optionally filtered to a single category.

    Args:
        category: One of 'Core Index ETF', 'Sector ETF', 'Growth Stock',
                  'Dividend ETF', or None for all.
    """
    items = WATCHLIST if category is None else [
        w for w in WATCHLIST if w["category"] == category
    ]

    if not items:
        print(f"  No watchlist items found for category: {category}")
        return

    print(f"\n{'='*72}")
    print(f"  IRA Watchlist  --  {len(items)} securities  --  {date.today().isoformat()}")
    print(f"{'='*72}")

    current_cat = None
    for item in items:
        if item["category"] != current_cat:
            current_cat = item["category"]
            print(_category_header(current_cat))

        er = f"{item['expense_ratio']:.2f}%" if item["expense_ratio"] is not None else "N/A (stock)"
        print(f"\n  {item['ticker']:<8} {item['name']}")
        print(f"           Expense ratio: {er}  |  Commission-free: {'Yes' if item['commission_free'] else 'No'}  |  Fractional: {'Yes' if item['fractional_shares'] else 'No'}")
        print(f"           {item['notes']}")

    print(f"\n{'='*72}")
    print("  All listed securities are commission-free at Fidelity and support")
    print("  fractional share purchases, making them suitable for small accounts.")
    print(f"{'='*72}\n")


def search_watchlist(query: str) -> list[dict]:
    """Search the watchlist by ticker or name (case-insensitive)."""
    query = query.upper()
    results = [
        item for item in WATCHLIST
        if query in item["ticker"].upper() or query in item["name"].upper()
    ]
    return results


def print_by_expense_ratio() -> None:
    """Print ETFs sorted by expense ratio (lowest first)."""
    etfs = [w for w in WATCHLIST if w["expense_ratio"] is not None]
    etfs.sort(key=lambda x: x["expense_ratio"])

    print(f"\n{'='*60}")
    print(f"  ETFs by Expense Ratio (lowest first)")
    print(f"{'='*60}")
    print(f"  {'Ticker':<8} {'Expense':>8}  {'Name'}")
    print(f"  {'-'*8} {'-'*8}  {'-'*38}")
    for item in etfs:
        print(f"  {item['ticker']:<8} {item['expense_ratio']:>7.2f}%  {item['name']}")
    print()


def get_categories() -> list[str]:
    """Return a sorted list of unique categories in the watchlist."""
    return sorted(set(w["category"] for w in WATCHLIST))


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------

def main() -> None:
    """Display the full watchlist."""
    print_watchlist()
    print_by_expense_ratio()


if __name__ == "__main__":
    main()
