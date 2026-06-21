# 🏡 Family Home Finder — Greater Boston &amp; New Hampshire

A small, local web app that scans home listings and surfaces the ones that match
your family's criteria, ranked by how **easy to manage** they are.

## What it looks for

| Criterion | Rule |
|---|---|
| **Lot size** | 0.5 – 0.7 acre (hard filter) |
| **Age** | Built in the last 20 years (year built ≥ {`current year − 20`}) |
| **Single-story** | Keeps confirmed ranches/single-level homes; *excludes* homes known to be multi-story. If the listing doesn't say, the home is **kept and flagged** "verify single-story" so you can check. |
| **9 ft ceilings** | **Not** filtered (listings rarely state it). Each home shows a **"ceiling: needs checking"** badge, or surfaces the sentence if the description mentions ceilings. Confirm at the viewing. |
| **Big kitchen** | Also **not** filtered (kitchen size isn't a data field). Detected from the description (gourmet/eat-in/large/island, etc.) and shown as a **"big kitchen"** badge. Tick **"Prefer big kitchen"** to float those homes to the top of the list. |
| **Easy to manage** | A 0–100 **manageability score** (single-story + newer + smaller lot + right-sized house). Results are sorted best-first. |

You can adjust the lot range, "built since" year, and the single-story toggle
right in the page.

## Quick start

```bash
# from the repo root
pip install -r realestate/requirements.txt
python -m realestate.app
```

Then open **http://127.0.0.1:5000** in your browser. On first run it loads bundled
sample listings so you can see how it works immediately.

## Getting real listings — three ways

The app has a pluggable data layer. In order of reliability:

### 1. Import a Redfin CSV (recommended, always works)
This is the most reliable and the most respectful of the sites' terms:
1. Go to [redfin.com](https://www.redfin.com), search your area (e.g. *Nashua, NH*),
   and apply filters.
2. Scroll to the bottom of the results and click **"Download All"** — Redfin
   gives you a CSV.
3. In the app, click **"Import Redfin CSV"** and choose that file.

The CSV already contains lot size, year built, square feet, type, and the listing
URL, which is everything the app needs.

### 2. Live refresh from Redfin (best-effort)
Pick **"Refresh from Redfin (live)"** in the source dropdown and click **Refresh
data**. The app resolves your market and pulls Redfin's results automatically.
This is *unofficial* and can break if Redfin changes their site — if it returns
nothing, use the CSV import above or the RapidAPI option below.

### 3. RapidAPI (maintained fallback)
1. Get a free API key from the
   ["Realty in US" API on RapidAPI](https://rapidapi.com/apidojo/api/realty-in-us).
2. Set it before launching:
   ```bash
   export REALESTATE_RAPIDAPI_KEY="your-key-here"
   python -m realestate.app
   ```
3. Choose **"Refresh from RapidAPI"** and click **Refresh data**.

## Configuring criteria &amp; markets

Edit `realestate/config.py`:
- `LOT_MIN_ACRES`, `LOT_MAX_ACRES`, `YEARS_BACK` — the filter thresholds.
- `MARKETS` — the places to search (defaults: Greater Boston, MA and New Hampshire).
- `RATE_LIMIT_SECONDS` — how gently to scrape.

## Running the tests

```bash
python -m unittest discover -s realestate/tests
```

## One-off scan from the command line

```bash
python -m realestate.app --scan                 # scan the sample CSV into the cache
python -m realestate.app --scan --source redfin --market "Nashua, NH"
```

## A note on scraping (please read)

Major real-estate sites' Terms of Service prohibit automated access, and they
actively block bots. This tool is built for **personal, low-volume, family use**
and is deliberately polite (it rate-limits, caches aggressively, and identifies
itself honestly). The **manual CSV download (option 1) is the recommended
default** — it's the most reliable and the cleanest way to get data. Use the live
scraper sparingly.

## How it's organized

```
realestate/
├── app.py            # Flask web app (routes + CLI)
├── config.py         # all the knobs (criteria, markets, rate limits)
├── models.py         # Listing model + normalization (sqft→acres, ceiling text, single-story)
├── engine.py         # filtering + manageability scoring
├── cache.py          # SQLite cache
├── sources/          # csv (default) · redfin (scrape) · rapidapi (fallback)
├── templates/ + static/   # the web UI
└── tests/            # unit tests (no extra deps)
```
