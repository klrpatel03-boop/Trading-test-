/* ============================================================================
 * Anchor — ADHD Meal System
 * data.js — the content layer: meal database, boosters, groceries, stores,
 * principles, schedule, and copy. Pure data, no DOM. Attaches to window.Anchor.
 * ----------------------------------------------------------------------------
 * Profile this is tuned for:
 *   - Goal: LEAN WEIGHT GAIN (calorie surplus, high protein, adequate fiber)
 *   - Appetite-suppressing stimulant meds -> eat by alarm, not hunger
 *   - Executive function is the constraint -> every meal has a no-cook "floor"
 *   - Loves cooking -> cook-once-eat-many is the engine
 *   - Cheapest possible eating in Andover, MA (Market Basket country)
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  /* ----------------------------------------------------------------------
   * APP META
   * -------------------------------------------------------------------- */
  Anchor.meta = {
    name: "Anchor",
    tagline: "Eat on autopilot.",
    subtitle: "An ADHD meal system that survives the days you can't.",
    version: "1.0.0",
    region: "Andover, MA",
    mainStore: "Market Basket",
    goal: "gain", // lean weight gain
  };

  /* ----------------------------------------------------------------------
   * CATEGORIES & GEARS
   * -------------------------------------------------------------------- */
  Anchor.categories = [
    { id: "breakfast", label: "Breakfast", emoji: "🍳", alarm: "~30 min post-wake" },
    { id: "lunch", label: "Lunch", emoji: "🥡", alarm: "~12:30 pm" },
    { id: "dinner", label: "Dinner", emoji: "🍲", alarm: "~6:30 pm" },
    { id: "snack", label: "Snack", emoji: "🥜", alarm: "~3:30 pm / ~8:30 pm" },
  ];

  // "cook" = the fun, default gear (batch big). "floor" = no-cook 2-min fallback.
  Anchor.gears = {
    cook: { id: "cook", label: "Cook", emoji: "🔥", hint: "The fun gear. Batch big — leftovers feed tomorrow." },
    floor: { id: "floor", label: "Floor", emoji: "🔋", hint: "No-cook fallback for depleted days. Open and eat." },
  };

  /* ----------------------------------------------------------------------
   * GAIN-WEIGHT BOOSTERS — bolt cheap, dense calories onto any meal.
   * -------------------------------------------------------------------- */
  Anchor.boosters = [
    { id: "oil", text: "Drizzle olive oil on it", kcal: 120, cost: 0.15, note: "Cheapest dense calories there is." },
    { id: "pb", text: "Stir in 2 tbsp peanut butter", kcal: 190, cost: 0.20, note: "Protein + dense calories." },
    { id: "nuts", text: "Add a handful of nuts", kcal: 170, cost: 0.30, note: "Grab-and-go, no prep." },
    { id: "milk", text: "Use whole milk instead of water", kcal: 90, cost: 0.15, note: "In shakes & oats." },
    { id: "carb", text: "Extra scoop of rice / oats", kcal: 150, cost: 0.10, note: "Pennies per serving." },
    { id: "cheese", text: "Top with cheese or a fried egg", kcal: 100, cost: 0.30, note: "Flavor + calories." },
    { id: "avocado", text: "Half an avocado", kcal: 120, cost: 0.50, note: "Dense, filling, fiber." },
    { id: "honey", text: "Honey + dried fruit on yogurt/oats", kcal: 110, cost: 0.20, note: "Easy sweet calories." },
  ];

  /* ----------------------------------------------------------------------
   * THE MEAL DATABASE
   * Each meal: id, name, emoji, category, gear, servings, macros, cost,
   * prepMin, tags, ingredients[], steps[], booster, note.
   * Macros are per serving (approx). cost = $/serving at Market-Basket prices.
   * -------------------------------------------------------------------- */
  Anchor.meals = [
    /* ===================== DINNERS (the cook slot) ===================== */
    {
      id: "chili",
      name: "Lentil & Bean Chili",
      emoji: "🌶️",
      category: "dinner",
      gear: "cook",
      servings: 6,
      protein: 28, fiber: 18, carbs: 52, fat: 9, calories: 430,
      cost: 1.10, prepMin: 40, batch: true,
      weekday: 0,
      tags: ["cheap", "high-fiber", "vegetarian-option", "freezes", "batch", "one-pot"],
      ingredients: [
        "1 cup dried lentils (or 2 cans)",
        "2 cans beans (black + kidney), or 2 cups cooked dried",
        "1 large can crushed tomatoes",
        "1 onion + 3 cloves garlic",
        "1 lb ground turkey/beef (optional — skip to go cheaper/veg)",
        "Chili powder, cumin, paprika, salt",
        "Olive oil",
      ],
      steps: [
        "Soften chopped onion + garlic in olive oil in a big pot.",
        "(Optional) brown the ground meat with the onions.",
        "Add spices, stir 30s until fragrant.",
        "Add lentils, beans, tomatoes, and ~3 cups water.",
        "Simmer 30–35 min until lentils are soft. Salt to taste.",
        "Portion into containers the moment it's done. Freezes great.",
      ],
      booster: "oil",
      note: "Huge fiber, dirt cheap, freezes perfectly. The reheatable workhorse.",
    },
    {
      id: "stirfry",
      name: "Chicken-Thigh & Cabbage Stir-Fry",
      emoji: "🥢",
      category: "dinner",
      gear: "cook",
      servings: 4,
      protein: 38, fiber: 8, carbs: 48, fat: 16, calories: 520,
      cost: 1.80, prepMin: 25, batch: true,
      weekday: 1,
      tags: ["cheap", "high-protein", "fast", "one-pan"],
      ingredients: [
        "1.5 lb boneless chicken thighs (cheaper than breast)",
        "Half a cabbage, shredded (near-free fiber)",
        "1 bag frozen stir-fry veg",
        "Cooked rice (make extra for fried rice later)",
        "Soy sauce, garlic, ginger, a little sugar",
        "Olive or neutral oil",
      ],
      steps: [
        "Cook rice (or use day-old).",
        "Sear diced thighs in a hot pan until browned.",
        "Add cabbage + frozen veg, stir-fry until tender-crisp.",
        "Add soy/garlic/ginger sauce, toss to coat.",
        "Serve over rice. Box up extras for tomorrow's lunch.",
      ],
      booster: "carb",
      note: "Cabbage stretches it cheap. Thighs stay juicy and cost a third of breast.",
    },
    {
      id: "dal",
      name: "Red Lentil Dal + Rice",
      emoji: "🍛",
      category: "dinner",
      gear: "cook",
      servings: 5,
      protein: 24, fiber: 16, carbs: 58, fat: 8, calories: 410,
      cost: 0.90, prepMin: 30, batch: true,
      weekday: 2,
      tags: ["cheap", "high-fiber", "vegetarian", "freezes", "one-pot"],
      ingredients: [
        "1.5 cups red lentils (cook fast, no soaking)",
        "1 onion, garlic, fresh ginger",
        "Cumin, turmeric, garam masala, chili",
        "1 can tomatoes or 2 fresh",
        "Big handful spinach",
        "Rice to serve; olive oil",
      ],
      steps: [
        "Bloom spices in oil with onion, garlic, ginger.",
        "Add lentils, tomato, and ~4 cups water.",
        "Simmer ~20 min until lentils collapse into a thick dal.",
        "Stir in spinach until wilted. Salt to taste.",
        "Serve over rice. This is one of the cheapest meals you can make.",
      ],
      booster: "oil",
      note: "Maybe the cheapest high-protein meal on the planet. Endlessly spice-able.",
    },
    {
      id: "shakshuka",
      name: "Bean & Egg Shakshuka",
      emoji: "🍳",
      category: "dinner",
      gear: "cook",
      servings: 4,
      protein: 26, fiber: 12, carbs: 34, fat: 18, calories: 420,
      cost: 1.30, prepMin: 25,
      weekday: 3,
      tags: ["cheap", "high-protein", "vegetarian", "one-pan"],
      ingredients: [
        "6 eggs",
        "1 can white beans",
        "1 large can crushed tomatoes",
        "Onion, garlic, paprika, cumin, chili flakes",
        "Crusty bread to mop",
        "Olive oil, feta if you have it",
      ],
      steps: [
        "Soften onion + garlic in olive oil; add spices.",
        "Add tomatoes + beans, simmer 10 min to thicken.",
        "Make wells, crack eggs in, cover, cook until whites set.",
        "Crumble feta on top. Eat with bread to soak it up.",
      ],
      booster: "cheese",
      note: "Works at any meal. Beans add fiber + protein to a classic.",
    },
    {
      id: "roastchicken",
      name: "Whole Roast Chicken + Potatoes",
      emoji: "🍗",
      category: "dinner",
      gear: "cook",
      servings: 4,
      protein: 40, fiber: 7, carbs: 38, fat: 22, calories: 560,
      cost: 2.00, prepMin: 80, batch: true,
      weekday: 4,
      tags: ["cook-once-eat-4x", "high-protein", "leftovers", "carcass-soup"],
      ingredients: [
        "1 whole chicken (cheapest meat per gram)",
        "Bag of potatoes",
        "Carrots + onion",
        "Olive oil, salt, pepper, any herbs/spices",
      ],
      steps: [
        "Heat oven to 425°F. Oil + salt the chicken all over.",
        "Surround with chopped potatoes, carrots, onion.",
        "Roast ~70–80 min until juices run clear (165°F).",
        "Carve. Eat tonight; the rest is 3 days of leftovers.",
        "SAVE THE CARCASS → simmer with water + veg scraps = free soup base.",
      ],
      booster: "oil",
      note: "The 'cook once, eat 4×' keystone. One oven session = most of your week.",
    },
    {
      id: "friedrice",
      name: "Tofu / Chicken Fried Rice",
      emoji: "🍚",
      category: "dinner",
      gear: "cook",
      servings: 4,
      protein: 30, fiber: 6, carbs: 56, fat: 14, calories: 480,
      cost: 1.50, prepMin: 20, batch: true,
      weekday: 5,
      tags: ["cheap", "fast", "uses-leftovers", "one-pan"],
      ingredients: [
        "Day-old cooked rice (key — fresh rice goes mushy)",
        "Block of tofu OR leftover chicken",
        "2 eggs",
        "1 bag frozen veg (peas/carrots/corn)",
        "Soy sauce, garlic, sesame oil",
      ],
      steps: [
        "Scramble eggs in a hot oiled pan, set aside.",
        "Crisp tofu/chicken; add frozen veg.",
        "Add cold rice, break it up, fry until toasty.",
        "Return eggs, add soy + sesame, toss. Done.",
      ],
      booster: "cheese",
      note: "The cleanup meal — turns leftover rice + odds and ends into dinner.",
    },
    {
      id: "pastafagioli",
      name: "Pasta e Fagioli (Pasta & Beans)",
      emoji: "🍝",
      category: "dinner",
      gear: "cook",
      servings: 5,
      protein: 32, fiber: 14, carbs: 62, fat: 12, calories: 500,
      cost: 1.20, prepMin: 35, batch: true,
      weekday: 6,
      tags: ["cheap", "high-fiber", "freezes", "one-pot"],
      ingredients: [
        "Bean or whole-wheat pasta",
        "2 cans cannellini/borlotti beans",
        "1 can tomatoes",
        "Onion, garlic, rosemary",
        "(Optional) ground turkey",
        "Olive oil, parmesan",
      ],
      steps: [
        "Soften onion + garlic + rosemary in oil.",
        "(Optional) brown turkey.",
        "Add tomatoes + beans + ~3 cups water; simmer 10 min.",
        "Add pasta, cook until done, stew-like.",
        "Finish with olive oil + parmesan.",
      ],
      booster: "oil",
      note: "Italian peasant food — cheap by design, protein + fiber rich.",
    },
    {
      id: "bakedpotato",
      name: "Loaded Baked Potato Bar",
      emoji: "🥔",
      category: "dinner",
      gear: "cook",
      servings: 4,
      protein: 26, fiber: 11, carbs: 60, fat: 14, calories: 480,
      cost: 1.20, prepMin: 60,
      tags: ["cheap", "customizable", "high-fiber"],
      ingredients: [
        "4 large potatoes",
        "1 can chili or black beans",
        "Greek yogurt (instead of sour cream — more protein)",
        "Cheese, green onion, hot sauce",
      ],
      steps: [
        "Bake potatoes at 400°F ~50–60 min (or microwave 8–10 min).",
        "Split, fluff, load with beans/chili + cheese.",
        "Top with Greek yogurt + hot sauce.",
      ],
      booster: "cheese",
      note: "Cheap, filling, endlessly customizable. Skin = fiber.",
    },
    {
      id: "turkeyskillet",
      name: "Turkey, Bean & Cabbage Skillet",
      emoji: "🍳",
      category: "dinner",
      gear: "cook",
      servings: 4,
      protein: 34, fiber: 12, carbs: 30, fat: 16, calories: 440,
      cost: 1.50, prepMin: 25, batch: true,
      tags: ["cheap", "high-protein", "low-carb-ish", "one-pan"],
      ingredients: [
        "1 lb ground turkey",
        "Half a cabbage, shredded",
        "1 can beans",
        "Onion, garlic, smoked paprika, cumin",
        "Olive oil",
      ],
      steps: [
        "Brown turkey with onion + garlic.",
        "Add cabbage, cook down until soft.",
        "Add beans + spices, heat through.",
        "Serve as-is or over rice.",
      ],
      booster: "carb",
      note: "Cabbage makes a pound of turkey feed four. Cheap and protein-dense.",
    },

    /* ===================== BREAKFASTS ===================== */
    {
      id: "reheat-batch",
      name: "Reheat Last Night's Batch",
      emoji: "♻️",
      category: "breakfast",
      gear: "floor",
      servings: 1,
      protein: 28, fiber: 12, carbs: 45, fat: 14, calories: 420,
      cost: 1.00, prepMin: 2,
      tags: ["no-cook", "leftovers", "cheapest", "2-min"],
      ingredients: ["Any leftover dinner batch", "A drizzle of olive oil"],
      steps: ["Microwave 2 min.", "Drizzle olive oil for extra calories.", "Eat. Done."],
      booster: "oil",
      note: "Chili, dal, fried rice — all great at breakfast. Zero decisions.",
    },
    {
      id: "overnight-oats",
      name: "Overnight Protein Oats",
      emoji: "🥣",
      category: "breakfast",
      gear: "floor",
      servings: 1,
      protein: 35, fiber: 11, carbs: 55, fat: 14, calories: 480,
      cost: 0.90, prepMin: 3,
      tags: ["no-cook", "make-ahead", "cheap"],
      ingredients: [
        "1/2 cup oats",
        "1 scoop protein powder",
        "Whole milk (for gaining)",
        "1 tbsp chia + 1 tbsp peanut butter",
        "Frozen berries + a little honey",
      ],
      steps: [
        "Mix everything in a jar the night before.",
        "Fridge overnight.",
        "Grab and eat cold in the morning. No thinking required.",
      ],
      booster: "pb",
      note: "Made the night before = breakfast already exists when your brain doesn't.",
    },
    {
      id: "eggs-beans",
      name: "Eggs, Beans & Tortilla",
      emoji: "🌯",
      category: "breakfast",
      gear: "cook",
      servings: 1,
      protein: 28, fiber: 9, carbs: 32, fat: 18, calories: 420,
      cost: 1.00, prepMin: 6,
      tags: ["cheap", "high-protein", "fast"],
      ingredients: ["2–3 eggs", "1/2 can beans", "Tortilla", "Cheese, salsa, hot sauce"],
      steps: ["Scramble eggs with beans.", "Pile into a tortilla with cheese + salsa.", "Roll and eat."],
      booster: "cheese",
      note: "Cheapest complete protein (eggs) + fiber (beans) in 6 minutes.",
    },
    {
      id: "breakfast-burrito",
      name: "Batch Breakfast Burritos",
      emoji: "🌯",
      category: "breakfast",
      gear: "floor",
      servings: 8,
      protein: 28, fiber: 9, carbs: 36, fat: 16, calories: 430,
      cost: 1.00, prepMin: 30, batch: true,
      tags: ["make-ahead", "freezes", "no-cook-reheat", "cheap"],
      ingredients: [
        "12 eggs", "2 cans beans", "Cheese", "8 tortillas", "Salsa, spices",
      ],
      steps: [
        "Scramble all eggs with beans + spices.",
        "Assembly-line fill 8 tortillas with egg/bean/cheese.",
        "Wrap in foil, freeze.",
        "Microwave one straight from frozen (~2–3 min) any morning.",
      ],
      booster: "cheese",
      note: "One session = 8 grab-and-reheat breakfasts. Future-you says thanks.",
    },
    {
      id: "gainer-shake",
      name: "Mass-Gainer Shake",
      emoji: "🥤",
      category: "breakfast",
      gear: "floor",
      servings: 1,
      protein: 40, fiber: 7, carbs: 60, fat: 16, calories: 560,
      cost: 1.20, prepMin: 3,
      tags: ["liquid-calories", "no-appetite-friendly", "fast"],
      ingredients: [
        "1.5 scoops protein", "1/2 cup oats", "1 banana",
        "2 tbsp peanut butter", "Whole milk", "Optional: honey",
      ],
      steps: ["Blend everything.", "Drink it.", "560 cheap calories with zero appetite needed."],
      booster: "milk",
      note: "The single best tool for gaining when meds kill your appetite. Liquid wins.",
    },
    {
      id: "yogurt-bowl",
      name: "Greek Yogurt Power Bowl",
      emoji: "🍯",
      category: "breakfast",
      gear: "floor",
      servings: 1,
      protein: 32, fiber: 8, carbs: 48, fat: 12, calories: 440,
      cost: 1.10, prepMin: 3,
      tags: ["no-cook", "high-protein", "fast"],
      ingredients: [
        "1.5 cups Greek yogurt (from the bulk tub)",
        "Oats or high-fiber granola",
        "Frozen berries + honey",
        "Handful of nuts",
      ],
      steps: ["Scoop yogurt.", "Top with oats, berries, honey, nuts.", "Eat."],
      booster: "nuts",
      note: "Bulk tub, never single cups — a third the price for the same food.",
    },

    /* ===================== LUNCHES ===================== */
    {
      id: "leftovers-lunch",
      name: "Leftovers (the default)",
      emoji: "🥡",
      category: "lunch",
      gear: "floor",
      servings: 1,
      protein: 30, fiber: 12, carbs: 48, fat: 14, calories: 440,
      cost: 1.00, prepMin: 2,
      tags: ["no-cook", "cheapest", "2-min"],
      ingredients: ["Whatever batch you last cooked", "Olive oil drizzle"],
      steps: ["Reheat.", "Drizzle olive oil.", "Eat. This is the cheapest, easiest lunch there is."],
      booster: "oil",
      note: "The leftover loop is the whole system. Lunch is already made.",
    },
    {
      id: "tuna-bean-salad",
      name: "Tuna & White-Bean Salad",
      emoji: "🥗",
      category: "lunch",
      gear: "floor",
      servings: 1,
      protein: 35, fiber: 10, carbs: 30, fat: 16, calories: 420,
      cost: 1.50, prepMin: 5,
      tags: ["no-cook", "high-protein", "cheap"],
      ingredients: [
        "1 can tuna", "1/2 can white beans", "Olive oil + lemon",
        "Onion or whatever crunchy veg", "Bread on the side",
      ],
      steps: ["Drain tuna + beans.", "Mix with olive oil, lemon, salt.", "Eat with bread."],
      booster: "oil",
      note: "No-cook, cheap, 35g protein. Pantry-stable ingredients.",
    },
    {
      id: "lentil-soup",
      name: "Lentil Soup + Bread",
      emoji: "🍲",
      category: "lunch",
      gear: "floor",
      servings: 1,
      protein: 18, fiber: 14, carbs: 46, fat: 8, calories: 360,
      cost: 0.80, prepMin: 5,
      tags: ["cheap", "high-fiber", "batch-or-canned"],
      ingredients: ["Batch or canned lentil soup", "Bread + cheese", "Olive oil"],
      steps: ["Heat soup.", "Add olive oil + cheese.", "Eat with bread."],
      booster: "cheese",
      note: "Under a dollar, 14g fiber. Batch it on a cook day.",
    },
    {
      id: "lunch-shake",
      name: "Lunch Shake (no-appetite day)",
      emoji: "🥤",
      category: "lunch",
      gear: "floor",
      servings: 1,
      protein: 40, fiber: 7, carbs: 55, fat: 16, calories: 520,
      cost: 1.20, prepMin: 3,
      tags: ["liquid-calories", "no-appetite-friendly"],
      ingredients: ["Protein", "Oats", "Banana", "Peanut butter", "Whole milk"],
      steps: ["Blend.", "Drink it at your desk.", "Calories in even when food feels impossible."],
      booster: "milk",
      note: "Midday is the appetite dead zone. Don't fight it — drink lunch.",
    },

    /* ===================== SNACKS ===================== */
    {
      id: "eggs-fruit",
      name: "Hard-Boiled Eggs + Fruit",
      emoji: "🥚",
      category: "snack",
      gear: "floor",
      servings: 1,
      protein: 13, fiber: 3, carbs: 25, fat: 10, calories: 240,
      cost: 0.70, prepMin: 1,
      tags: ["no-cook", "make-ahead", "cheap"],
      ingredients: ["2 hard-boiled eggs (batch a dozen)", "A banana or apple"],
      steps: ["Peel eggs.", "Eat with fruit."],
      booster: "pb",
      note: "Boil a dozen on cook day. Grab-and-go protein.",
    },
    {
      id: "cottage-cheese",
      name: "Cottage Cheese + Seasoning",
      emoji: "🧀",
      category: "snack",
      gear: "floor",
      servings: 1,
      protein: 24, fiber: 0, carbs: 8, fat: 5, calories: 180,
      cost: 0.80, prepMin: 1,
      tags: ["no-cook", "high-protein", "cheap"],
      ingredients: ["Cottage cheese (bulk tub)", "Everything-bagel seasoning"],
      steps: ["Scoop.", "Season.", "Eat."],
      booster: "nuts",
      note: "24g protein, dirt cheap from the big tub.",
    },
    {
      id: "pb-banana",
      name: "Banana + Peanut Butter",
      emoji: "🍌",
      category: "snack",
      gear: "floor",
      servings: 1,
      protein: 8, fiber: 6, carbs: 40, fat: 16, calories: 330,
      cost: 0.50, prepMin: 1,
      tags: ["no-cook", "dense-calories", "cheap"],
      ingredients: ["1 banana", "2 tbsp peanut butter"],
      steps: ["Spread PB on banana.", "Eat. 330 dense calories for 50 cents."],
      booster: "honey",
      note: "Cheapest dense-calorie snack for gaining. 60-second win.",
    },
    {
      id: "trail-mix",
      name: "Trail Mix",
      emoji: "🥜",
      category: "snack",
      gear: "floor",
      servings: 1,
      protein: 8, fiber: 4, carbs: 22, fat: 18, calories: 280,
      cost: 0.60, prepMin: 0,
      tags: ["no-cook", "dense-calories", "grab-and-go"],
      ingredients: ["Nuts", "Raisins / dried fruit", "Optional dark chocolate"],
      steps: ["Grab a handful."],
      booster: "honey",
      note: "Dense calories you can eat without appetite. Keep some at your desk.",
    },
    {
      id: "yogurt-honey",
      name: "Greek Yogurt + Honey + Chocolate",
      emoji: "🍫",
      category: "snack",
      gear: "floor",
      servings: 1,
      protein: 18, fiber: 1, carbs: 30, fat: 6, calories: 250,
      cost: 0.90, prepMin: 1,
      tags: ["no-cook", "sweet", "high-protein"],
      ingredients: ["Greek yogurt", "Honey", "A few dark chocolate chips", "Frozen berries"],
      steps: ["Scoop yogurt.", "Add honey, chips, berries.", "Scratches the sweet itch, 18g protein."],
      booster: "honey",
      note: "When you want something sweet — this beats candy and costs less.",
    },
    {
      id: "milk-shake",
      name: "Whole-Milk Protein Shake",
      emoji: "🥛",
      category: "snack",
      gear: "floor",
      servings: 1,
      protein: 30, fiber: 1, carbs: 24, fat: 10, calories: 310,
      cost: 0.90, prepMin: 2,
      tags: ["liquid-calories", "high-protein", "no-appetite-friendly"],
      ingredients: ["Whole milk", "1 scoop protein", "Optional banana"],
      steps: ["Shake or blend.", "Drink."],
      booster: "milk",
      note: "Easiest calories to get in when you're not hungry.",
    },
  ];

  /* ----------------------------------------------------------------------
   * DEPLETED-DAY (CRASH) PROTOCOL
   * -------------------------------------------------------------------- */
  Anchor.crash = {
    rule: "The bar is 'ate protein + calories,' not 'ate well.' Open and eat. That's a win.",
    fridge: [
      "Ready-to-drink shakes (just open)",
      "Greek yogurt / cottage cheese (bulk tub + spoon)",
      "Leftovers, front-and-center",
      "Hard-boiled eggs (batched)",
      "Cheese",
      "Bananas, apples",
    ],
    pantry: [
      "Canned tuna / sardines / chicken (peel-top)",
      "Microwave rice pouches + canned beans",
      "Peanut butter + nuts + trail mix",
      "Oats + honey",
      "Olive oil (drizzle calories onto anything)",
    ],
    meals: [
      { name: "Drink it", text: "A shake (or protein + oats + banana + PB + whole milk). Liquid protein + dense calories with zero appetite or energy needed." },
      { name: "90-second bowl", text: "Microwave rice pouch + canned beans + tuna/chicken pouch + cheese + olive oil + hot sauce. ~$1.20, ~3 min." },
      { name: "Spoon of protein", text: "Peanut butter + banana + a glass of whole milk, or Greek yogurt + honey + nuts. 60 seconds." },
    ],
    tooMuch: [
      "Just a shake. You ate. Win.",
      "PB on a banana + a glass of milk. 60 seconds. Win.",
      "Ordering out anyway? Get the BIGGEST rice + double-protein + beans bowl — it fuels the surplus instead of wasting the day's calories.",
    ],
    mantra: "One rough meal does NOT break the system. There is no streak. Next alarm fires, you eat the good cheap thing, you're back.",
  };

  /* ----------------------------------------------------------------------
   * GROCERY LIST (by store section) — auto-checkable in the app.
   * -------------------------------------------------------------------- */
  Anchor.grocerySections = [
    {
      name: "Cheap Protein (the priority)",
      emoji: "🥩",
      items: [
        { name: "Dried lentils + split peas", note: "Best protein+fiber per $", tier1: true },
        { name: "Dried beans (black/pinto/chickpea)", note: "Bulk, batch, freeze", tier1: true },
        { name: "Eggs (2–3 dozen)", note: "Cheapest complete protein", tier1: true },
        { name: "Canned tuna / sardines (×4+)", note: "No-cook floor protein", tier1: true },
        { name: "Bone-in chicken thighs or whole chicken", note: "Cheapest meat per gram" },
        { name: "Peanut butter (big jar)", note: "Protein + dense calories", tier1: true },
        { name: "Whole milk", note: "Dense calories for gaining" },
        { name: "Cottage cheese + Greek yogurt (BULK tubs)", note: "Never single cups" },
        { name: "Tofu", note: "Cheapest at intl markets" },
        { name: "Protein powder", note: "Easiest calories with no appetite", tier1: true },
        { name: "Canned beans (×4+)", note: "Floor-gear convenience" },
      ],
    },
    {
      name: "Cheap Carbs / Calorie-Dense",
      emoji: "🍞",
      items: [
        { name: "Olive oil", note: "Cheapest dense calories", tier1: true },
        { name: "Oats (big bag)", note: "Pennies per serving", tier1: true },
        { name: "Rice (big bag)", note: "" },
        { name: "Potatoes (big bag)", note: "Fiber in the skin" },
        { name: "Pasta / bean pasta", note: "" },
        { name: "Tortillas", note: "" },
        { name: "Whole-grain bread", note: "" },
        { name: "Nuts / trail mix", note: "Dense, grab-and-go" },
        { name: "Honey", note: "" },
      ],
    },
    {
      name: "Produce / Frozen (fiber, low waste)",
      emoji: "🥦",
      items: [
        { name: "Frozen mixed veg (×2–3)", note: "Cheaper than fresh, zero waste", tier1: true },
        { name: "Frozen berries", note: "" },
        { name: "Cabbage + carrots + onions", note: "Near-free fiber base" },
        { name: "Garlic + ginger", note: "" },
        { name: "Spinach", note: "" },
        { name: "Bananas + apples", note: "Cheapest fruit", tier1: true },
        { name: "Canned tomatoes (×4+)", note: "Chili / dal / shakshuka base" },
      ],
    },
    {
      name: "Flavor (spend your novelty budget here)",
      emoji: "🌶️",
      items: [
        { name: "Cumin, chili powder, paprika, curry spices", note: "" },
        { name: "Soy sauce / hot sauce", note: "" },
        { name: "Everything-bagel seasoning", note: "" },
        { name: "Shredded cheese", note: "" },
        { name: "Salsa", note: "" },
      ],
    },
  ];

  /* ----------------------------------------------------------------------
   * BUDGET MODEL
   * -------------------------------------------------------------------- */
  Anchor.budget = {
    tiers: [
      { name: "Rock bottom", perDay: "$5–6", perMonth: "$150–180", desc: "Beans/lentils/eggs/oats/rice forward, occasional chicken, minimal processed." },
      { name: "Comfortable cheap", perDay: "$8–10", perMonth: "$240–300", desc: "The full menu — variety, plenty of chicken/eggs/dairy, frozen veg, fruit.", target: true },
      { name: "Relaxed", perDay: "$11–13", perMonth: "$330–390", desc: "Above + more meat, fresh produce, some convenience items." },
    ],
    stores: [
      { name: "Market Basket", use: "Your main store for everything", note: "Famously low prices in the Merrimack Valley. The default.", primary: true },
      { name: "Aldi", use: "Staples, eggs, dairy, frozen, canned", note: "Rock-bottom store brands. Small store = less ADHD wander." },
      { name: "Costco / BJ's", use: "Bulk: oats, rice, eggs, PB, oil, protein", note: "Nashua NH = no sales tax. Only for things you'll use up." },
      { name: "International markets", use: "Lentils, beans, rice, spices in bulk", note: "Often dramatically cheaper for legumes & spices." },
    ],
    proteinPerDollar: [
      "Dried lentils / split peas (+huge fiber)",
      "Dried beans",
      "Eggs",
      "Canned tuna / sardines",
      "Peanut butter",
      "Whole chicken / thighs",
      "Milk",
      "Tofu",
      "Cottage cheese / Greek yogurt (bulk tubs)",
    ],
    fiberPerDollar: [
      "Dried beans & lentils",
      "Oats (bulk)",
      "Frozen veg / cabbage / carrots",
      "Potatoes (with skin)",
      "Popcorn kernels",
      "Bananas / apples",
    ],
    rules: [
      "Cook from staples; pay the convenience tax only on the floor (depleted days).",
      "Batch-cook → leftovers are the cheapest AND lowest-effort food you own.",
      "Buy cheap protein cuts (thighs, whole chicken, eggs, tuna) + bulk carbs.",
      "Frozen veg over fresh for cooking — cheaper, zero waste.",
      "One store run a week, same cart, never hungry/unmedicated.",
      "Track WASTE, not pennies — food that rots forgotten is the real budget leak.",
    ],
  };

  /* ----------------------------------------------------------------------
   * THE 9 PRINCIPLES
   * -------------------------------------------------------------------- */
  Anchor.principles = [
    { n: 1, title: "Eat by schedule, not by hunger", body: "ADHD + appetite-suppressing meds = no reliable hunger signal. Eating is an alarm-driven task, like taking a pill. Feeling nothing at meal time is expected — eat anyway." },
    { n: 2, title: "Every meal is hard — so every meal gets the same support", body: "There's no 'easy meal.' Breakfast, lunch, and dinner all get an alarm, an anchor, and a no-effort floor. Don't white-knuckle the hard ones — treat them identically." },
    { n: 3, title: "Anchor meals to routines, not clock times", body: "Time-blindness makes '1pm' meaningless, but you don't miss events. 'After I pour my coffee → breakfast.' The meal rides a habit that already survives your ADHD." },
    { n: 4, title: "Lower the activation energy — with two gears", body: "Cook gear (default, batch big, the fun part) and Floor gear (no-cook, 2-min fallback). Never forced to cook, never left with nothing." },
    { n: 5, title: "Cook once, coast on leftovers", body: "Cook a big batch on a good day. Leftovers are simultaneously the cheapest and lowest-effort food you can have. A good cooking day pre-pays several depleted days." },
    { n: 6, title: "Eliminate decisions", body: "A fixed rotating menu and a tool that picks for you. Boring is a feature. Spend your novelty budget on flavor and technique, not on re-deciding the meal." },
    { n: 7, title: "Make the good food the closest food", body: "When executive function is gone, you eat whatever's nearest. Engineer the environment: leftovers front-and-center, a stocked floor shelf. The good option wins by being easiest to reach." },
    { n: 8, title: "Protein + fiber are the levers — and the cheapest foods", body: "Beans, lentils, eggs, oats, rice — the cheapest foods are the highest in protein and fiber. Eating well and eating cheap are the same move. For gaining, add calorie-dense cheap fats." },
    { n: 9, title: "Plan for the depleted day — never 'start over'", body: "Bad days are a planned state with their own zero-effort menu. There's no streak to break — you resume at the next alarm. Consistency comes from recovery speed, not perfection." },
  ];

  /* ----------------------------------------------------------------------
   * DEFAULT SCHEDULE (editable in Settings)
   * -------------------------------------------------------------------- */
  Anchor.defaultSchedule = [
    { id: "breakfast", time: "08:00", label: "EAT — reheat leftovers / oats / shake", anchor: "After I pour my first coffee" },
    { id: "lunch", time: "12:30", label: "LUNCH — leftovers (or drink a shake)", anchor: "When I step away from work" },
    { id: "snack1", time: "15:30", label: "Snack — grab protein", anchor: "After my afternoon break" },
    { id: "dinner", time: "18:30", label: "DINNER — cook the batch, make extra", anchor: "After I close the laptop" },
    { id: "snack2", time: "20:30", label: "Evening snack — then kitchen closed", anchor: "When I wind down" },
  ];

  /* ----------------------------------------------------------------------
   * TIPS (rotating, shown on Today)
   * -------------------------------------------------------------------- */
  Anchor.tips = [
    "No appetite is expected — it's the meds, not a signal to skip. Eat anyway.",
    "Cook a big batch tonight and tomorrow's breakfast + lunch are already done.",
    "Liquid calories go down when food won't. Keep a shake option ready.",
    "Drizzle olive oil on anything for 120 cheap calories toward your surplus.",
    "Buy dried beans, not canned — about a third of the cost per serving.",
    "Frozen veg over fresh: cheaper, and it never rots forgotten in the drawer.",
    "There's no streak to break. Missed a meal? Just eat at the next alarm.",
    "Spend your novelty craving on spices and sauces, not on a new takeout order.",
    "Market Basket is your cheat code for the grocery bill. Make it the default.",
    "Boil a dozen eggs on cook day = a week of grab-and-go protein snacks.",
  ];

  /* ----------------------------------------------------------------------
   * HELPERS for selecting meals
   * -------------------------------------------------------------------- */
  Anchor.byCategory = function (cat) {
    return Anchor.meals.filter(function (m) { return m.category === cat; });
  };
  Anchor.byId = function (id) {
    return Anchor.meals.find(function (m) { return m.id === id; });
  };
  // Deterministic "pick of the day" so it changes daily but never requires a choice.
  Anchor.pickForDay = function (cat, dayIndex) {
    if (cat === "dinner") {
      var wd = new Date().getDay(); // 0=Sun..6=Sat -> map to weekday meals
      var byWeekday = Anchor.meals.find(function (m) {
        return m.category === "dinner" && m.weekday === ((wd + 6) % 7);
      });
      if (byWeekday) return byWeekday;
    }
    var list = Anchor.byCategory(cat);
    return list[dayIndex % list.length];
  };

  Anchor.dayOfYear = function (d) {
    d = d || new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    var diff = d - start;
    return Math.floor(diff / 86400000);
  };
})(window.Anchor = window.Anchor || {});
