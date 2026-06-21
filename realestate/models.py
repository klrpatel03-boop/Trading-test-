"""Data model + normalization helpers.

Every data source (CSV, Redfin scrape, RapidAPI) produces raw dicts which are
normalized into a single `Listing` dataclass here.  Keeping normalization in one
place means a new source only has to map its field names; all the messy unit
handling (sqft -> acres) and inference (single-story) is shared.
"""

import hashlib
import re
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from typing import Optional

from . import config


# --- Low-level parsing helpers (all tolerant of junk / missing values) --- #

def _to_float(value) -> Optional[float]:
    """Parse a float from messy input ("$1,250", "1.5 acres", "—") or None."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    # keep digits, dot and minus only
    cleaned = re.sub(r"[^0-9.\-]", "", text)
    if cleaned in ("", "-", ".", "-."):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def _to_int(value) -> Optional[int]:
    f = _to_float(value)
    return int(round(f)) if f is not None else None


def normalize_lot_to_acres(raw_value) -> Optional[float]:
    """Normalize a lot-size value to acres.

    Redfin's "LOT SIZE" column is sometimes acres and sometimes square feet.
    Heuristic: values >= 1000 are almost certainly square feet (a 1000+ acre
    residential lot does not exist), so divide by 43560.  Smaller values are
    treated as already-acres.
    """
    val = _to_float(raw_value)
    if val is None or val <= 0:
        return None
    if val >= 1000:  # square feet
        return round(val / config.SQFT_PER_ACRE, 4)
    return round(val, 4)


# Property-type strings that imply a single story.
_SINGLE_STORY_HINTS = ("ranch", "single story", "single-story", "one story", "one-story")
# Property-type strings that clearly imply multiple stories.
_MULTI_STORY_HINTS = (
    "colonial",
    "townhouse",
    "town house",
    "townhome",
    "two story",
    "two-story",
    "tri-level",
    "split level",
    "split-level",
    "victorian",
    "garrison",
)


def infer_single_story(stories: Optional[int], property_type: Optional[str]):
    """Return (is_single_story, flagged).

    - True  -> confidently single story
    - False -> confidently multi story
    - None  -> unknown; `flagged` is True so the UI shows a "verify" badge and
               the listing is *kept* (we never drop a home just because the data
               is missing).
    """
    ptype = (property_type or "").lower()

    if stories is not None:
        if stories <= 1:
            return True, False
        return False, False

    if any(h in ptype for h in _SINGLE_STORY_HINTS):
        return True, False
    if any(h in ptype for h in _MULTI_STORY_HINTS):
        return False, False

    return None, True


# Regex for ceiling mentions in free-text descriptions.
_CEILING_RE = re.compile(
    r"[^.]*\b("
    r"\d{1,2}\s*(?:ft|foot|feet|'|-foot)\s*ceil"  # "9 ft ceilings", "9' ceilings"
    r"|\d{1,2}\s*foot\s+ceil"
    r"|(?:nine|ten|eleven|twelve)\s+foot\s+ceil"  # spelled out
    r"|high\s+ceil|vaulted\s+ceil|cathedral\s+ceil|soaring\s+ceil"
    r"|ceiling)[^.]*\.?",
    re.IGNORECASE,
)


def extract_ceiling_note(description: Optional[str]):
    """Scan a description for ceiling mentions.

    Returns (note, status):
      - note:   the matching sentence/snippet, or None
      - status: "mentioned" if the text references ceilings, else "needs_checking"

    Ceiling height is never used to filter — it is surfaced so the family can
    verify it during a viewing.
    """
    if not description:
        return None, "needs_checking"
    match = _CEILING_RE.search(description)
    if match:
        snippet = " ".join(match.group(0).split()).strip()
        if len(snippet) > 200:
            snippet = snippet[:197] + "..."
        return snippet, "mentioned"
    return None, "needs_checking"


def _make_id(source: str, source_id, url: str, address: str) -> str:
    """Stable id for de-duping across refreshes."""
    if source_id:
        return f"{source}:{source_id}"
    basis = (url or address or "").strip().lower()
    digest = hashlib.sha1(basis.encode("utf-8")).hexdigest()[:12]
    return f"{source}:{digest}"


@dataclass
class Listing:
    listing_id: str
    source: str
    url: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    zip_code: str = ""
    price: Optional[int] = None
    # filter-critical
    lot_size_acres: Optional[float] = None
    year_built: Optional[int] = None
    property_type: Optional[str] = None
    stories: Optional[int] = None
    sqft: Optional[int] = None
    beds: Optional[float] = None
    baths: Optional[float] = None
    # ceiling handling (never a hard filter)
    description: Optional[str] = None
    ceiling_note: Optional[str] = None
    ceiling_status: str = "needs_checking"
    # derived
    is_single_story: Optional[bool] = None
    single_story_flagged: bool = False
    manageability_score: int = 0
    # geo / bookkeeping
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    fetched_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


# Maps a variety of raw column/field names (Redfin CSV headers, RapidAPI keys,
# generic) to our normalized fields.  Lower-cased lookups.
_FIELD_ALIASES = {
    "url": ["url", "url (see https://www.redfin.com/buy-a-home/comparative-market-analysis)", "permalink", "href"],
    "address": ["address", "street address", "full_address", "line"],
    "city": ["city"],
    "state": ["state", "state or province"],
    "zip_code": ["zip", "zip code", "zip or postal code", "postal_code", "postal code"],
    "price": ["price", "list price", "list_price"],
    "lot_size_acres": ["lot size", "lot_size", "lot_sqft", "lotsize", "lot size (acres)"],
    "year_built": ["year built", "year_built", "yearbuilt"],
    "property_type": ["property type", "property_type", "prop_type", "type"],
    "stories": ["stories", "# stories", "num_stories", "levels"],
    "sqft": ["square feet", "sqft", "building_size", "living_area", "size"],
    "beds": ["beds", "bedrooms", "# beds"],
    "baths": ["baths", "bathrooms", "# baths", "full baths"],
    "description": ["description", "remarks", "public_remarks", "text"],
    "latitude": ["latitude", "lat"],
    "longitude": ["longitude", "lng", "long", "lon"],
}


def _lookup(raw_lower: dict, names) -> Optional[object]:
    for n in names:
        if n in raw_lower and raw_lower[n] not in ("", None):
            return raw_lower[n]
    return None


def from_raw(raw: dict, source: str) -> Listing:
    """Build a normalized `Listing` from a source's raw dict.

    Field-name matching is case-insensitive and alias-aware so the same function
    works for Redfin CSV headers and the RapidAPI JSON shape.
    """
    raw_lower = {str(k).strip().lower(): v for k, v in raw.items()}

    url = str(_lookup(raw_lower, _FIELD_ALIASES["url"]) or "")
    address = str(_lookup(raw_lower, _FIELD_ALIASES["address"]) or "")
    source_id = raw_lower.get("listing_id") or raw_lower.get("mls#") or raw_lower.get("property_id")

    description = _lookup(raw_lower, _FIELD_ALIASES["description"])
    description = str(description) if description is not None else None
    ceiling_note, ceiling_status = extract_ceiling_note(description)

    stories = _to_int(_lookup(raw_lower, _FIELD_ALIASES["stories"]))
    property_type = _lookup(raw_lower, _FIELD_ALIASES["property_type"])
    property_type = str(property_type) if property_type is not None else None
    is_single, flagged = infer_single_story(stories, property_type)

    listing = Listing(
        listing_id=_make_id(source, source_id, url, address),
        source=source,
        url=url,
        address=address,
        city=str(_lookup(raw_lower, _FIELD_ALIASES["city"]) or ""),
        state=str(_lookup(raw_lower, _FIELD_ALIASES["state"]) or ""),
        zip_code=str(_lookup(raw_lower, _FIELD_ALIASES["zip_code"]) or ""),
        price=_to_int(_lookup(raw_lower, _FIELD_ALIASES["price"])),
        lot_size_acres=normalize_lot_to_acres(_lookup(raw_lower, _FIELD_ALIASES["lot_size_acres"])),
        year_built=_to_int(_lookup(raw_lower, _FIELD_ALIASES["year_built"])),
        property_type=property_type,
        stories=stories,
        sqft=_to_int(_lookup(raw_lower, _FIELD_ALIASES["sqft"])),
        beds=_to_float(_lookup(raw_lower, _FIELD_ALIASES["beds"])),
        baths=_to_float(_lookup(raw_lower, _FIELD_ALIASES["baths"])),
        description=description,
        ceiling_note=ceiling_note,
        ceiling_status=ceiling_status,
        is_single_story=is_single,
        single_story_flagged=flagged,
        latitude=_to_float(_lookup(raw_lower, _FIELD_ALIASES["latitude"])),
        longitude=_to_float(_lookup(raw_lower, _FIELD_ALIASES["longitude"])),
    )
    return listing
