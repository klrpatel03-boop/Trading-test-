"""Redfin scraping source (best-effort).

Redfin exposes an unofficial "gis-csv" endpoint that returns search results as a
CSV with exactly the columns we need (LOT SIZE, YEAR BUILT, SQUARE FEET,
PROPERTY TYPE, URL, ...).  We:

  1. resolve a region (e.g. "Boston, MA") to its region_id/region_type via the
     location-autocomplete endpoint, then
  2. download the gis-csv for that region and parse it with the same logic as the
     CSV source.

This is unofficial and may break if Redfin changes things — so every network
step is wrapped to degrade gracefully (return []).  When it breaks, the family
can fall back to the manual CSV download or the RapidAPI source.  Be polite:
we rate-limit and send an honest User-Agent.

NOTE: Redfin's Terms of Service prohibit automated access.  This adapter is
intended for personal, low-volume use only; the manual "Download All" CSV path
(csv_source.py) is the recommended default.
"""

import csv
import io
import json
import time
from typing import List, Optional

try:
    import requests
except ImportError:  # requests is optional until the user installs it
    requests = None

from .. import config
from .base import DataSource

_AUTOCOMPLETE_URL = "https://www.redfin.com/stingray/do/location-autocomplete"
_GIS_CSV_URL = "https://www.redfin.com/stingray/api/gis-csv"

# Redfin prefixes JSON responses with this anti-hijacking guard.
_JSON_GUARD = "{}&&"


class RedfinSource(DataSource):
    name = "redfin"

    def __init__(self, markets: Optional[list] = None):
        # markets is a list of {"name", "query"} dicts (see config.MARKETS)
        self.markets = markets if markets is not None else config.MARKETS
        self._session = requests.Session() if requests else None
        if self._session:
            self._session.headers.update({"User-Agent": config.USER_AGENT})

    def is_available(self) -> bool:
        return requests is not None

    # --- internal helpers --- #

    def _get(self, url: str, params: dict) -> Optional[str]:
        try:
            resp = self._session.get(url, params=params, timeout=20)
            if resp.status_code != 200:
                return None
            return resp.text
        except Exception:
            return None

    def _resolve_region(self, query: str) -> Optional[dict]:
        """Return {"region_id", "region_type"} for a place name, or None."""
        text = self._get(_AUTOCOMPLETE_URL, {"location": query, "v": 2})
        if not text:
            return None
        if text.startswith(_JSON_GUARD):
            text = text[len(_JSON_GUARD):]
        try:
            data = json.loads(text)
            sections = data["payload"]["sections"]
        except (ValueError, KeyError, TypeError):
            return None
        for section in sections:
            for row in section.get("rows", []):
                # row["id"] looks like "6_19034" -> region_type "6", region_id "19034"
                rid = row.get("id", "")
                if "_" in rid:
                    rtype, region_id = rid.split("_", 1)
                    return {"region_id": region_id, "region_type": rtype}
        return None

    def _fetch_region_csv(self, region: dict) -> List[dict]:
        params = {
            "al": 1,
            "num_homes": 350,
            "ord": "redfin-recommended-asc",
            "page_number": 1,
            "region_id": region["region_id"],
            "region_type": region["region_type"],
            "status": 9,
            "uipt": "1,2,3,4,5,6,7,8",
            "v": 8,
        }
        text = self._get(_GIS_CSV_URL, params)
        if not text or "," not in text:
            return []
        try:
            reader = csv.DictReader(io.StringIO(text))
            return [dict(row) for row in reader]
        except Exception:
            return []

    # --- public API --- #

    def fetch_raw(self, market: Optional[str] = None) -> List[dict]:
        if not self.is_available():
            return []

        # If a specific market query is given, only fetch that one.
        if market:
            targets = [{"name": market, "query": market}]
        else:
            targets = self.markets

        rows: List[dict] = []
        for i, m in enumerate(targets):
            if i > 0:
                time.sleep(config.RATE_LIMIT_SECONDS)
            region = self._resolve_region(m["query"])
            if not region:
                continue
            time.sleep(config.RATE_LIMIT_SECONDS)
            rows.extend(self._fetch_region_csv(region))
        return rows
