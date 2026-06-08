# 🌱 Garden Tracker

A simple, self-hosted web dashboard that makes watering your outdoor beds
smarter and the whole garden more fun to engage with.

It does three things well:

1. **Weather-aware watering** — each plant has a base watering interval, but the
   schedule auto-tightens in heat, stretches in cool weather, and **skips when
   rain is on the way**. The "Today" page tells you exactly what to water.
2. **Photo journal** — snap a photo + note on any plant and watch it grow over
   time. A running timeline per plant and a gallery across the whole garden.
3. **Zero fuss** — one JSON file for data, photos on disk, free weather from
   [Open-Meteo](https://open-meteo.com) (no API key). Runs on your laptop.

## Quick start

```bash
cd garden
pip install -r requirements.txt
python app.py
```

Open <http://localhost:5000>, go to **Settings**, set your latitude/longitude,
then **+ Add plant**.

## How the smart watering works

For each plant the app compares *days since last watered* against a
*weather-adjusted interval*:

| Condition (today's high)        | Effect on interval |
|---------------------------------|--------------------|
| ≥ 90°F                          | ×0.7 (water sooner) |
| ≥ 80°F                          | ×0.85 |
| 55–80°F                         | unchanged |
| ≤ 55°F                          | ×1.3 (water later) |
| ≥ 0.25in rain today/tomorrow    | skip — the sky's got it |

Plants are ranked by urgency on the **Today** page: overdue → due → due
tomorrow → resting. Hit **💧 Watered** to log it and reset the clock.

## Pages

- **Today** — weather strip + the water-now list + everything resting.
- **Plants** — grid of every plant with status and a one-tap water button.
- **Plant detail** — status, edit details, and the photo-journal timeline.
- **Journal** — gallery of every photo/note across the garden.
- **Settings** — garden name and location (drives the weather).

## Files

| File              | Purpose                                            |
|-------------------|----------------------------------------------------|
| `app.py`          | Flask routes / web layer                           |
| `garden_core.py`  | Storage, weather fetch, watering logic, journal    |
| `templates/`      | HTML pages                                          |
| `static/style.css`| Styling                                            |
| `data/garden.json`| Your plants, journal, settings (git-ignored)       |
| `data/photos/`    | Uploaded photos (git-ignored)                      |

## Roadmap (Tier 2+)

- Morning Discord/text reminder with the day's watering list (reuse the
  webhook pattern from the trading bot).
- Seasonal calendar: frost dates, "start seeds", fertilizing reminders.
- Harvest tracking and per-plant productivity.
- Soil-moisture sensors (ESP32) for watering by real soil state.
