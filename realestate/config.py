"""Configuration for the real estate scanner.

All tunable knobs live here so the family can adjust criteria without touching
the rest of the code. Filter thresholds reflect the family's stated needs.
"""

import os
from datetime import date
from pathlib import Path

# --- Paths --- #
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "cache.db"
SAMPLE_CSV = DATA_DIR / "sample_listings.csv"

# --- Filter thresholds (the family's criteria) --- #
# Lot size in acres.
LOT_MIN_ACRES = 0.5
LOT_MAX_ACRES = 0.7

# "Built in the last 20 years."  Computed from the current year so it stays
# correct over time rather than being hard-coded to a single year.
YEARS_BACK = 20
CURRENT_YEAR = date.today().year
MIN_YEAR_BUILT = CURRENT_YEAR - YEARS_BACK  # e.g. 2006 in 2026

# Ceiling height the family wants (used only for description text matching, never
# as a hard filter — it is rarely present in structured listing data).
DESIRED_CEILING_FT = 9

# --- Markets to search (Greater Boston + New Hampshire) --- #
# Each entry is a Redfin "region" search.  region_id / region_type are what the
# Redfin gis-csv endpoint needs; they can be discovered from a Redfin search URL.
# These are starting points the family can edit/extend.
MARKETS = [
    {"name": "Greater Boston, MA", "query": "Boston, MA"},
    {"name": "New Hampshire", "query": "New Hampshire"},
]

# --- Scraping politeness --- #
# Seconds to wait between network requests.  Keep this generous: this is a
# personal, low-volume tool and we want to be a good citizen.
RATE_LIMIT_SECONDS = float(os.environ.get("REALESTATE_RATE_LIMIT", "5"))

# A descriptive, honest User-Agent.
USER_AGENT = os.environ.get(
    "REALESTATE_USER_AGENT",
    "FamilyHomeScanner/0.1 (personal, low-volume; +https://github.com/klrpatel03-boop/trading-test-)",
)

# Treat cached listings older than this (hours) as stale in the UI.
CACHE_STALE_HOURS = 24

# --- RapidAPI fallback (optional) --- #
# Set REALESTATE_RAPIDAPI_KEY in the environment to enable the API fallback.
RAPIDAPI_KEY = os.environ.get("REALESTATE_RAPIDAPI_KEY", "")
RAPIDAPI_HOST = os.environ.get("REALESTATE_RAPIDAPI_HOST", "realty-in-us.p.rapidapi.com")

# --- Web server --- #
HOST = os.environ.get("REALESTATE_HOST", "127.0.0.1")
PORT = int(os.environ.get("REALESTATE_PORT", "5000"))

# Square feet per acre (lot-size unit conversion).
SQFT_PER_ACRE = 43560
