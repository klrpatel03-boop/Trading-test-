# 03 — The Menu: cook-forward, cheap, decision-free

The point: **you don't choose.** The tool (`python3 meal_planner.py today`) picks for
you. This page is the reference behind it.

Two design facts drive this menu:
- **You love cooking** → the default gear is *cook*, in big batches, in the dinner slot.
- **Everything must be cheap** → built from the cheapest high-protein, high-fiber
  staples on earth (beans, lentils, eggs, oats, rice, frozen veg, chicken thighs,
  potatoes, cabbage). Eating well here *is* eating cheap.

Every meal has a **Cook gear** (default) and a **Floor gear** (2-minute no-cook
fallback for depleted days). Macros are approximate per serving. P = protein (g),
Fib = fiber (g), $ = rough cost/serving at Market-Basket-type prices.

---

## 🍳 DINNER — the cook slot (make a big batch, leftovers feed tomorrow)

This is the engine. Cook one of these in the evening when cooking is fun, **make 4+
servings**, and the leftovers become breakfast and lunch. Rotates by weekday so you
never decide. Hate one? Edit the rotation in `meal_planner.py`.

| Day | Dish (cook a big batch) | P | Fib | $/srv |
|-----|--------------------------|---|-----|-------|
| Mon | **Lentil + bean chili** (dried lentils, 2 beans, tomato, onion, spices) | 28 | 18 | ~$1.10 |
| Tue | **Chicken-thigh & cabbage stir-fry** over rice (frozen veg ok) | 38 | 8 | ~$1.80 |
| Wed | **Red lentil dal + rice** (garlic, ginger, cumin, spinach) | 24 | 16 | ~$0.90 |
| Thu | **Bean & egg shakshuka** (eggs poached in spiced tomato + beans) + bread | 26 | 12 | ~$1.30 |
| Fri | **Whole roast chicken + roast potatoes & carrots** (cook once, eat 4×; save carcass for soup) | 40 | 7 | ~$2.00 |
| Sat | **Tofu/chicken fried rice** (day-old rice + frozen veg + egg) | 30 | 6 | ~$1.50 |
| Sun | **Big-batch pot:** turkey & bean pasta e fagioli, or chicken-&-rice soup from Friday's carcass | 32 | 14 | ~$1.20 |

> **The leftover loop:** a 4–6 serving batch = tonight's dinner + 2–3 reheated
> lunches/breakfasts. You summoned cooking energy *once*. That's the whole trick.

---

## 🍳 BREAKFAST — mostly reheat or assemble (eating is the hard part, not cooking)

Pick one or two and keep them near-permanent — zero decisions in a low-executive
morning. Several use last night's leftovers.

| # | Breakfast | Gear | P | Fib | $/srv |
|---|-----------|------|---|-----|-------|
| B1 | **Reheat last night's batch** (chili/dal/fried rice all work at breakfast) | Floor | varies | high | ~$1.00 |
| B2 | **Overnight protein oats** (oats + protein/milk + chia + frozen berries, made the night before) | Floor | 35 | 11 | ~$0.80 |
| B3 | **Eggs + beans + tortilla** (scramble or fried, ~5 min) | Cook | 28 | 9 | ~$1.00 |
| B4 | **Batch breakfast burritos** (egg/bean/cheese, made ahead, frozen — reheat) | Floor | 28 | 9 | ~$1.00 |
| B5 | **Shake:** protein + oats + banana + peanut butter + milk, blended | Floor | 38 | 7 | ~$1.10 |

---

## 🥡 LUNCH — leftovers by default (cheapest + lowest effort there is)

Default lunch = **the batch you cooked.** It's the cheapest food you own and needs zero
decisions. When there are no leftovers, drop to a floor option.

| # | Lunch | Gear | P | Fib | $/srv |
|---|-------|------|---|-----|-------|
| L1 | **Leftovers from the last cook** | Floor | varies | high | ~$1.00 |
| L2 | **Tuna + white-bean salad** (canned tuna + canned beans + olive oil + lemon) | Floor | 35 | 10 | ~$1.50 |
| L3 | **Lentil soup** (batch or canned) + bread | Floor | 18 | 14 | ~$0.80 |
| L4 | **Egg + bean burrito** (reheat a batched one) | Floor | 28 | 9 | ~$1.00 |
| L5 | **Shake** (no-appetite / no-energy day) | Floor | 38 | 7 | ~$1.10 |

---

## 🥜 SNACKS — cheap, fixed defaults (no deciding)

Keep 2–3 stocked. Snacks plug the protein/fiber gaps between meals cheaply.

| Snack | P | Fib | $/srv |
|-------|---|-----|-------|
| 2 hard-boiled eggs + a piece of fruit | 13 | 3 | ~$0.70 |
| Cottage cheese (bulk tub) + everything-bagel seasoning | 24 | 0 | ~$0.80 |
| Greek yogurt (bulk tub) + oats + frozen berries | 18 | 5 | ~$0.90 |
| Apple/banana + 2 tbsp peanut butter | 8 | 6 | ~$0.50 |
| Roasted/edamame or chickpeas (bulk) | 14 | 8 | ~$0.60 |
| Popcorn (kernels, air-popped) — cheap fiber volume | 4 | 6 | ~$0.15 |
| Greek yogurt + honey + a few dark chocolate chips | 18 | 1 | ~$0.90 |

---

## 🔋 Low-energy swaps (when the spark is gone, not a junk-food program)

This is *not* the centerpiece of the system — it's just a tactic for the moment a
craving or a depleted brain is pulling you toward expensive takeout. The play is the
same play as the whole system: **the good cheap option is already cooked and in reach**,
so it beats takeout on *effort and cost*, which is the only game takeout was winning.

| Pulling toward... | Reach for (already in your kitchen) | Why it wins |
|-------------------|-------------------------------------|-------------|
| A takeout/drive-thru run | Reheat leftovers, or the 3-min bean-&-rice bowl (`05`) | Faster and ~$1 vs ~$12 |
| Something sweet | Greek yogurt + honey + frozen berries (+ a few choc chips) | Scratches it, ~$0.90, 18g protein |
| Something hot & cheesy | Bean-&-cheese quesadilla or a reheated batch | 4 min, ~$1 |

> The principle isn't "resist." It's that takeout only ever beat you on *speed and
> effort* — never on cost, and never on taste you can't make yourself. Keep cheap,
> good food pre-cooked and in arm's reach, and takeout has nothing left to win on.

---

## How the tool uses this menu

- `today` → today's breakfast + lunch + dinner + 2 snacks, with floor-gear fallbacks
  and the day's estimated cost.
- `menu` → prints this whole menu.
- `budget` → monthly food cost at different tiers + cheapest staples (see `08`).
- `swap takeout|sweet|hot` → the low-energy redirect, instantly.
- `groceries` → the week's cheap shopping list, by store section.
