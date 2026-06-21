"""Pluggable data sources for listings.

Each source returns lists of raw dicts that `models.from_raw` normalizes.  The
CSV source is the guaranteed, always-available fallback; the Redfin scraper and
RapidAPI sources are best-effort live data.
"""

from .base import DataSource
from .csv_source import CSVSource
from .redfin_source import RedfinSource
from .rapidapi_source import RapidApiSource

__all__ = ["DataSource", "CSVSource", "RedfinSource", "RapidApiSource", "get_source"]


def get_source(name: str, **kwargs) -> DataSource:
    """Factory: return a source by name ("csv", "redfin", "rapidapi")."""
    name = (name or "csv").lower()
    if name == "csv":
        return CSVSource(**kwargs)
    if name == "redfin":
        return RedfinSource(**kwargs)
    if name == "rapidapi":
        return RapidApiSource(**kwargs)
    raise ValueError(f"Unknown source: {name!r}")
