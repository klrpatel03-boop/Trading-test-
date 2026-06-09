# ⚓ The ADHD Meal System — Index

Everything here is one system in three forms. Pick whichever matches your energy:

1. **The app** (`app/`) — a full installable web app. The richest, easiest way to use
   it. Decides your meals, plans your week, builds shopping lists, tracks weight/water,
   links every recipe to a tested cookbook. Works offline on your iPhone home screen.
2. **The written system** (the `00`–`09` Markdown files) — the same system as plain,
   readable docs. Great on a phone with zero setup, or to understand the *why*.
3. **The command-line tool** (`meal_planner.py`) — a tiny zero-dependency Python script
   that prints today's plan, groceries, budget, and targets in a terminal.

> Built for a specific reality: **ADHD + appetite-killing stimulant meds + low
> executive function + lean weight gain + cheapest-possible eating in Andover, MA.**
> The design target is *executive function* — making the easy choice and the good
> choice the same choice.

---

## Start here

| If you want to… | Open |
|------------------|------|
| **Just use it, nicely** | `app/index.html` (or host it + Add to Home Screen on iPhone) |
| **A 10-minute setup** | `00-START-HERE.md` |
| **Understand why it works** | `01-the-system.md` |
| **Cook from trusted recipes** | `09-recipes-and-cookbooks.md` |
| **One-page printable** | `app/cheatsheet.html` |
| **A terminal tool** | `python3 meal_planner.py today` |

---

## The written system (Markdown)

| File | What it covers |
|------|----------------|
| `00-START-HERE.md` | The short setup. Alarms, first cook, first shop. |
| `01-the-system.md` | The 9 executive-function principles, and why. |
| `02-meal-schedule.md` | Anchor scheduling for when every meal is hard + med timing. |
| `03-meal-menu.md` | The cook-forward, cheap, decision-free menu. |
| `04-grocery-list.md` | The repeatable budget shopping checklist. |
| `05-crash-protocol.md` | What to eat when executive function is gone. |
| `06-tracking.md` | The minimum tracking that helps. |
| `07-prep-system.md` | Batch-cooking → coast on cheap leftovers. |
| `08-budget-and-cost.md` | The money model + Andover store strategy. |
| `09-recipes-and-cookbooks.md` | Trusted online cookbooks + tested recipe links. |
| `10-using-the-app.md` | Run the app + install it on your iPhone (Add to Home Screen). |
| `11-sample-week.md` | A full worked 7-day example: cooking, leftovers, a low day, costs. |
| `CHEATSHEET.md` | Plain-text one-page cheat sheet (paste / print). |

## The app (`app/`)
20 screens: Today, Decide-for-me, Menu (124 recipes), Build-a-plate, Cook day, Prep
planner, Week plan, Recipes (trusted cookbooks), Flavor lab, Cheap food index, Cart,
Budget, Targets, Hydration & meds, Track, Insights, Floor shelf, The system, Help,
Settings — plus a printable cheat sheet. See `app/README.md` for how to run, install on
iPhone, deploy to GitHub Pages, and the architecture + test harness.

## The CLI (`meal_planner.py`)
```bash
python3 meal_planner.py today        # today's plan + cost + booster
python3 meal_planner.py budget       # monthly cost tiers + cheapest staples
python3 meal_planner.py groceries    # the week's shopping list
python3 meal_planner.py calc --weight 150   # gain-weight targets
```

---

## The one rule (in every form)

**Eat on the alarm, even with zero appetite.** No hunger cue is coming — it's the meds.
Skipping kills the surplus. There's no streak to break: miss one, just eat at the next
alarm. Cook big when the spark hits; coast on cheap leftovers when it doesn't.

*Educational tool — not medical advice.*
