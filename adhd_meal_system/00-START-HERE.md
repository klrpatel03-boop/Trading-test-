# 00 — START HERE (short setup)

Don't read the whole system right now. ADHD brains bounce off big plans. Do these
**5 small things today**, and you have a working system tonight. Everything else is
optional depth you can read later.

Your setup: **gaining weight**, **appetite-killing meds** (no hunger cues), **all three
meals are hard**, **you love cooking**, and it all has to be **cheap** (Andover, MA).
Every step below is built around that.

---

## ✅ Step 1 — Set 5 alarms (3 minutes)

Open your phone clock app. Create these recurring alarms. Label each with the *action*,
not the time — the label makes the decision so your brain doesn't have to.

| Alarm (tune later) | Label (type this exactly) |
|--------------------|---------------------------|
| ~30 min after wake | 🍳 EAT — reheat leftovers / oats / shake. No hunger needed. |
| ~12:30 pm | 🥡 LUNCH — leftovers (or drink a shake). Eat anyway. |
| ~3:30 pm | 🥜 Snack — grab protein. |
| ~6:30 pm | 🍳 DINNER — cook the batch (the fun part). Make extra. |
| ~8:30 pm | 🌙 Snack — optional, then kitchen closed. |

> Why labels matter: "12:30" makes you decide. "LUNCH — leftovers" *is* the decision.
> Time-blindness and no-appetite can't argue with an instruction.

Exact times get tuned in `02-meal-schedule.md`. Approximate is fine to start.

---

## ✅ Step 2 — See today's food (1 minute)

```bash
cd adhd_meal_system
python3 meal_planner.py today
```

It prints today's meals — already chosen — with a no-cook fallback for each, the day's
cost, and a calorie-booster tip for gaining. **You don't decide. The tool already did.**
(Can't run code on your phone? The same info is in `03-meal-menu.md` — see the iPhone
note at the bottom of this file.)

---

## ✅ Step 3 — Pick your keystone: the big-batch cook

You love cooking, so cooking is the **engine**, not a chore. The move that makes the
whole system work:

> **Once every 2–3 days, in the evening, cook a BIG batch (4–6 servings)** of something
> cheap and protein-dense — chili, dal, a roast chicken, fried rice (`03-meal-menu.md`).

That single cook becomes tonight's dinner **plus** the next 1–2 days of reheated
breakfasts and lunches. You summon cooking energy *once*, when it's fun, and coast the
rest. Leftovers are simultaneously the **cheapest** food and the **lowest-effort** food
you can have — perfect for the budget *and* the low-executive-function days.

---

## ✅ Step 4 — Do one cheap grocery run (this week)

```bash
python3 meal_planner.py groceries     # the list
python3 meal_planner.py budget        # cost + where to shop
```

Main store: **Market Basket** (you're in the right region for it). Buy **dried** beans
and lentils, eggs, cheap chicken cuts, bulk oats and rice, frozen veg, olive oil and
peanut butter. That's a week of high-protein food for very little money. Full money
strategy in `08-budget-and-cost.md`.

---

## ✅ Step 5 — Stock the "low-effort shelf" (for depleted days)

Pick one shelf + one fridge spot. These hold *only* grab-and-eat staples for days when
even cooking is too much — so you never drop below "ate protein," and never default to
expensive takeout:

- Canned tuna/sardines, canned beans (peel-top) — 2-minute protein
- Eggs (boil a batch) + bananas + apples
- Peanut butter, nuts, trail mix (dense calories for gaining)
- Greek yogurt / cottage cheese (bulk tub) + oats
- Microwave rice pouches + a bag of frozen veg
- A few ready-to-drink shakes for zero-appetite days

The principle: **when executive function is gone, you eat whatever's closest. So make
the closest, cheapest food the good food.** Full list in `05-crash-protocol.md`.

---

## That's it. You have a system tonight.

Later, when you have energy, read:
- `01-the-system.md` — *why* this works, so you trust it when it's hard.
- `02-meal-schedule.md` — dial in your real times + medication timing.
- `07-prep-system.md` — how one good cooking day buys a week of easy meals.
- `08-budget-and-cost.md` — squeeze your food budget to the floor.

**Don't try to be perfect. The system survives you doing it badly.** Missing a meal,
eating off-plan, skipping a cook day — none of it breaks anything. You just eat at the
next alarm. There is no "starting over."

---

## 📱 Running this on an iPhone

Two ways:

**A) Just read the docs (zero code needed — recommended).** The whole system lives in
these Markdown files. Open the repo in the **GitHub app** (or any Markdown viewer) and
read `03-meal-menu.md`, `04-grocery-list.md`, etc. The `meal_planner.py` tool is only a
convenience that picks the day for you — you don't *need* it.

**B) Actually run the tool on your phone.** iPhones can't run Python out of the box, so
install a free Python app:
- **a-Shell** (free, App Store) — easiest. Open it, get the file onto it, then run
  `python3 meal_planner.py today`.
- or **Pyto** / **Pythonista** (paid, very polished).
- or open the repo in a **GitHub Codespace / Replit** from Safari and run it in the
  browser — no install.

See the bottom of `README` and ask me if you want a step-by-step for a-Shell.
