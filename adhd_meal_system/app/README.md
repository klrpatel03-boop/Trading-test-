# ⚓ Anchor — the app

**Eat on autopilot.** A full, installable web app version of the ADHD meal system —
built around executive function, appetite-killing stimulant meds, lean weight gain, and
the cheapest possible eating in Andover, MA. It decides what you eat so you don't have to.

No build step, no server, no accounts, no tracking. Everything is plain
HTML/CSS/JavaScript and lives on your device. Open `index.html` and it runs.

---

## Run it

### On a computer
Just open `app/index.html` in any modern browser. That's it.

For the service worker / "install" features (offline + reminders) you need it served
over http rather than `file://`. Easiest:

```bash
cd adhd_meal_system/app
python3 -m http.server 8000
# then visit http://localhost:8000
```

### On your iPhone (recommended)
1. Host the `app/` folder somewhere (GitHub Pages is free — see below), or run the
   server above and visit it from your phone on the same network.
2. Open the page in **Safari**.
3. Tap **Share → Add to Home Screen**.
4. Anchor now opens like a native app: full-screen, offline, with meal reminders.

### Deploy to GitHub Pages (free hosting)
1. Push this repo to GitHub.
2. Settings → Pages → deploy from your branch, folder `/adhd_meal_system/app` (or move
   `app/` to the repo root / `docs/`).
3. Open the Pages URL on your phone and Add to Home Screen.

---

## What's in it (20 screens)

| Screen | What it does |
|--------|--------------|
| **Today** | Your decided day: 5 anchored meals, day macros vs targets, cost, a next-meal countdown, quick water/meds, and a tip. Check meals off as you eat. |
| **Decide** | Set energy × time × craving → it hands you ONE meal. The ultimate decision-killer. |
| **Menu** | Browse all 96 meals. Search, filter by effort/tag, sort by protein/cost/fiber, favorite. |
| **Build a plate** | Combine a protein + carb + veg + fat → live macros & cost. Learn the pattern by doing. |
| **Cook day** | Pick a batch recipe, scale servings, see leftovers/days covered, scaled ingredients. |
| **Prep planner** | Choose your week's batches → one consolidated shopping list + leftover math. |
| **Week plan** | 7-day grid, auto-filled, shuffle-able, weekly cost + macro summary. |
| **Recipes** | Trusted online cookbooks + search any dish across all of them + the rotation's tested recipes. |
| **Flavor lab** | Spice blends, 5-minute sauces, rescue moves, techniques — variety without re-deciding. |
| **Cheap food index** | Whole foods ranked by protein/fiber/calories **per dollar**. |
| **Cart** | Repeatable grocery list by store section, checkable, with tier-1 "always buy" stars. |
| **Budget** | Monthly cost tiers, your plan's projected cost, store strategy, per-dollar rankings. |
| **Targets** | Live calorie/protein/fiber calculator for lean weight gain. |
| **Hydration & meds** | Water tracker + med log (stimulants dehydrate; thirst mimics hunger). |
| **Track** | 3-question daily check-in, streak-free consistency heatmap, weekly weight + trend. |
| **Insights** | Calm dashboard: trend, avg protein/cost, consistency, and your one next move. |
| **Floor shelf** | Crash-shelf inventory with low-stock flags so depleted-you always has good food. |
| **The system** | The 9 principles, anchor schedule + med timing, depleted-day protocol. |
| **Help & FAQ** | 3-step start, FAQ, glossary. |
| **Settings** | Profile, editable schedule, reminders, theme, cheat sheet, data export/import. |

Plus a printable one-page **cheat sheet** at `cheatsheet.html`.

---

## Architecture

Vanilla JS, no framework, no bundler. Plain `<script>` tags attach everything to a
single `window.Anchor` namespace (so it works from `file://` with no module/CORS issues).

```
app/
  index.html            # shell + ordered script tags
  cheatsheet.html       # standalone printable one-pager
  manifest.json         # PWA manifest (installable)
  sw.js                 # service worker (offline cache)
  assets/icon.svg
  css/
    base.css            # tokens, theming (dark/light), layout shell
    components.css      # buttons, cards, chips, modals, charts, forms
    views.css           # per-screen layouts
    print.css           # print rules for the app
  js/
    data.js             # core meal DB + system content
    library.js          # +recipes, flavor system, prices, FAQ, decision engine
    library2.js library3.js library4.js   # more recipes + trusted deep-links
    cookbooks.js        # trusted cookbook sources + recipe-link generators
    foods.js            # cheap-food nutrition DB + lookup view
    util.js             # hyperscript `h`, DOM + date + money helpers
    store.js            # state + localStorage (pub/sub)
    calc.js             # nutrition/budget math
    charts.js           # hand-rolled SVG charts (ring, line, heatmap)
    ui.js               # shared components (meal card, modal, recipe links…)
    notify.js           # meal-reminder notifications
    views/*.js          # one file per screen
    app.js              # router, nav, onboarding, theme, boot
  test/smoke.js         # jsdom headless test: boots app, renders all 20 views
```

### Data model
- `Anchor.meals` — 96 meals, each with macros, cost, gear (cook/floor), ingredients,
  steps, and a gain-booster.
- `Anchor.store` — all user state in `localStorage` under one key, with a tiny pub/sub
  so views re-render on change. Nothing leaves the device.

---

## Test

```bash
cd adhd_meal_system/app
node test/smoke.js     # needs jsdom available
```

Boots the SPA in jsdom and asserts: all scripts load, the meal DB is valid and unique,
every one of the 20 views renders, the meal modal opens with trusted recipe links, the
decision engine respects energy, cookbook search links build correctly, the store
persists, targets compute a gain surplus, and the router navigates every view.

---

*Educational tool — not medical advice. For a body-comp goal on stimulant meds, a
registered dietitian is worth it if accessible.*
