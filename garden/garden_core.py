#!/usr/bin/env python3
"""
Core logic for the garden tracker: data storage, weather-aware watering
schedule, and the photo journal.

Everything persists to a single JSON file (data/garden.json) and photos
live in data/photos/. No database required.
"""

import json
import urllib.request
import urllib.error
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
PHOTO_DIR = DATA_DIR / "photos"
DB_FILE = DATA_DIR / "garden.json"

# Weather is cached for the day so we do not hammer the API on every page load.
_WEATHER_CACHE = {"date": None, "lat": None, "lon": None, "data": None}

# Sensible defaults — the user overrides location on the Settings page.
DEFAULT_SETTINGS = {
    "place_name": "My Garden",
    "latitude": 40.7128,
    "longitude": -74.0060,
}

SUN_OPTIONS = ["Full sun", "Part sun", "Part shade", "Full shade"]


# --------------------------------------------------------------------------- #
# Storage
# --------------------------------------------------------------------------- #

def _empty_db():
    return {"settings": dict(DEFAULT_SETTINGS), "plants": [], "journal": []}


def load_db():
    DATA_DIR.mkdir(exist_ok=True)
    PHOTO_DIR.mkdir(exist_ok=True)
    if not DB_FILE.exists():
        save_db(_empty_db())
    with open(DB_FILE) as f:
        db = json.load(f)
    # Forward-compatible defaults in case the file predates a field.
    db.setdefault("settings", dict(DEFAULT_SETTINGS))
    for key, val in DEFAULT_SETTINGS.items():
        db["settings"].setdefault(key, val)
    db.setdefault("plants", [])
    db.setdefault("journal", [])
    return db


def save_db(db):
    DATA_DIR.mkdir(exist_ok=True)
    with open(DB_FILE, "w") as f:
        json.dump(db, f, indent=2, default=str)


# --------------------------------------------------------------------------- #
# Plants
# --------------------------------------------------------------------------- #

def add_plant(name, species, bed, sun, water_interval_days, planted_date, notes=""):
    db = load_db()
    plant = {
        "id": uuid.uuid4().hex[:8],
        "name": name.strip(),
        "species": species.strip(),
        "bed": bed.strip(),
        "sun": sun if sun in SUN_OPTIONS else SUN_OPTIONS[0],
        "water_interval_days": max(1, int(water_interval_days)),
        "planted_date": planted_date or date.today().isoformat(),
        "last_watered": None,
        "notes": notes.strip(),
    }
    db["plants"].append(plant)
    save_db(db)
    return plant


def get_plant(db, plant_id):
    return next((p for p in db["plants"] if p["id"] == plant_id), None)


def update_plant(plant_id, **fields):
    db = load_db()
    plant = get_plant(db, plant_id)
    if not plant:
        return None
    for key in ("name", "species", "bed", "sun", "notes", "planted_date", "last_watered"):
        if key in fields and fields[key] is not None:
            plant[key] = fields[key]
    if fields.get("water_interval_days"):
        plant["water_interval_days"] = max(1, int(fields["water_interval_days"]))
    save_db(db)
    return plant


def mark_watered(plant_id, when=None):
    db = load_db()
    plant = get_plant(db, plant_id)
    if not plant:
        return None
    plant["last_watered"] = (when or date.today().isoformat())
    save_db(db)
    return plant


def delete_plant(plant_id):
    db = load_db()
    db["plants"] = [p for p in db["plants"] if p["id"] != plant_id]
    # Drop journal entries (and their photos) for the removed plant.
    keep = []
    for entry in db["journal"]:
        if entry.get("plant_id") == plant_id:
            _remove_photo(entry.get("photo"))
        else:
            keep.append(entry)
    db["journal"] = keep
    save_db(db)


# --------------------------------------------------------------------------- #
# Weather (Open-Meteo, no API key required)
# --------------------------------------------------------------------------- #

def get_weather(lat, lon, force=False):
    """Return a dict of today's + upcoming daily forecast, or None if offline."""
    today = date.today().isoformat()
    cache_hit = (
        not force
        and _WEATHER_CACHE["date"] == today
        and _WEATHER_CACHE["lat"] == lat
        and _WEATHER_CACHE["lon"] == lon
        and _WEATHER_CACHE["data"] is not None
    )
    if cache_hit:
        return _WEATHER_CACHE["data"]

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&daily=precipitation_sum,precipitation_probability_max,"
        "temperature_2m_max,temperature_2m_min,weather_code"
        "&temperature_unit=fahrenheit&precipitation_unit=inch"
        "&forecast_days=5&timezone=auto"
    )
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            raw = json.load(resp)
    except (urllib.error.URLError, TimeoutError, ValueError, OSError):
        return None

    daily = raw.get("daily", {})
    days = []
    for i, day in enumerate(daily.get("time", [])):
        days.append({
            "date": day,
            "precip_in": _at(daily.get("precipitation_sum"), i, 0.0),
            "precip_prob": _at(daily.get("precipitation_probability_max"), i, 0),
            "temp_max": _at(daily.get("temperature_2m_max"), i, None),
            "temp_min": _at(daily.get("temperature_2m_min"), i, None),
            "code": _at(daily.get("weather_code"), i, 0),
            "desc": _weather_desc(_at(daily.get("weather_code"), i, 0)),
        })
    data = {"days": days, "fetched": datetime.now().isoformat(timespec="minutes")}
    _WEATHER_CACHE.update({"date": today, "lat": lat, "lon": lon, "data": data})
    return data


def _at(seq, i, default):
    if seq and i < len(seq) and seq[i] is not None:
        return seq[i]
    return default


def _weather_desc(code):
    # Condensed WMO weather-code mapping.
    if code == 0:
        return "Clear"
    if code in (1, 2, 3):
        return "Partly cloudy"
    if code in (45, 48):
        return "Fog"
    if code in (51, 53, 55, 56, 57):
        return "Drizzle"
    if code in (61, 63, 65, 66, 67, 80, 81, 82):
        return "Rain"
    if code in (71, 73, 75, 77, 85, 86):
        return "Snow"
    if code in (95, 96, 99):
        return "Thunderstorm"
    return "Mixed"


# --------------------------------------------------------------------------- #
# The smart part: weather-aware watering status
# --------------------------------------------------------------------------- #

# Rain past this threshold (inches) counts as "the sky watered for you".
RAIN_SKIP_IN = 0.25
HOT_F = 90      # speed up watering above this high
WARM_F = 80
COOL_F = 55     # slow down watering below this high


def _weather_factor(today_weather):
    """Scale the base interval: <1 means water more often, >1 less often."""
    if not today_weather:
        return 1.0
    tmax = today_weather.get("temp_max")
    if tmax is None:
        return 1.0
    if tmax >= HOT_F:
        return 0.7
    if tmax >= WARM_F:
        return 0.85
    if tmax <= COOL_F:
        return 1.3
    return 1.0


def _days_between(iso_a, iso_b):
    return (date.fromisoformat(iso_a) - date.fromisoformat(iso_b)).days


def watering_status(plant, weather):
    """
    Decide whether a plant needs water today, accounting for recent/coming
    rain and temperature. Returns a dict the UI can render directly.
    """
    today = date.today().isoformat()
    days_map = {d["date"]: d for d in (weather["days"] if weather else [])}
    today_w = days_map.get(today)

    base = plant["water_interval_days"]
    factor = _weather_factor(today_w)
    effective = max(1, round(base * factor))

    last = plant.get("last_watered")
    days_since = _days_between(today, last) if last else None

    # Rain coming today/tomorrow heavy enough to skip a watering?
    rain_today = today_w["precip_in"] if today_w else 0.0
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    rain_tomorrow = days_map[tomorrow]["precip_in"] if tomorrow in days_map else 0.0
    rain_relief = rain_today >= RAIN_SKIP_IN or rain_tomorrow >= RAIN_SKIP_IN

    # Decide state.
    if days_since is None:
        state, label, urgency = "unknown", "Never logged — water & log it", 2
    elif rain_relief and days_since < base + 2:
        inches = max(rain_today, rain_tomorrow)
        state, label, urgency = "rain", f"Rain expected ({inches:.2f}in) — skip", 0
    elif days_since >= effective:
        over = days_since - effective
        if over >= 2:
            state, label, urgency = "overdue", f"Overdue by {over}d — water now", 3
        else:
            state, label, urgency = "due", "Water today", 2
    elif days_since >= effective - 1:
        state, label, urgency = "soon", "Due tomorrow", 1
    else:
        nxt = effective - days_since
        state, label, urgency = "ok", f"OK — next in {nxt}d", 0

    note = None
    if today_w and today_w.get("temp_max", 0) >= HOT_F and state in ("due", "overdue"):
        note = "Heat — water deeply, early or late."
    elif factor < 1 and state == "ok":
        note = "Warm spell — schedule sped up."
    elif factor > 1 and state == "ok":
        note = "Cool — watering stretched out."

    return {
        "state": state,
        "label": label,
        "urgency": urgency,
        "days_since": days_since,
        "effective_interval": effective,
        "base_interval": base,
        "note": note,
    }


def dashboard_data():
    """Assemble everything the dashboard needs in one call."""
    db = load_db()
    s = db["settings"]
    weather = get_weather(s["latitude"], s["longitude"])
    plants = []
    for p in db["plants"]:
        status = watering_status(p, weather)
        plants.append({**p, "status": status})
    # Sort by urgency (most urgent first), then name.
    plants.sort(key=lambda p: (-p["status"]["urgency"], p["name"].lower()))
    to_water = [p for p in plants if p["status"]["state"] in ("due", "overdue", "unknown")]
    return {
        "settings": s,
        "weather": weather,
        "plants": plants,
        "to_water": to_water,
        "today": date.today().isoformat(),
    }


# --------------------------------------------------------------------------- #
# Photo journal
# --------------------------------------------------------------------------- #

def add_journal_entry(plant_id, note, photo_filename=None, entry_date=None):
    db = load_db()
    entry = {
        "id": uuid.uuid4().hex[:8],
        "plant_id": plant_id,
        "date": entry_date or date.today().isoformat(),
        "note": (note or "").strip(),
        "photo": photo_filename,
        "created": datetime.now().isoformat(timespec="seconds"),
    }
    db["journal"].append(entry)
    save_db(db)
    return entry


def journal_for_plant(db, plant_id):
    entries = [e for e in db["journal"] if e.get("plant_id") == plant_id]
    entries.sort(key=lambda e: e.get("date", ""), reverse=True)
    return entries


def recent_journal(db, limit=12):
    entries = sorted(db["journal"], key=lambda e: e.get("created", ""), reverse=True)
    return entries[:limit]


def save_photo(file_storage):
    """Persist an uploaded werkzeug FileStorage and return the stored filename."""
    if not file_storage or not file_storage.filename:
        return None
    ext = Path(file_storage.filename).suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic"):
        ext = ".jpg"
    fname = f"{uuid.uuid4().hex}{ext}"
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    file_storage.save(PHOTO_DIR / fname)
    return fname


def _remove_photo(filename):
    if not filename:
        return
    target = PHOTO_DIR / filename
    try:
        target.unlink(missing_ok=True)
    except OSError:
        pass
