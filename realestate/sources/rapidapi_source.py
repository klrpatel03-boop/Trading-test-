"""RapidAPI source — a maintained drop-in fallback when scraping breaks.

Uses the "Realty in US" (apidojo) API on RapidAPI.  Free tier (~100 req/month)
is plenty for a family running a scan a few times a week, and it insulates us
from Redfin changing its HTML/endpoints.  Enable it by setting
REALESTATE_RAPIDAPI_KEY in the environment.

The JSON shape is mapped to the same raw-dict keys our model understands, so the
rest of the pipeline is identical to the CSV / Redfin paths.
"""

from typing import List, Optional

try:
    import requests
except ImportError:
    requests = None

from .. import config
from .base import DataSource

_LIST_URL = "https://{host}/properties/v3/list"


class RapidApiSource(DataSource):
    name = "rapidapi"

    def __init__(self, api_key: Optional[str] = None, host: Optional[str] = None,
                 markets: Optional[list] = None):
        self.api_key = api_key if api_key is not None else config.RAPIDAPI_KEY
        self.host = host or config.RAPIDAPI_HOST
        self.markets = markets if markets is not None else config.MARKETS

    def is_available(self) -> bool:
        return bool(self.api_key) and requests is not None

    def _headers(self) -> dict:
        return {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": self.host,
            "Content-Type": "application/json",
        }

    def _query_state_city(self, query: str):
        """Best-effort split of "City, ST" / "State" into (city, state_code)."""
        parts = [p.strip() for p in query.split(",")]
        if len(parts) == 2:
            return parts[0], parts[1]
        return None, parts[0]

    def fetch_raw(self, market: Optional[str] = None) -> List[dict]:
        if not self.is_available():
            return []

        targets = [{"name": market, "query": market}] if market else self.markets
        rows: List[dict] = []
        url = _LIST_URL.format(host=self.host)

        for m in targets:
            city, state = self._query_state_city(m["query"])
            payload = {
                "limit": 200,
                "offset": 0,
                "status": ["for_sale"],
                "sort": {"direction": "desc", "field": "list_date"},
            }
            if city:
                payload["city"] = city
            if state:
                payload["state_code"] = state
            try:
                resp = requests.post(url, json=payload, headers=self._headers(), timeout=25)
                if resp.status_code != 200:
                    continue
                data = resp.json()
            except Exception:
                continue
            for home in data.get("data", {}).get("home_search", {}).get("results", []) or []:
                rows.append(self._flatten(home))
        return rows

    @staticmethod
    def _flatten(home: dict) -> dict:
        """Map the nested RapidAPI home object to our flat alias keys."""
        desc = home.get("description") or {}
        loc = (home.get("location") or {}).get("address") or {}
        coord = loc.get("coordinate") or {}
        return {
            "property_id": home.get("property_id"),
            "url": home.get("href") or "",
            "address": loc.get("line") or "",
            "city": loc.get("city") or "",
            "state": loc.get("state_code") or "",
            "zip": loc.get("postal_code") or "",
            "price": home.get("list_price"),
            "lot_sqft": desc.get("lot_sqft"),
            "year_built": desc.get("year_built"),
            "property_type": desc.get("type"),
            "stories": desc.get("stories"),
            "sqft": desc.get("sqft"),
            "beds": desc.get("beds"),
            "baths": desc.get("baths"),
            "description": (home.get("description") or {}).get("text") or "",
            "latitude": coord.get("lat"),
            "longitude": coord.get("lon"),
        }
