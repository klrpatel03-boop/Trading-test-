# 03 — The Decision-Free Menu

The whole point: **you don't choose.** Breakfast barely changes. Lunch loops through
3 options. Dinner rotates by weekday. Snacks are fixed defaults. The tool
(`python3 meal_planner.py today`) picks for you. This page is the reference behind it.

Every meal is built **protein-first, fiber-second**, and engineered to be *assembly,
not cooking* on default mode — with an optional "good day" upgrade.

Macros are approximate, per serving. P = protein (g), F = fiber (g), Cal = calories.
Tune portions to your own targets (`python3 meal_planner.py calc`).

---

## 🌅 BREAKFAST — pick a default and barely change it (best appetite window)

| # | Meal | Assembly | P | F | Cal |
|---|------|----------|---|---|-----|
| B1 | **Greek yogurt power bowl** | 1.5 cups 0%/2% Greek yogurt + ½ cup berries + ¼ cup high-fiber granola or oats + chia/flax | 40 | 10 | ~420 |
| B2 | **3-egg + cottage cheese scramble** | 3 eggs + ½ cup cottage cheese scrambled in, on high-fiber toast, spinach optional | 38 | 8 | ~450 |
| B3 | **Overnight protein oats** (make night before) | ½ cup oats + 1 scoop whey + chia + milk, fridge overnight | 38 | 11 | ~430 |
| B4 | **Breakfast burrito (batch-frozen)** | Reheat a pre-made egg/bean/cheese burrito (see prep system) | 30 | 9 | ~420 |

> Pick **one or two** as your near-permanent breakfast. Same breakfast every day is a
> *superpower* here — zero decisions in your lowest-functioning morning window.

---

## 🥤 LUNCH — liquid by default (midday dead zone)

Appetite is gone midday. Don't fight it — **drink it.** These go down when a plate won't.

| # | Meal | Assembly | P | F | Cal |
|---|------|----------|---|---|-----|
| L1 | **Green protein smoothie** | 1.5 scoops protein + frozen banana + handful spinach + 1 tbsp peanut butter + milk/water, blend | 45 | 8 | ~450 |
| L2 | **Berry protein shake + fiber** | 2 scoops protein + frozen berries + ½ avocado or chia + water | 48 | 9 | ~420 |
| L3 | **Ready-to-drink shake + fruit/jerky** | Premade high-protein shake (30g+) + an apple + beef jerky | 45 | 7 | ~430 |

**On a good-appetite day** you can swap to a solid lunch: any dinner option below, or a
big protein + bean salad. But the *default* is liquid, because most days it won't be.

---

## 🍽️ DINNER — the rotating main event (rebound window, feed it on purpose)

Weekly rotation so you never decide, but never get bored enough to bail. Default versions
are 1-pan / pouch-assisted. "Good day" upgrades in italics.

| Day | Dinner | Default (low effort) | P | F | Cal |
|-----|--------|----------------------|---|---|-----|
| Mon | **Burrito bowl** | Microwave rice pouch + canned black beans + pre-cooked chicken + salsa + cheese + corn | 45 | 14 | ~600 |
| Tue | **Sheet-pan / skillet protein + veg** | Pre-cooked protein + frozen stir-fry veg + microwave quinoa, soy/teriyaki | 45 | 12 | ~580 |
| Wed | **Big protein salad / grain bowl** | Bagged salad kit + canned chickpeas + rotisserie chicken + feta | 42 | 15 | ~560 |
| Thu | **Pasta night, upgraded** | High-protein/chickpea pasta + jar marinara + frozen meatballs or lean ground turkey + spinach | 45 | 16 | ~620 |
| Fri | **Better pizza night** | High-protein flatbread/tortilla + sauce + cheese + chicken, 10 min oven; or 20g-protein frozen brand + side salad | 40 | 10 | ~620 |
| Sat | **Tacos / fajita bowl** | Lean ground turkey or beef + taco seasoning + beans + tortillas or bowl + veg | 44 | 14 | ~600 |
| Sun | **Cook + batch day** | Make a tray of something (chili, curry, casserole) → leftovers seed the week. *See `07-prep-system.md`.* | varies | high | ~600 |

> The tool rotates dinners by weekday automatically. Hate one? Edit the rotation in
> `meal_planner.py` — it's plain text near the top.

---

## 🥜 SNACKS — fixed defaults (no deciding)

Keep 2–3 of these always stocked. The 3:30 snack heads off the crash; the evening snack
feeds the rebound so it doesn't become a drive-thru.

| Snack | P | F | Cal |
|-------|---|---|-----|
| Cottage cheese + fruit + everything bagel seasoning | 24 | 4 | ~220 |
| Protein bar (20g+) you actually like | 20 | 6 | ~220 |
| Apple/pear + 2 tbsp peanut butter | 8 | 8 | ~280 |
| Edamame (microwave bag) + sea salt | 18 | 8 | ~200 |
| Beef/turkey jerky + clementines | 22 | 4 | ~200 |
| Greek yogurt + honey + dark chocolate chips *(candy killer)* | 22 | 2 | ~240 |
| Hummus + baby carrots + a hard-boiled egg or two | 12 | 9 | ~250 |

---

## 🔁 THE JUNK FOOD TRANSLATOR (your most important tool)

You don't resist the craving — you **redirect** it to something pre-stocked that hits
the same itch with way more protein and fiber. Keep the right column in the house so the
craving always has somewhere good to land.

### 🍬 When you crave CANDY (sweet / dopamine hit)
| Instead of | Reach for | Why it works |
|-----------|-----------|--------------|
| Candy, gummies | **Greek yogurt + honey + dark chocolate chips + frozen berries** | Sweet + cold + chocolate, but 20g+ protein |
| | **Protein bar that tastes like dessert** (find one you love) | Candy-bar vibe, 20g protein, fiber |
| | **Frozen grapes / frozen banana "nice cream"** (banana + protein blended) | Cold, sweet, near-zero guilt |
| | **Protein hot chocolate / protein pudding** | Warm/creamy dessert feel |

### 🍕 When you crave FROZEN PIZZA (cheesy, carby, hot, easy)
| Instead of | Reach for | Why it works |
|-----------|-----------|--------------|
| Frozen pizza (low protein, high cal) | **Tortilla/flatbread pizza:** high-protein tortilla + sauce + mozzarella + pre-cooked chicken, 8 min oven | Same hot-cheesy-carby payoff, 35–40g protein, 10 min |
| | **A "better frozen" brand with 20g+ protein** + a bagged side salad | Still grab-and-bake, but doubled protein + fiber on the plate |
| | **English-muffin or pita mini-pizzas** (batch a few) | Portioned, fast, satisfies the craving |

### 🌮 When you crave TACO BELL (savory, spicy, cheesy, drive-thru-easy)
| Instead of | Reach for | Why it works |
|-----------|-----------|--------------|
| Taco Bell run | **5-min burrito bowl:** microwave rice + canned beans (rinsed) + pre-cooked chicken + salsa + cheese + hot sauce | Literally the same flavors, ready before you'd reach the drive-thru, 45g protein, 14g fiber |
| | **Loaded quesadilla:** high-protein tortilla + cheese + chicken + beans, 4 min in a pan | Crispy-cheesy Taco-Bell texture, real macros |
| | **Keep the bowl pre-portioned in the fridge** (from Sunday prep) | Zero assembly = beats the drive-thru on effort |

> **The principle:** the drive-thru wins on *speed and ease*, not on taste you can't
> replicate. Beat it on speed (pre-stocked, pre-prepped) and the craving has no reason
> to leave the house.

---

## How the tool uses this menu

- `today` → picks B-default + L-default + today's dinner + 2 snacks, with low-energy
  fallbacks.
- `menu` → prints this whole menu.
- `swap candy|pizza|tacobell` → prints the translator for that craving, instantly,
  for when you're standing in the kitchen mid-craving.
- `groceries` → aggregates a week of the above into a shopping list.
