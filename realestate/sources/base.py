"""Abstract data-source interface.

A source's only job is to produce raw listing dicts for a given market.  All
normalization, filtering and scoring happens downstream, so adding a new source
means implementing two small methods.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from ..models import Listing, from_raw


class DataSource(ABC):
    #: short identifier stored on each listing ("csv", "redfin", "rapidapi")
    name: str = "base"

    @abstractmethod
    def fetch_raw(self, market: Optional[str] = None) -> List[dict]:
        """Return raw listing dicts for `market` (or the source's default)."""

    def is_available(self) -> bool:
        """Whether this source can run right now (key present, file exists, ...)."""
        return True

    def fetch(self, market: Optional[str] = None) -> List[Listing]:
        """Fetch and normalize listings.  Never raises on bad rows."""
        listings: List[Listing] = []
        for raw in self.fetch_raw(market):
            try:
                listings.append(from_raw(raw, self.name))
            except Exception:
                # one bad row should never break a scan
                continue
        return listings
