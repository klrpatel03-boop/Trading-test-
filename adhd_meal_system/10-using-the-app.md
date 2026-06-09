# 10 — Using the App (and putting it on your iPhone)

The written docs (`00`–`09`) are the system in plain text. The **app** (`app/`) is the
same system, but it does the work for you: picks your meals, plans the week, builds the
shopping list, tracks weight/water, and links every recipe to a tested cookbook. This
page is how to actually get it running — especially on your phone.

---

## Run it on a computer (10 seconds)

Open `app/index.html` in any browser. Done. Everything is stored on your device.

For offline install + reminders, serve it over http instead of `file://`:

```bash
cd adhd_meal_system/app
python3 -m http.server 8000
# visit http://localhost:8000
```

---

## Put it on your iPhone (recommended)

The app is a **PWA** — it installs to your home screen and runs full-screen, offline,
like a real app. Two ways to get it onto your phone:

### Option A — Host it free with GitHub Pages
1. Push this repo to GitHub.
2. **Settings → Pages →** deploy from your branch. Set the folder to where `app/` lives
   (or move `app/`'s contents to the repo root / a `docs/` folder).
3. Open the Pages URL on your iPhone **in Safari**.
4. **Share → Add to Home Screen.** Tap the Anchor icon any time.

### Option B — Same Wi-Fi, no hosting
1. On your computer, run `python3 -m http.server 8000` inside `app/`.
2. Find your computer's local IP (e.g. `192.168.1.20`).
3. On your iPhone (same Wi-Fi), open `http://192.168.1.20:8000` in Safari.
4. **Share → Add to Home Screen.**

> Once added to the Home Screen, it works offline (service worker caches everything) and
> can send meal reminders at your scheduled times.

### Don't want to install anything?
Just read the docs on your phone. Open the repo in the **GitHub mobile app** and read
`00-START-HERE.md`, `03-meal-menu.md`, `09-recipes-and-cookbooks.md`, and the printable
`app/cheatsheet.html`. The app is a convenience, not a requirement.

---

## What to do first, in the app

1. **Onboarding** asks your weight + goal (it defaults to lean weight gain). 30 seconds.
2. **Today** shows your decided meals. Tap any to see the recipe + a tested-cookbook link.
3. **Settings → Anchor schedule:** set your real times and copy the alarm labels to your
   phone clock. Turn on reminders.
4. **Cart:** check off a grocery run (mostly dried beans, eggs, oats, chicken, frozen veg).
5. **Cook day / Prep planner:** pick a batch to cook; it tells you how many days of
   leftovers it buys and builds the shopping list.

## When you're stuck or low

- **Can't decide?** → the **Decide** screen. Set energy/time/craving, eat what it says.
- **No energy to cook?** → **Floor Shelf** items, or Decide with energy = Low.
- **Bored?** → **Flavor Lab** (new spice/sauce on the same cheap base) or **Build a plate**.
- **Is it working?** → **Insights** (weight trend, protein/cost averages, your one next move).

---

## Privacy & data

Everything lives in your browser's local storage on your device. No server, no account,
no analytics, nothing uploaded. Back it up or move devices via **Settings → Export /
Import backup**.

*Educational tool — not medical advice.*
