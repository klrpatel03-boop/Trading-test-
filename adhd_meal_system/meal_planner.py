#!/usr/bin/env python3
"""
ADHD Meal System — the decision-killer.

The whole job of this tool is to remove the "what do I eat?" decision, which is the
single thing ADHD + appetite-killing meds turns into an all-day paralysis that ends at
the drive-thru. You don't choose. It chooses. Eat the thing.

No dependencies. Pure standard library. Just run it:

    python3 meal_planner.py today        # what to eat today, already decided
    python3 meal_planner.py menu         # the full rotating menu
    python3 meal_planner.py groceries    # the week's shopping list, by store section
    python3 meal_planner.py swap candy   # redirect a craving (candy|pizza|tacobell)
    python3 meal_planner.py calc         # protein/fiber/calorie targets for your body
    python3 meal_planner.py checkin      # the 10-second daily check
    python3 meal_planner.py              # quick help

Everything is plain data below — edit it freely. Hate Thursday's dinner? Change it.
"""

import sys
import datetime
import textwrap

# --------------------------------------------------------------------------------------
# DATA — edit freely. This is your menu. Boring/repetitive is the point.
# --------------------------------------------------------------------------------------

BREAKFAST = {
    "default": "Greek yogurt power bowl — 1.5c Greek yogurt + 1/2c berries + high-fiber "
               "granola + chia (P~40, Fiber~10)",
    "fallback": "Open a ready-to-drink protein shake + a banana (P~35, 30 seconds)",
    "note": "Best appetite window of the day. Eat protein-first, before meds peak.",
}

# Liquid by default — midday is the appetite dead zone, so drink it.
LUNCHES = [
    "Green protein smoothie — 1.5 scoops protein + frozen banana + spinach + PB + milk "
    "(P~45, Fiber~8)",
    "Berry protein shake + fiber — 2 scoops protein + frozen berries + 1/2 avocado/chia "
    "(P~48, Fiber~9)",
    "Ready-to-drink shake (30g+) + an apple + jerky (P~45, Fiber~7)",
]
LUNCH_FALLBACK = "Just the ready-to-drink shake. That's a win. You ate."
LUNCH_NOTE = "You will NOT be hungry. That's expected — don't wait for hunger, DRINK it."

# Dinner rotates by weekday so you never decide but never get bored enough to bail.
DINNERS = {
    0: ("Mon — Burrito bowl", "Microwave rice pouch + canned black beans (rinsed) + "
        "pre-cooked chicken + salsa + cheese + corn (P~45, Fiber~14)"),
    1: ("Tue — Skillet protein + veg", "Pre-cooked protein + frozen stir-fry veg + "
        "microwave quinoa + soy/teriyaki (P~45, Fiber~12)"),
    2: ("Wed — Big protein salad/bowl", "Bagged salad kit + canned chickpeas + "
        "rotisserie chicken + feta (P~42, Fiber~15)"),
    3: ("Thu — Pasta, upgraded", "High-protein/chickpea pasta + jar marinara + "
        "frozen meatballs/lean turkey + spinach (P~45, Fiber~16)"),
    4: ("Fri — Better pizza night", "High-protein tortilla/flatbread + sauce + "
        "mozzarella + chicken, 8 min oven (P~40, Fiber~10)"),
    5: ("Sat — Tacos / fajita bowl", "Lean ground turkey + taco seasoning + beans + "
        "tortillas/bowl + veg (P~44, Fiber~14)"),
    6: ("Sun — Cook + batch day", "Make a tray (chili / curry / casserole) -> "
        "leftovers seed the week. See 07-prep-system.md (Fiber: high)"),
}
DINNER_FALLBACK = ("90-second crash bowl: microwave rice pouch + canned beans + "
                   "chicken pouch + salsa + cheese. ~3 min, beats the drive-thru.")

SNACKS = [
    "Cottage cheese + fruit + everything-bagel seasoning (P~24)",
    "Protein bar (20g+) you actually like (P~20)",
    "Apple/pear + 2 tbsp peanut butter (P~8, Fiber~8)",
    "Edamame (microwave bag) + sea salt (P~18, Fiber~8)",
    "Jerky + clementines (P~22)",
    "Greek yogurt + honey + dark chocolate chips  [candy killer] (P~22)",
    "Hummus + carrots + a couple hard-boiled eggs (P~12, Fiber~9)",
]

# The Junk Food Translator — redirect the craving, don't fight it.
SWAPS = {
    "candy": [
        "Greek yogurt + honey + dark chocolate chips + frozen berries  (sweet+cold+choc, 20g+ protein)",
        "A protein bar that tastes like dessert  (candy-bar vibe, 20g protein, fiber)",
        "Frozen banana 'nice cream' — banana + protein powder, blended",
        "Protein hot chocolate / protein pudding  (warm, creamy dessert feel)",
    ],
    "pizza": [
        "Tortilla pizza: high-protein tortilla + sauce + mozzarella + chicken, 8 min oven (P~38)",
        "A 'better frozen' brand with 20g+ protein + a bagged side salad",
        "English-muffin / pita mini-pizzas (batch a few ahead)",
    ],
    "tacobell": [
        "5-min burrito bowl: microwave rice + canned beans (rinsed) + chicken + salsa + cheese + hot sauce (P~45, Fiber~14)",
        "Loaded quesadilla: high-protein tortilla + cheese + chicken + beans, 4 min in a pan",
        "Pre-portioned bowl from Sunday prep — zero assembly beats the drive-thru on effort",
        "Ordering out anyway? Chipotle/Qdoba bowl: double chicken, beans, fajita veg, salsa, light rice (P~50+)",
    ],
}

# Grocery list by store section (mirrors 04-grocery-list.md).
GROCERIES = {
    "PROTEIN (priority — never run out)": [
        "Greek yogurt (large tub)", "Cottage cheese", "Eggs (2 dozen)",
        "Pre-cooked chicken (rotisserie/strips/canned)", "Lean ground turkey or 90/10 beef",
        "Frozen meatballs", "Protein powder", "Ready-to-drink shakes 30g+ (x8+) [crash shelf]",
        "Protein bars 20g+ [candy killer]", "Jerky", "Canned beans/chickpeas (x4+)",
    ],
    "PRODUCE": [
        "Bananas (freeze some)", "Berries (fresh + frozen bag)", "Apples/pears",
        "Clementines", "Baby spinach", "Bagged salad kits (x2-3)", "Baby carrots",
        "Avocados", "Pre-cut / steam-bag veg",
    ],
    "FROZEN": [
        "Stir-fry / mixed veg (x2-3)", "Frozen berries", "Edamame (microwave bags)",
        "'Better frozen' high-protein pizza [pizza killer backup]",
        "Frozen rice/quinoa pouches",
    ],
    "PANTRY": [
        "Microwave rice/quinoa pouches (x4+)", "High-protein/chickpea pasta",
        "Jar marinara", "Salsa", "High-fiber granola/oats", "Chia + ground flax",
        "Peanut/almond butter", "Hot sauce + taco seasoning + soy/teriyaki",
        "Honey", "Dark chocolate chips", "Hummus", "Tuna/chicken pouches [crash shelf]",
    ],
    "BREAD / WRAPS": [
        "High-fiber/high-protein bread", "High-protein tortillas/flatbreads",
        "English muffins or pita",
    ],
    "DAIRY / OTHER": [
        "Shredded mozzarella + a cheese you like", "Feta/cotija",
        "Milk or alternative", "Everything-bagel seasoning",
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


# --------------------------------------------------------------------------------------
# COMMANDS
# --------------------------------------------------------------------------------------

def cmd_today():
    today = datetime.date.today()
    weekday = today.weekday()  # Mon=0
    # Rotate lunch by day-of-year so it changes but never requires a choice.
    lunch = LUNCHES[today.timetuple().tm_yday % len(LUNCHES)]
    dinner_title, dinner = DINNERS[weekday]
    snack_pm = SNACKS[today.timetuple().tm_yday % len(SNACKS)]
    snack_eve = SNACKS[(today.timetuple().tm_yday + 3) % len(SNACKS)]

    hr("TODAY'S FOOD — already decided. You don't choose. Eat the thing.  "
       + today.strftime("%a %b %d"))

    print("\n[ALARM 1] BREAKFAST  (best appetite window — protein first, before meds peak)")
    wrap(BREAKFAST["default"])
    print("   low-energy fallback: " + BREAKFAST["fallback"])

    print("\n[ALARM 2] LUNCH  (midday dead zone — DRINK it, you won't be hungry)")
    wrap(lunch)
    print("   low-energy fallback: " + LUNCH_FALLBACK)

    print("\n[ALARM 3] AFTERNOON SNACK  (head off the crash)")
    wrap(snack_pm)

    print("\n[ALARM 4] DINNER  (rebound hits now — feed it on purpose, not the drive-thru)")
    print("   " + dinner_title)
    wrap(dinner)
    print("   low-energy fallback: " + DINNER_FALLBACK)

    print("\n[ALARM 5] EVENING SNACK  (optional — then kitchen closed)")
    wrap(snack_eve)

    print("\n" + "-" * 78)
    print("Not hungry? Normal — it's the meds, not a signal to skip. Eat/drink anyway.")
    print("Crashing? -> python3 meal_planner.py swap tacobell   (or see 05-crash-protocol.md)")
    print("There is no streak to break. Missed one? Just resume at the next alarm.")


def cmd_menu():
    hr("THE DECISION-FREE MENU")
    print("\nBREAKFAST (pick one, keep it nearly permanent):")
    wrap(BREAKFAST["default"])
    print("\nLUNCH — liquid by default (midday dead zone):")
    for l in LUNCHES:
        wrap("- " + l)
    print("\nDINNER — rotates by weekday:")
    for i in range(7):
        t, d = DINNERS[i]
        print("  " + t)
        wrap(d)
    print("\nSNACKS — fixed defaults, keep 2-3 stocked:")
    for s in SNACKS:
        wrap("- " + s)
    print("\nFull detail + the Junk Food Translator: 03-meal-menu.md")


def cmd_groceries():
    hr("WEEKLY GROCERY LIST — same list every week, walk the store in order")
    for section, items in GROCERIES.items():
        print("\n" + section)
        for it in items:
            print("  [ ] " + it)
    print("\n" + "-" * 78)
    print("Tier-1 (mandatory every week): shakes, bars, yogurt/cottage cheese,")
    print("pre-cooked protein, fruit. Never let the CRASH SHELF run empty.")
    print("Tip: reorder the same online cart weekly = lowest-friction option there is.")


def cmd_swap(which):
    key = (which or "").lower().replace(" ", "").replace("-", "")
    aliases = {"tacos": "tacobell", "taco": "tacobell", "bell": "tacobell",
               "frozenpizza": "pizza", "sweets": "candy", "sugar": "candy"}
    key = aliases.get(key, key)
    if key not in SWAPS:
        print("Usage: python3 meal_planner.py swap [candy|pizza|tacobell]")
        print("Redirect the craving — don't fight it. Pick which one's hitting:")
        for k in SWAPS:
            print("   - " + k)
        return
    titles = {"candy": "CRAVING CANDY? Reach for one of these instead:",
              "pizza": "CRAVING FROZEN PIZZA? Reach for one of these instead:",
              "tacobell": "CRAVING TACO BELL? Reach for one of these instead:"}
    hr(titles[key])
    for opt in SWAPS[key]:
        print("\n  -> " + opt)
    print("\n" + "-" * 78)
    print("You're not resisting the craving — you're routing it somewhere good that's")
    print("already in your kitchen. Beat the drive-thru on SPEED, and it has no reason to win.")


def cmd_calc(args):
    # Parse simple flags: --weight 180 --goal cut|maintain|gain --activity 1.4
    weight = None
    goal = "cut"
    activity = 1.4  # lightly-to-moderately active multiplier on bodyweight (lbs)
    it = iter(args)
    for a in it:
        if a in ("--weight", "-w"):
            weight = float(next(it))
        elif a in ("--goal", "-g"):
            goal = next(it).lower()
        elif a in ("--activity", "-a"):
            activity = float(next(it))

    hr("YOUR TARGETS  (mainstream framework — adjust off the weekly trend, not daily)")
    if weight is None:
        print("\nNo weight given. Run with your bodyweight for personalized numbers, e.g.:")
        print("   python3 meal_planner.py calc --weight 180 --goal cut")
        print("\nGeneral targets regardless of weight:")
        print("   Protein:  ~0.8-1.0 g per lb bodyweight")
        print("   Fiber:    ~35-45 g/day (ramp up slowly, drink water)")
        print("   Calories: ~14-15 x bodyweight (lbs) maintenance; cut = minus ~400-500")
        print("\nThis is a general educational framework, not medical advice. For a body-")
        print("comp goal alongside ADHD meds, a registered dietitian is worth it if you can.")
        return

    maintenance = weight * activity * 10  # rough: bw(lb) * activity * 10 ~ maint kcal
    # simpler, transparent heuristic:
    maintenance = round(weight * 14.5)
    if goal == "cut":
        cals = maintenance - 450
        protein = round(weight * 1.0)
    elif goal == "gain":
        cals = maintenance + 250
        protein = round(weight * 0.9)
    else:
        goal = "maintain"
        cals = maintenance
        protein = round(weight * 0.9)
    fiber = max(30, round(cals / 1000 * 14))  # ~14g per 1000 kcal, mainstream guideline

    print(f"\n  Bodyweight:        {weight:.0f} lb")
    print(f"  Goal:              {goal}")
    print(f"  Est. maintenance:  ~{maintenance} kcal/day")
    print(f"  ->  Daily calories: ~{cals} kcal")
    print(f"  ->  Protein target: ~{protein} g   (the #1 number — hit this first)")
    print(f"  ->  Fiber target:   ~{fiber} g")
    print("\n  Spread protein across meals (~30-45g each). The default menu lands you")
    print("  near these without counting every gram. Re-check the trend every 2-3 weeks")
    print("  and nudge calories +/- ~150-200, never slash.")
    print("\n  Educational framework only, not medical advice.")


def cmd_checkin():
    hr("10-SECOND DAILY CHECK-IN  (behaviors you control, not the scale)")
    print("\n  Answer in your head. Win condition = mostly yes, most days. 5/7 = a win.\n")
    print("   [ ] Did I eat at 3+ of my anchor meals today?")
    print("   [ ] Did I hit roughly my protein target?")
    print("   [ ] Did I drink water through the day?")
    print("\n  That's the whole log. No grams, no photos, no streak to break.")
    print("  Weekly (pick ONE day): check weight TREND or how your jeans fit. See 06-tracking.md")


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
