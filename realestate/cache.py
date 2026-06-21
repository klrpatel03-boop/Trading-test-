"""SQLite cache of listings.

Caching matters for two reasons: it keeps the app fast on re-runs, and it lets
us be polite to the listing sites (we don't re-fetch what we already have).  The
table stores the full normalized listing as JSON plus a few indexed columns we
filter/sort on.
"""

import json
import sqlite3
from datetime import datetime, timezone
from typing import List, Optional

from . import config
from .models import Listing


def _connect() -> sqlite3.Connection:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS listings (
                listing_id      TEXT PRIMARY KEY,
                source          TEXT,
                lot_size_acres  REAL,
                year_built      INTEGER,
                manageability   INTEGER,
                fetched_at      TEXT,
                data            TEXT NOT NULL
            )
            """
        )
        conn.commit()


def upsert_listings(listings: List[Listing]) -> int:
    """Insert or replace listings.  Returns the number written."""
    if not listings:
        return 0
    init_db()
    rows = [
        (
            l.listing_id,
            l.source,
            l.lot_size_acres,
            l.year_built,
            l.manageability_score,
            l.fetched_at,
            json.dumps(l.to_dict()),
        )
        for l in listings
    ]
    with _connect() as conn:
        conn.executemany(
            """
            INSERT INTO listings
                (listing_id, source, lot_size_acres, year_built, manageability, fetched_at, data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(listing_id) DO UPDATE SET
                source=excluded.source,
                lot_size_acres=excluded.lot_size_acres,
                year_built=excluded.year_built,
                manageability=excluded.manageability,
                fetched_at=excluded.fetched_at,
                data=excluded.data
            """,
            rows,
        )
        conn.commit()
    return len(rows)


def get_all() -> List[Listing]:
    """Return every cached listing as a `Listing` object."""
    init_db()
    with _connect() as conn:
        cur = conn.execute("SELECT data FROM listings")
        out = []
        for row in cur.fetchall():
            out.append(Listing(**json.loads(row["data"])))
        return out


def count() -> int:
    init_db()
    with _connect() as conn:
        return conn.execute("SELECT COUNT(*) FROM listings").fetchone()[0]


def newest_fetched_at() -> Optional[str]:
    """ISO timestamp of the most recently fetched listing, or None if empty."""
    init_db()
    with _connect() as conn:
        row = conn.execute("SELECT MAX(fetched_at) FROM listings").fetchone()
        return row[0] if row and row[0] else None


def cache_age_hours() -> Optional[float]:
    ts = newest_fetched_at()
    if not ts:
        return None
    try:
        when = datetime.fromisoformat(ts)
    except ValueError:
        return None
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    delta = datetime.now(timezone.utc) - when
    return round(delta.total_seconds() / 3600, 1)


def clear() -> None:
    init_db()
    with _connect() as conn:
        conn.execute("DELETE FROM listings")
        conn.commit()
