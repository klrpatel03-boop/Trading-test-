"""Filtering + manageability scoring.

This is the heart of the app: given normalized `Listing` objects, decide which
match the family's hard criteria and rank the survivors by how "easy to manage"
they are.  All logic is intentionally simple and transparent so the family can
understand and tweak it.
"""

from typing import List, Optional

from . import config
from .models import Listing


def passes_filters(
    listing: Listing,
    lot_min: float = config.LOT_MIN_ACRES,
    lot_max: float = config.LOT_MAX_ACRES,
    min_year: int = config.MIN_YEAR_BUILT,
    require_single_story: bool = True,
) -> bool:
    """Return True if the listing meets the family's hard criteria.

    Policy notes:
      - Lot size and year built are hard filters; a listing with *unknown* lot
        size or year is excluded (we can't confirm it qualifies).
      - Single-story is a "soft-hard" filter: we only exclude listings we *know*
        are multi-story.  Unknowns are kept (and flagged in the UI for the family
        to verify), because story count is frequently missing from listing data.
    """
    if listing.lot_size_acres is None:
        return False
    if not (lot_min <= listing.lot_size_acres <= lot_max):
        return False

    if listing.year_built is None:
        return False
    if listing.year_built < min_year:
        return False

    if require_single_story and listing.is_single_story is False:
        return False

    return True


def score_manageability(listing: Listing) -> int:
    """Score 0-100 for how easy the home is to manage.

    Weighting (see plan): single-story dominates because it is the family's core
    "easy to manage" signal; newness drives low maintenance; a smaller lot and a
    smaller house each shave upkeep.  Every term degrades gracefully when a field
    is missing (missing -> 0, except single-story-unknown which gets partial
    credit).  Ceiling height is deliberately excluded — it's a nice-to-have only.
    """
    score = 0.0

    # Single-story — 40 pts.
    if listing.is_single_story is True:
        score += 40
    elif listing.is_single_story is None:
        score += 20  # unknown: partial credit, flagged in UI
    # confirmed multi-story: +0

    # Newness / low maintenance — 30 pts, linear across the 20-year window.
    if listing.year_built is not None:
        years_old = config.CURRENT_YEAR - listing.year_built
        score += round(max(0.0, (config.YEARS_BACK - years_old) / config.YEARS_BACK) * 30)

    # Right-sized lot — 15 pts, favoring the lower (easier) end of the range.
    if listing.lot_size_acres is not None:
        span = config.LOT_MAX_ACRES - config.LOT_MIN_ACRES
        if span > 0:
            frac = (config.LOT_MAX_ACRES - listing.lot_size_acres) / span
            score += round(max(0.0, min(1.0, frac)) * 15)

    # Right-sized home — 15 pts.
    if listing.sqft is not None:
        if listing.sqft <= 2000:
            score += 15
        elif listing.sqft <= 2800:
            score += 10
        elif listing.sqft <= 3500:
            score += 5
        # bigger: +0

    return int(max(0, min(100, round(score))))


def process(
    listings: List[Listing],
    lot_min: float = config.LOT_MIN_ACRES,
    lot_max: float = config.LOT_MAX_ACRES,
    min_year: int = config.MIN_YEAR_BUILT,
    require_single_story: bool = True,
) -> List[Listing]:
    """Filter, score, and sort listings (best/most-manageable first)."""
    survivors = []
    for lst in listings:
        if passes_filters(lst, lot_min, lot_max, min_year, require_single_story):
            lst.manageability_score = score_manageability(lst)
            survivors.append(lst)
    survivors.sort(key=lambda l: l.manageability_score, reverse=True)
    return survivors
