#!/usr/bin/env python3
"""Local web app for the family's home search.

Run it:
  pip install -r realestate/requirements.txt
  python -m realestate.app
then open http://127.0.0.1:5000 in a browser.

Data flow: a source (CSV / Redfin / RapidAPI) -> normalize -> SQLite cache ->
engine (filter + score) -> JSON -> the single-page UI.  The CSV path works with
zero network access, so the app is always usable.

Usage:
  python -m realestate.app                  # start the web server (default)
  python -m realestate.app --scan           # one-off scan from CSV into the cache, then exit
  python -m realestate.app --scan --source redfin
"""

import argparse
import sys

from flask import Flask, jsonify, render_template, request

from . import cache, config, engine
from .sources import get_source

app = Flask(__name__)


def _scan(source_name: str = "csv", csv_text: str = None, market: str = None) -> dict:
    """Fetch from a source, cache, and return a small status dict."""
    kwargs = {}
    if source_name == "csv" and csv_text is not None:
        kwargs["text"] = csv_text
    if source_name in ("redfin", "rapidapi") and market:
        kwargs["markets"] = [{"name": market, "query": market}]

    source = get_source(source_name, **kwargs)
    if not source.is_available():
        return {
            "ok": False,
            "source": source_name,
            "error": f"Source '{source_name}' is not available "
            f"(missing file, API key, or the 'requests' package).",
        }
    listings = source.fetch(market)
    # score before caching so the cache stores final scores
    for lst in listings:
        lst.manageability_score = engine.score_manageability(lst)
    written = cache.upsert_listings(listings)
    return {"ok": True, "source": source_name, "fetched": len(listings), "cached": written}


def _criteria_from_request(args) -> dict:
    """Read optional filter overrides from query params, falling back to config."""
    def _f(name, default):
        try:
            return float(args.get(name)) if args.get(name) not in (None, "") else default
        except ValueError:
            return default

    def _i(name, default):
        try:
            return int(args.get(name)) if args.get(name) not in (None, "") else default
        except ValueError:
            return default

    require_single = args.get("single_story", "1") not in ("0", "false", "False", "")
    return {
        "lot_min": _f("lot_min", config.LOT_MIN_ACRES),
        "lot_max": _f("lot_max", config.LOT_MAX_ACRES),
        "min_year": _i("min_year", config.MIN_YEAR_BUILT),
        "require_single_story": require_single,
    }


# --- routes --- #

@app.route("/")
def index():
    return render_template(
        "index.html",
        defaults={
            "lot_min": config.LOT_MIN_ACRES,
            "lot_max": config.LOT_MAX_ACRES,
            "min_year": config.MIN_YEAR_BUILT,
            "current_year": config.CURRENT_YEAR,
            "desired_ceiling_ft": config.DESIRED_CEILING_FT,
        },
    )


@app.route("/api/listings")
def api_listings():
    criteria = _criteria_from_request(request.args)
    listings = cache.get_all()
    matched = engine.process(listings, **criteria)
    return jsonify(
        {
            "count": len(matched),
            "total_cached": len(listings),
            "cache_age_hours": cache.cache_age_hours(),
            "criteria": criteria,
            "listings": [l.to_dict() for l in matched],
        }
    )


@app.route("/api/refresh", methods=["POST"])
def api_refresh():
    body = request.get_json(silent=True) or {}
    source_name = body.get("source", "csv")
    market = body.get("market")
    result = _scan(source_name, market=market)
    status = 200 if result.get("ok") else 400
    return jsonify(result), status


@app.route("/api/import", methods=["POST"])
def api_import():
    """Accept an uploaded Redfin 'Download All' CSV file."""
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "No file uploaded."}), 400
    file = request.files["file"]
    try:
        text = file.read().decode("utf-8-sig")
    except UnicodeDecodeError:
        return jsonify({"ok": False, "error": "Could not read file as text/CSV."}), 400
    result = _scan("csv", csv_text=text)
    return jsonify(result), (200 if result.get("ok") else 400)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Family home scanner (Greater Boston + NH)")
    parser.add_argument("--scan", action="store_true", help="run one scan into the cache and exit")
    parser.add_argument("--source", default="csv", choices=["csv", "redfin", "rapidapi"])
    parser.add_argument("--market", default=None, help="single market query, e.g. 'Nashua, NH'")
    parser.add_argument("--host", default=config.HOST)
    parser.add_argument("--port", type=int, default=config.PORT)
    args = parser.parse_args(argv)

    cache.init_db()

    if args.scan:
        result = _scan(args.source, market=args.market)
        print(result)
        return 0 if result.get("ok") else 1

    # Seed the cache from the sample CSV on first run so the page isn't empty.
    if cache.count() == 0:
        print("Seeding cache from sample listings...")
        _scan("csv")

    print(f"Open http://{args.host}:{args.port} in your browser.")
    app.run(host=args.host, port=args.port, debug=False)
    return 0


if __name__ == "__main__":
    sys.exit(main())
