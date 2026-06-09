#!/usr/bin/env python3
"""
ADHD Meal System — the decision-killer.

Goal profile: GAIN weight (lean) on a tight budget, with appetite-suppressing meds and
low executive function. So this tool's job is to (1) remove the "what do I eat?"
decision, and (2) push calorie-dense, cheap, high-protein food on a schedule, because
your hunger won't remind you and you need a surplus.

No dependencies. Pure standard library. Just run it:

    python3 meal_planner.py today        # what to eat today, already decided + day cost
    python3 meal_planner.py menu         # the full cook-forward, cheap menu
    python3 meal_planner.py budget       # monthly cost tiers + cheapest staples
    python3 meal_planner.py groceries    # the week's cheap shopping list, by store
    python3 meal_planner.py swap takeout # low-energy redirect (takeout|sweet|hot)
    python3 meal_planner.py calc         # gain-weight calorie/protein targets for you
    python3 meal_planner.py checkin      # the 10-second daily check
    python3 meal_planner.py              # quick help

Everything is plain data below — edit it freely. Hate Thursday's dinner? Change it.
"""

import sys
import datetime
import textwrap

# --------------------------------------------------------------------------------------
# DATA — edit freely. Cook-forward, cheap, protein-dense. Boring is the point.
# $ = rough cost/serving at Market-Basket-type prices.
# --------------------------------------------------------------------------------------

# Calorie-dense, cheap add-ons to bolt onto ANY meal to hit a surplus without volume.
GAIN_BOOSTERS = [
    "Drizzle olive oil on it (+120 cal, ~$0.15) — cheapest dense calories there is",
    "Stir in 2 tbsp peanut butter (+190 cal, ~$0.20)",
    "Add a handful of nuts (+170 cal)",
    "Use whole milk instead of water in shakes/oats (+60-100 cal)",
    "Extra scoop of rice/oats (+150 cal, ~$0.10)",
    "Top with cheese or a fried egg (+100 cal)",
]

BREAKFASTS = [
    ("Reheat last night's batch + drizzle of olive oil", "Floor", 1.00),
    ("Overnight oats: oats + protein + whole milk + PB + banana + chia", "Floor", 0.90),
    ("Eggs + beans + tortilla + cheese (~5 min)", "Cook", 1.10),
    ("Mass-gainer shake: protein + oats + banana + PB + whole milk", "Floor", 1.20),
]
BREAKFAST_NOTE = ("Eating is the hard part, not cooking. Reheat or drink it. You need "
                  "the calories even with zero appetite.")

# Lunch default = leftovers (cheapest + lowest effort).
LUNCHES = [
    ("Leftovers from the last cook + olive oil drizzle", "Floor", 1.00),
    ("Tuna + white-bean salad + olive oil + bread", "Floor", 1.50),
    ("Lentil soup (batch or canned) + bread + cheese", "Floor", 0.90),
    ("Mass-gainer shake (no-appetite / no-energy day)", "Floor", 1.20),
]
LUNCH_NOTE = ("Default is leftovers — cheapest food you own. No appetite? Drink the "
              "shake. Don't skip — skipping kills the surplus.")

# Dinner = the cook slot. Big batch -> leftovers feed tomorrow.
DINNERS = {
    0: ("Mon - Lentil + bean chili (big batch)", 1.10),
    1: ("Tue - Chicken-thigh & cabbage stir-fry over rice", 1.80),
    2: ("Wed - Red lentil dal + rice + spinach", 0.90),
    3: ("Thu - Bean & egg shakshuka + bread", 1.30),
    4: ("Fri - Whole roast chicken + potatoes & carrots (cook 1x eat 4x)", 2.00),
    5: ("Sat - Tofu/chicken fried rice + egg", 1.50),
    6: ("Sun - Pasta e fagioli OR chicken-rice soup from Fri carcass", 1.20),
}
DINNER_NOTE = ("Cook a BIG batch (4-6 servings) — the fun part once, leftovers feed "
               "breakfast + lunch. Add olive oil / cheese to push calories.")
DINNER_FALLBACK = ("3-min bowl: microwave rice + canned beans + canned chicken/tuna + "
                   "cheese + olive oil. ~$1.20, beats takeout.")

SNACKS = [
    ("2 hard-boiled eggs + a banana", 0.70),
    ("Cottage cheese (bulk tub) + everything-bagel seasoning", 0.80),
    ("Greek yogurt (bulk tub) + oats + frozen berries + honey", 0.95),
    ("Apple/banana + 2 tbsp peanut butter", 0.50),
    ("Trail mix: nuts + raisins (dense calories for gaining)", 0.60),
    ("Greek yogurt + honey + dark chocolate chips", 0.90),
    ("Whole-milk + protein-powder shake", 0.90),
]

# Low-energy redirect (NOT a junk-food program — just a depleted-day tactic).
SWAPS = {
    "takeout": [
        "Reheat leftovers + olive oil. ~$1 and faster than the drive-thru.",
        "3-min bowl: microwave rice + canned beans + canned chicken/tuna + cheese.",
        "Ordering anyway? Get the biggest protein bowl (rice, double meat, beans) — "
        "fuels the surplus instead of wasting the day's calories on nothing.",
    ],
    "sweet": [
        "Greek yogurt + honey + frozen berries + dark chocolate chips (~$0.90, 18g protein)",
        "Banana + peanut butter (sweet + dense calories for gaining)",
        "Oats + milk + honey + chocolate chips, microwaved (warm dessert + calories)",
    ],
    "hot": [
        "Bean-&-cheese quesadilla, 4 min (~$1)",
        "Reheated batch with extra cheese melted on top",
        "Microwave rice + beans + cheese + hot sauce, 3 min",
    ],
}

GROCERIES = {
    "CHEAP PROTEIN (the priority)": [
        "Dried lentils + split peas (best protein+fiber per $)",
        "Dried beans (black/pinto/chickpea) - bulk",
        "Eggs (2-3 dozen)", "Canned tuna/sardines (x4+)",
        "Bone-in chicken thighs or whole chicken", "Peanut butter (big jar)",
        "Whole milk (gaining: dense calories)", "Cottage cheese + Greek yogurt (BULK tubs)",
        "Tofu (cheap at intl markets)", "Protein powder", "Canned beans (floor-gear convenience)",
    ],
    "CHEAP CARBS / CALORIE-DENSE (for the surplus)": [
        "Oats (big bag)", "Rice (big bag)", "Potatoes (big bag)",
        "Pasta / bean pasta", "Tortillas", "Whole-grain bread",
        "Olive oil (cheapest dense calories)", "Nuts / trail mix", "Honey",
    ],
    "PRODUCE / FROZEN (fiber, low waste)": [
        "Frozen mixed veg (x2-3)", "Frozen berries", "Cabbage", "Carrots", "Onions",
        "Garlic + ginger", "Spinach", "Bananas", "Apples", "Canned tomatoes (x4+)",
    ],
    "FLAVOR (spend novelty budget here, not on new meals)": [
        "Cumin, chili powder, paprika, curry spices", "Soy sauce / hot sauce",
        "Everything-bagel seasoning", "Shredded cheese", "Salsa",
    ],
}

# --------------------------------------------------------------------------------------
# RENDERING HELPERS
# --------------------------------------------------------------------------------------

LINE = "=" * 78


def hr(title):
    print("\n" + LINE)
    print(title)
    print(LINE)


def wrap(text, indent="   "):
    for line in textwrap.wrap(text, width=74):
        print(indent + line)


def pick(seq, n):
    return seq[n % len(seq)]


# --------------------------------------------------------------------------------------
# COMMANDS
# --------------------------------------------------------------------------------------

def cmd_today():
    today = datetime.date.today()
    wd = today.weekday()
    yd = today.timetuple().tm_yday

    bfast, bgear, bcost = pick(BREAKFASTS, yd)
    lunch, lgear, lcost = pick(LUNCHES, yd)
    dinner, dcost = DINNERS[wd]
    snack_pm, scost1 = pick(SNACKS, yd)
    snack_eve, scost2 = pick(SNACKS, yd + 3)
    booster = pick(GAIN_BOOSTERS, yd)
    day_cost = bcost + lcost + dcost + scost1 + scost2

    hr("TODAY'S FOOD - already decided. You don't choose. Eat the thing.  "
       + today.strftime("%a %b %d"))

    print("\n[ALARM 1] BREAKFAST")
    wrap(f"{bfast}   (~${bcost:.2f})")
    print("\n[ALARM 2] LUNCH  (default = leftovers)")
    wrap(f"{lunch}   (~${lcost:.2f})")
    print("\n[ALARM 3] AFTERNOON SNACK")
    wrap(f"{snack_pm}   (~${scost1:.2f})")
    print("\n[ALARM 4] DINNER  (the cook slot - make a BIG batch)")
    wrap(f"{dinner}   (~${dcost:.2f})")
    print("   too fried to cook? " + DINNER_FALLBACK)
    print("\n[ALARM 5] EVENING SNACK  (optional)")
    wrap(f"{snack_eve}   (~${scost2:.2f})")

    print("\n" + "-" * 78)
    print(f"Est. cost today: ~${day_cost:.2f}   (~${day_cost*30:.0f}/month at this rate)")
    print("GAIN-WEIGHT BOOSTER for today: " + booster)
    print("No appetite? That's the meds, not a signal to skip. You need the surplus -")
    print("eat/drink anyway. Missed one? No streak to break - resume at the next alarm.")


def cmd_menu():
    hr("THE COOK-FORWARD, CHEAP MENU")
    print("\nDINNER - the cook slot (big batch, leftovers feed tomorrow):")
    for i in range(7):
        t, c = DINNERS[i]
        print(f"  {t}   (~${c:.2f}/srv)")
    print("\nBREAKFAST (mostly reheat/assemble):")
    for m, g, c in BREAKFASTS:
        print(f"  [{g}] {m}   (~${c:.2f})")
    print("\nLUNCH (default = leftovers):")
    for m, g, c in LUNCHES:
        print(f"  [{g}] {m}   (~${c:.2f})")
    print("\nSNACKS:")
    for m, c in SNACKS:
        print(f"  - {m}   (~${c:.2f})")
    print("\nGAIN-WEIGHT BOOSTERS (bolt onto any meal):")
    for b in GAIN_BOOSTERS:
        wrap("- " + b)
    print("\nFull detail: 03-meal-menu.md   |   Money model: 08-budget-and-cost.md")


def cmd_budget():
    hr("BUDGET MODEL - cheapest eating in Andover, MA (Market Basket country)")
    print("\nMonthly food cost, one person, cooking from staples:")
    print("   Rock bottom .......... ~$150-180/mo  (~$5-6/day)")
    print("   Comfortable cheap .... ~$240-300/mo  (~$8-10/day)   <- the target")
    print("   Relaxed .............. ~$330-390/mo  (~$11-13/day)")
    print("\nFor GAINING weight you'll eat a bit MORE, but calorie-dense cheap foods")
    print("(olive oil, peanut butter, oats, rice, whole milk, beans, eggs) add calories")
    print("for pennies - so a surplus barely moves the bill.")
    print("\nCheapest protein per $ (build meals from the top):")
    for s in ["Dried lentils/split peas (+huge fiber)", "Dried beans", "Eggs",
              "Canned tuna/sardines", "Peanut butter", "Whole chicken / thighs",
              "Milk", "Tofu", "Cottage cheese / Greek yogurt (BULK tubs)"]:
        print("   - " + s)
    print("\nCheapest fiber per $:")
    for s in ["Dried beans & lentils", "Oats (bulk)", "Frozen veg / cabbage / carrots",
              "Potatoes (with skin)", "Popcorn kernels", "Bananas / apples"]:
        print("   - " + s)
    print("\nStores: Market Basket (main) > Aldi (staples) > Costco/BJ's (bulk).")
    print("Avoid Whole Foods/Star Market for staples. Full strategy: 08-budget-and-cost.md")
    print("\nBiggest budget leak for an ADHD kitchen = food that rots forgotten. Freeze")
    print("leftovers, buy frozen veg, keep an 'eat-me-first' shelf. That beats couponing.")


def cmd_groceries():
    hr("WEEKLY GROCERY LIST - same cheap cart every week, walk the store in order")
    for section, items in GROCERIES.items():
        print("\n" + section)
        for it in items:
            print("  [ ] " + it)
    print("\n" + "-" * 78)
    print("Buy DRIED beans/lentils (1/3 the cost of canned). Cheap protein cuts (thighs,")
    print("whole chicken, eggs, tuna). Bulk oats/rice. Frozen veg over fresh (zero waste).")
    print("One run a week, same cart, never hungry/unmedicated. Tip: online reorder.")


def cmd_swap(which):
    key = (which or "").lower().replace(" ", "").replace("-", "")
    aliases = {"drivethru": "takeout", "delivery": "takeout", "order": "takeout",
               "candy": "sweet", "sugar": "sweet", "dessert": "sweet",
               "pizza": "hot", "cheesy": "hot", "warm": "hot"}
    key = aliases.get(key, key)
    if key not in SWAPS:
        print("Usage: python3 meal_planner.py swap [takeout|sweet|hot]")
        print("Low-energy redirect - the cheap good option is already in your kitchen.")
        for k in SWAPS:
            print("   - " + k)
        return
    titles = {"takeout": "PULLED TOWARD TAKEOUT? The cheap option already in your kitchen:",
              "sweet": "WANT SOMETHING SWEET? Reach for one of these:",
              "hot": "WANT SOMETHING HOT & CHEESY? Reach for one of these:"}
    hr(titles[key])
    for opt in SWAPS[key]:
        print("\n  -> " + opt)
    print("\n" + "-" * 78)
    print("Takeout only ever beat you on speed/effort - never on cost, never on taste")
    print("you can't make. Keep cheap food pre-cooked and in reach; takeout has nothing left.")


def cmd_calc(args):
    weight = None
    goal = "gain"  # default: your goal is to GAIN weight
    activity = 14.5
    it = iter(args)
    for a in it:
        if a in ("--weight", "-w"):
            weight = float(next(it))
        elif a in ("--goal", "-g"):
            goal = next(it).lower()

    hr("YOUR TARGETS - lean weight GAIN (adjust off the weekly trend, not daily)")
    if weight is None:
        print("\nNo weight given. Run with your bodyweight for personalized numbers:")
        print("   python3 meal_planner.py calc --weight 150")
        print("\nGeneral targets for GAINING weight:")
        print("   Calories: maintenance + ~300-500/day (a real but controlled surplus)")
        print("   Protein:  ~0.8-1.0 g per lb bodyweight")
        print("   Fiber:    ~30-38 g/day  (ADEQUATE, not maxed - too much fills you up")
        print("             and fights the surplus when appetite is already suppressed)")
        print("\nGaining with appetite-killing meds is HARD. The levers:")
        print("   - Liquid calories (mass-gainer shakes) go down when food won't")
        print("   - Calorie-DENSE cheap foods: olive oil, PB, nuts, oats, whole milk")
        print("   - Eat on the alarm every time - you can't wait for hunger")
        print("\nEducational framework only, not medical advice.")
        return

    maintenance = round(weight * activity)
    if goal == "gain":
        cals = maintenance + 400
        protein = round(weight * 1.0)
    elif goal == "cut":
        cals = maintenance - 450
        protein = round(weight * 1.0)
    else:
        goal = "maintain"
        cals = maintenance
        protein = round(weight * 0.9)
    fiber = min(38, max(28, round(cals / 1000 * 12)))

    print(f"\n  Bodyweight:        {weight:.0f} lb")
    print(f"  Goal:              {goal}")
    print(f"  Est. maintenance:  ~{maintenance} kcal/day")
    print(f"  ->  Daily calories: ~{cals} kcal   (a +400 surplus to gain)")
    print(f"  ->  Protein target: ~{protein} g")
    print(f"  ->  Fiber target:   ~{fiber} g  (adequate, not maxed)")
    print("\n  Split across 3 meals + 2 snacks. Hard to hit the surplus with no appetite?")
    print("  Drink calories (mass-gainer shake) and add olive oil/PB to everything.")
    print("  Aim for ~0.25-0.5 lb GAIN per week. Not gaining after 2-3 wks -> add ~200 cal.")
    print("  Gaining too fast / too soft -> trim ~200. Educational only, not medical advice.")


def cmd_checkin():
    hr("10-SECOND DAILY CHECK-IN  (behaviors you control, not the scale)")
    print("\n  Answer in your head. Win = mostly yes, most days. 5/7 = a win.\n")
    print("   [ ] Did I eat at 3+ of my anchor meals today?")
    print("   [ ] Did I hit roughly my protein + calorie (surplus) target?")
    print("   [ ] Did I add a calorie booster (olive oil/PB/shake) somewhere?")
    print("\n  That's the whole log. No grams, no photos, no streak to break.")
    print("  Weekly (one day): weight TREND. Gaining ~0.25-0.5 lb/wk = on track. See 06-tracking.md")


def cmd_help():
    print(__doc__)
    print("Quick start:  python3 meal_planner.py today")


# --------------------------------------------------------------------------------------
# DISPATCH
# --------------------------------------------------------------------------------------

def main(argv):
    if not argv:
        cmd_help()
        return
    cmd = argv[0].lower()
    rest = argv[1:]
    if cmd == "today":
        cmd_today()
    elif cmd == "menu":
        cmd_menu()
    elif cmd in ("budget", "cost", "money"):
        cmd_budget()
    elif cmd in ("groceries", "grocery", "shop"):
        cmd_groceries()
    elif cmd == "swap":
        cmd_swap(rest[0] if rest else "")
    elif cmd in ("calc", "targets", "macros"):
        cmd_calc(rest)
    elif cmd in ("checkin", "check", "log"):
        cmd_checkin()
    elif cmd in ("help", "-h", "--help"):
        cmd_help()
    else:
        print(f"Unknown command: {cmd}\n")
        cmd_help()


if __name__ == "__main__":
    main(sys.argv[1:])
