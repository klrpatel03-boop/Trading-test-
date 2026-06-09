/* ============================================================================
 * Anchor — library.js
 * Extends the content layer: ~30 more recipes (variety = the novelty an ADHD
 * brain needs), a flavor system (spice blends + sauces + rescue techniques for
 * the cook), a price reference, an FAQ, and a glossary. Loaded after data.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  /* ----------------------------------------------------------------------
   * MORE MEALS — pushed into the existing database. Same shape as data.js.
   * Cheap, high-protein, gain-friendly, with full recipes.
   * -------------------------------------------------------------------- */
  var EXTRA = [
    /* ---- dinners (no weekday = join the browse pool + rotation fallback) ---- */
    {
      id: "chickpea-curry", name: "Chickpea & Spinach Curry", emoji: "🍛",
      category: "dinner", gear: "cook", servings: 5,
      protein: 22, fiber: 15, carbs: 56, fat: 12, calories: 430, cost: 1.00, prepMin: 30, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["2 cans chickpeas", "1 can coconut milk (light) or tomatoes", "Onion, garlic, ginger", "Curry powder, cumin, turmeric", "Big handful spinach", "Rice to serve"],
      steps: ["Bloom spices in oil with onion/garlic/ginger.", "Add chickpeas + coconut milk/tomato.", "Simmer 15 min.", "Wilt in spinach.", "Serve over rice."],
      booster: "oil", note: "Pantry-stable, cheap, and the spices keep it from getting boring.",
    },
    {
      id: "egg-fried-noodles", name: "Egg & Veg Fried Noodles", emoji: "🍜",
      category: "dinner", gear: "cook", servings: 3,
      protein: 24, fiber: 7, carbs: 58, fat: 14, calories: 460, cost: 1.40, prepMin: 18,
      tags: ["cheap", "fast", "one-pan"],
      ingredients: ["Noodles or spaghetti", "3 eggs", "Frozen stir-fry veg", "Soy sauce, garlic, sesame oil", "Optional leftover chicken/tofu"],
      steps: ["Boil noodles.", "Scramble eggs, set aside.", "Fry veg + garlic.", "Toss in noodles + soy + sesame + eggs."],
      booster: "cheese", note: "15-minute dinner from pantry + freezer.",
    },
    {
      id: "white-bean-tuna-bake", name: "White Bean & Tuna Bake", emoji: "🐟",
      category: "dinner", gear: "cook", servings: 4,
      protein: 32, fiber: 11, carbs: 34, fat: 14, calories: 410, cost: 1.40, prepMin: 30,
      tags: ["cheap", "high-protein", "pantry"],
      ingredients: ["2 cans white beans", "2 cans tuna", "1 can tomatoes", "Onion, garlic, herbs", "Breadcrumb + cheese top"],
      steps: ["Mix beans, tuna, tomato, aromatics in a dish.", "Top with breadcrumb + cheese.", "Bake 200°C/400°F ~20 min."],
      booster: "cheese", note: "Cheap protein bomb straight from the pantry.",
    },
    {
      id: "turkey-rice-skillet", name: "One-Pan Turkey Rice", emoji: "🍳",
      category: "dinner", gear: "cook", servings: 5,
      protein: 34, fiber: 8, carbs: 52, fat: 14, calories: 500, cost: 1.40, prepMin: 30, batch: true,
      tags: ["cheap", "high-protein", "one-pan", "freezes"],
      ingredients: ["1 lb ground turkey", "1 cup rice", "Frozen veg", "Onion, garlic", "Stock or water + bouillon", "Soy/taco seasoning"],
      steps: ["Brown turkey + onion.", "Add rice, veg, seasoning, 2 cups liquid.", "Cover, simmer ~18 min until rice is done."],
      booster: "carb", note: "Everything in one pan, makes a ton, reheats perfectly.",
    },
    {
      id: "lentil-bolognese", name: "Lentil Bolognese", emoji: "🍝",
      category: "dinner", gear: "cook", servings: 6,
      protein: 24, fiber: 17, carbs: 62, fat: 9, calories: 460, cost: 1.10, prepMin: 40, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["1.5 cups brown/green lentils", "2 cans tomatoes", "Onion, carrot, celery, garlic", "Herbs, tomato paste", "Pasta to serve"],
      steps: ["Soften the veg base in oil.", "Add lentils, tomato, paste, herbs + water.", "Simmer 30–35 min.", "Serve over pasta with parmesan."],
      booster: "oil", note: "Meaty texture, zero meat cost. Freezes by the tub.",
    },
    {
      id: "shrimp-no-actually-eggs", name: "Spanish Tortilla (Egg & Potato)", emoji: "🥔",
      category: "dinner", gear: "cook", servings: 4,
      protein: 18, fiber: 4, carbs: 30, fat: 18, calories: 380, cost: 0.90, prepMin: 30,
      tags: ["cheap", "vegetarian", "make-ahead"],
      ingredients: ["6 eggs", "3 potatoes, thin-sliced", "1 onion", "Olive oil, salt"],
      steps: ["Soften potato + onion in plenty of oil.", "Mix into beaten eggs.", "Cook low in a pan, flip once, until set."],
      booster: "oil", note: "Great hot or cold — a portable protein slab for any meal.",
    },
    {
      id: "black-bean-quesadillas", name: "Black Bean Quesadillas", emoji: "🫓",
      category: "dinner", gear: "cook", servings: 4,
      protein: 22, fiber: 12, carbs: 44, fat: 16, calories: 440, cost: 1.10, prepMin: 15,
      tags: ["cheap", "fast", "vegetarian"],
      ingredients: ["Tortillas", "2 cans black beans (mashed)", "Cheese", "Cumin, chili, garlic powder", "Salsa to serve"],
      steps: ["Mash beans with spices.", "Fill tortillas with beans + cheese.", "Crisp in a dry pan both sides.", "Cut, dip in salsa."],
      booster: "cheese", note: "Hits the cheesy-crispy craving cheaply with real fiber.",
    },
    {
      id: "sausage-bean-stew", name: "Sausage & Bean Stew", emoji: "🥘",
      category: "dinner", gear: "cook", servings: 5,
      protein: 28, fiber: 13, carbs: 38, fat: 20, calories: 500, cost: 1.60, prepMin: 35, batch: true,
      tags: ["high-protein", "freezes", "one-pot"],
      ingredients: ["4 sausages, sliced", "2 cans beans", "1 can tomatoes", "Onion, garlic, paprika", "Kale or cabbage"],
      steps: ["Brown sausage.", "Add aromatics, beans, tomato.", "Simmer 20 min.", "Stir in greens."],
      booster: "oil", note: "Hearty and cheap; a little sausage flavors the whole pot.",
    },
    {
      id: "tofu-peanut-stirfry", name: "Tofu Peanut Stir-Fry", emoji: "🥜",
      category: "dinner", gear: "cook", servings: 4,
      protein: 26, fiber: 8, carbs: 40, fat: 22, calories: 500, cost: 1.50, prepMin: 25,
      tags: ["vegetarian", "high-protein", "dense-calories"],
      ingredients: ["Block of tofu, cubed", "Frozen stir-fry veg", "Peanut butter + soy + garlic + chili sauce", "Rice"],
      steps: ["Crisp tofu in a pan.", "Add veg.", "Stir in peanut sauce (PB+soy+garlic+water).", "Serve over rice."],
      booster: "pb", note: "Peanut sauce = dense calories for gaining + huge flavor.",
    },
    {
      id: "potato-egg-hash", name: "Potato, Egg & Bean Hash", emoji: "🍳",
      category: "dinner", gear: "cook", servings: 3,
      protein: 22, fiber: 9, carbs: 42, fat: 16, calories: 430, cost: 0.90, prepMin: 25,
      tags: ["cheap", "one-pan", "vegetarian"],
      ingredients: ["3 potatoes, diced", "1 can beans", "4 eggs", "Onion, paprika, garlic", "Cheese, hot sauce"],
      steps: ["Crisp diced potato + onion.", "Add beans + spices.", "Make wells, crack in eggs, cover till set.", "Cheese + hot sauce."],
      booster: "cheese", note: "Breakfast-for-dinner energy, dirt cheap.",
    },

    /* ---- breakfasts ---- */
    {
      id: "cottage-toast", name: "Cottage Cheese Toast + Egg", emoji: "🍞",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 30, fiber: 6, carbs: 30, fat: 14, calories: 360, cost: 0.90, prepMin: 6,
      tags: ["cheap", "high-protein", "fast"],
      ingredients: ["Whole-grain toast", "Cottage cheese", "1 fried egg", "Everything-bagel seasoning"],
      steps: ["Toast bread.", "Spread cottage cheese.", "Top with a fried egg + seasoning."],
      booster: "oil", note: "Savory, 30g protein, five minutes.",
    },
    {
      id: "pb-banana-oatmeal", name: "PB-Banana Stovetop Oats", emoji: "🥣",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 24, fiber: 9, carbs: 58, fat: 14, calories: 480, cost: 0.70, prepMin: 6,
      tags: ["cheap", "dense-calories", "warm"],
      ingredients: ["1/2 cup oats", "Whole milk", "1 scoop protein (off heat)", "Banana", "Peanut butter, honey"],
      steps: ["Cook oats in milk.", "Off heat, stir in protein.", "Top with banana, PB, honey."],
      booster: "pb", note: "Warm, sweet, and dense — easy surplus calories.",
    },
    {
      id: "savory-yogurt-bowl", name: "Smoothie Bowl", emoji: "🍓",
      category: "breakfast", gear: "floor", servings: 1,
      protein: 34, fiber: 9, carbs: 52, fat: 12, calories: 470, cost: 1.20, prepMin: 4,
      tags: ["no-cook", "high-protein"],
      ingredients: ["Frozen berries + banana", "Greek yogurt + 1 scoop protein", "Splash of milk", "Granola + nut butter on top"],
      steps: ["Blend frozen fruit, yogurt, protein, milk thick.", "Top with granola + nut butter."],
      booster: "nuts", note: "Feels like dessert; lands 34g protein.",
    },
    {
      id: "freezer-burrito-bowl", name: "Egg Muffins (batch)", emoji: "🧁",
      category: "breakfast", gear: "floor", servings: 12,
      protein: 12, fiber: 2, carbs: 4, fat: 9, calories: 140, cost: 0.50, prepMin: 30, batch: true,
      tags: ["make-ahead", "freezes", "high-protein", "low-carb"],
      ingredients: ["12 eggs", "Veg (spinach, pepper, onion)", "Cheese", "Salt, pepper"],
      steps: ["Whisk eggs with veg + cheese.", "Pour into a muffin tin.", "Bake 190°C/375°F ~20 min.", "Fridge/freeze; reheat 2–3 at a time."],
      booster: "cheese", note: "Grab 2–3 for instant breakfast protein.",
    },

    /* ---- lunches ---- */
    {
      id: "chickpea-smash", name: "Chickpea Smash Sandwich", emoji: "🥪",
      category: "lunch", gear: "floor", servings: 1,
      protein: 20, fiber: 12, carbs: 44, fat: 14, calories: 410, cost: 1.00, prepMin: 6,
      tags: ["no-cook", "vegetarian", "high-fiber"],
      ingredients: ["1 can chickpeas (mashed)", "Greek yogurt or mayo", "Mustard, lemon, salt", "Bread + whatever veg"],
      steps: ["Mash chickpeas with yogurt, mustard, lemon.", "Pile on bread with veg."],
      booster: "oil", note: "Tuna-salad vibe, plant-cheap, 12g fiber.",
    },
    {
      id: "rice-bowl-leftover", name: "Build-a-Rice-Bowl", emoji: "🍱",
      category: "lunch", gear: "floor", servings: 1,
      protein: 32, fiber: 9, carbs: 50, fat: 16, calories: 480, cost: 1.30, prepMin: 4,
      tags: ["no-cook", "customizable"],
      ingredients: ["Microwave rice", "Any leftover/canned protein", "Frozen veg (steamed)", "Sauce: soy/sriracha/peanut", "Fried or boiled egg"],
      steps: ["Heat rice + veg.", "Add protein + sauce + egg.", "Done."],
      booster: "oil", note: "Infinitely remixable so it never gets old.",
    },
    {
      id: "loaded-ramen", name: "Upgraded Ramen", emoji: "🍜",
      category: "lunch", gear: "cook", servings: 1,
      protein: 28, fiber: 6, carbs: 50, fat: 16, calories: 470, cost: 1.10, prepMin: 8,
      tags: ["cheap", "fast", "warm"],
      ingredients: ["Instant ramen (½ the seasoning)", "1–2 eggs", "Frozen veg", "Leftover protein", "Soy + sesame + chili"],
      steps: ["Boil ramen + veg.", "Stir an egg through, or soft-boil one.", "Add protein + a real sauce, not just the packet."],
      booster: "cheese", note: "Turns a 40-cent block into a real, high-protein meal.",
    },

    /* ---- snacks ---- */
    {
      id: "tuna-crackers", name: "Tuna + Crackers", emoji: "🐟",
      category: "snack", gear: "floor", servings: 1,
      protein: 20, fiber: 2, carbs: 18, fat: 8, calories: 220, cost: 0.90, prepMin: 1,
      tags: ["no-cook", "high-protein", "pantry"],
      ingredients: ["1 pouch tuna", "Whole-grain crackers"],
      steps: ["Open pouch.", "Scoop with crackers."],
      booster: "oil", note: "20g protein, zero prep, pantry-stable.",
    },
    {
      id: "choc-milk-recovery", name: "Chocolate Milk", emoji: "🥛",
      category: "snack", gear: "floor", servings: 1,
      protein: 16, fiber: 1, carbs: 36, fat: 8, calories: 280, cost: 0.60, prepMin: 1,
      tags: ["no-cook", "dense-calories", "liquid-calories"],
      ingredients: ["Whole milk", "Cocoa + sugar or chocolate syrup"],
      steps: ["Stir.", "Drink."],
      booster: "milk", note: "Cheap, dense liquid calories — great for gaining.",
    },
    {
      id: "ants-on-log", name: "Apple + PB + Granola", emoji: "🍎",
      category: "snack", gear: "floor", servings: 1,
      protein: 9, fiber: 7, carbs: 34, fat: 16, calories: 320, cost: 0.60, prepMin: 1,
      tags: ["no-cook", "dense-calories"],
      ingredients: ["Apple slices", "Peanut butter", "Sprinkle of granola"],
      steps: ["Dip apple in PB.", "Roll in granola."],
      booster: "honey", note: "Crunchy, sweet, dense — easy extra calories.",
    },
    {
      id: "popcorn-parm", name: "Popcorn + Parmesan", emoji: "🍿",
      category: "snack", gear: "cook", servings: 1,
      protein: 6, fiber: 6, carbs: 24, fat: 10, calories: 220, cost: 0.25, prepMin: 4,
      tags: ["cheap", "high-fiber", "volume"],
      ingredients: ["Popcorn kernels", "Olive oil", "Grated parmesan, salt"],
      steps: ["Pop kernels in oil.", "Toss with parmesan + salt."],
      booster: "oil", note: "Cheapest fiber-volume snack there is.",
    },

    /* ---- a few more for variety (keeps the rotation from going stale) ---- */
    {
      id: "tuna-melt", name: "Tuna Melt", emoji: "🫕",
      category: "lunch", gear: "cook", servings: 1,
      protein: 30, fiber: 5, carbs: 30, fat: 18, calories: 430, cost: 1.40, prepMin: 8,
      tags: ["cheap", "high-protein", "warm"],
      ingredients: ["1 can tuna", "Greek yogurt or mayo + mustard", "Cheese", "Bread"],
      steps: ["Mix tuna with yogurt + mustard.", "Top bread with tuna + cheese.", "Grill/toast until melted."],
      booster: "cheese", note: "Hot, cheesy, 30g protein — beats a takeout sandwich on cost.",
    },
    {
      id: "chana-masala", name: "Chana Masala (Chickpea Curry)", emoji: "🍲",
      category: "dinner", gear: "cook", servings: 5,
      protein: 20, fiber: 14, carbs: 54, fat: 10, calories: 400, cost: 0.95, prepMin: 30, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["2 cans chickpeas", "1 can tomatoes", "Onion, garlic, ginger", "Garam masala, cumin, coriander, turmeric", "Rice to serve"],
      steps: ["Bloom spices with onion/garlic/ginger.", "Add tomato + chickpeas + a splash of water.", "Simmer 20 min until thick.", "Serve over rice."],
      booster: "oil", note: "Restaurant-flavor for under a dollar a serving.",
    },
    {
      id: "beans-greens-grain", name: "Beans, Greens & Grain Bowl", emoji: "🥬",
      category: "lunch", gear: "cook", servings: 2,
      protein: 22, fiber: 16, carbs: 52, fat: 14, calories: 460, cost: 1.20, prepMin: 15,
      tags: ["cheap", "high-fiber", "vegetarian"],
      ingredients: ["1 can beans", "Greens (kale/spinach/cabbage)", "Cooked grain (rice/quinoa)", "Garlic, olive oil, lemon, chili"],
      steps: ["Sizzle garlic in oil, wilt greens.", "Add beans to warm through.", "Pile on grain, finish with lemon + chili."],
      booster: "oil", note: "16g fiber, infinitely adaptable to whatever greens are cheap.",
    },
    {
      id: "pb-protein-balls", name: "No-Bake PB Protein Balls", emoji: "⚽",
      category: "snack", gear: "floor", servings: 12,
      protein: 8, fiber: 3, carbs: 14, fat: 9, calories: 170, cost: 0.35, prepMin: 12, batch: true,
      tags: ["no-cook", "make-ahead", "dense-calories"],
      ingredients: ["Oats", "Peanut butter", "Protein powder", "Honey", "Chocolate chips"],
      steps: ["Mix everything into a stiff dough.", "Roll into balls.", "Fridge; grab 2–3 for dense snack calories."],
      booster: "pb", note: "Batch-make grab-and-go calories that actually help you gain.",
    },
    {
      id: "egg-drop-soup", name: "Egg Drop + Tofu Soup", emoji: "🍜",
      category: "dinner", gear: "cook", servings: 3,
      protein: 22, fiber: 4, carbs: 18, fat: 12, calories: 280, cost: 1.10, prepMin: 15,
      tags: ["cheap", "fast", "warm", "one-pot"],
      ingredients: ["Stock or water + bouillon", "Block of tofu, cubed", "3 eggs, beaten", "Frozen peas/corn", "Soy, ginger, sesame, scallion"],
      steps: ["Simmer stock with ginger + soy.", "Add tofu + veg.", "Drizzle in beaten egg while stirring.", "Finish with sesame + scallion."],
      booster: "oil", note: "Light, warm, fast — great when appetite is low but you still need protein.",
    },
    {
      id: "baked-oatmeal", name: "Baked Protein Oatmeal (batch)", emoji: "🍰",
      category: "breakfast", gear: "cook", servings: 8,
      protein: 16, fiber: 6, carbs: 40, fat: 12, calories: 320, cost: 0.70, prepMin: 40, batch: true,
      tags: ["make-ahead", "freezes", "warm"],
      ingredients: ["3 cups oats", "Milk + eggs", "Protein powder or extra eggs", "Banana, berries", "Cinnamon, nut butter"],
      steps: ["Mix everything in a baking dish.", "Bake 190°C/375°F ~35 min.", "Cut into squares; reheat one any morning."],
      booster: "pb", note: "Bake once Sunday = a week of warm, grab-able breakfasts.",
    },
  ];

  Array.prototype.push.apply(Anchor.meals, EXTRA);

  /* ----------------------------------------------------------------------
   * FLAVOR SYSTEM — for the cook. Spice blends, sauces, and rescue moves.
   * "Spend your novelty budget on flavor, not on re-deciding the meal."
   * -------------------------------------------------------------------- */
  Anchor.flavor = {
    blends: [
      { name: "All-purpose taco", emoji: "🌮", mix: "2 chili powder · 1 cumin · 1 paprika · ½ garlic · ½ onion · pinch oregano", on: "Ground meat, beans, eggs, roast veg." },
      { name: "Curry base", emoji: "🍛", mix: "2 curry powder · 1 cumin · 1 turmeric · ½ ginger · pinch cinnamon", on: "Lentils, chickpeas, chicken, rice." },
      { name: "Cajun", emoji: "🌶️", mix: "2 paprika · 1 garlic · 1 onion · 1 oregano · ½ cayenne · ½ thyme", on: "Chicken, rice, beans, potatoes." },
      { name: "Shawarma", emoji: "🥙", mix: "1 cumin · 1 coriander · 1 paprika · ½ turmeric · ½ cinnamon · ½ garlic", on: "Chicken thighs, chickpeas, yogurt sauce." },
      { name: "Everything-savory", emoji: "🧄", mix: "sesame · poppy · dried garlic · dried onion · salt", on: "Eggs, toast, cottage cheese, avocado." },
      { name: "Jerk-ish", emoji: "🔥", mix: "1 allspice · 1 thyme · ½ cayenne · ½ garlic · pinch cinnamon + nutmeg", on: "Chicken, roast veg, beans." },
    ],
    sauces: [
      { name: "Peanut sauce", emoji: "🥜", mix: "peanut butter + soy + lime/vinegar + garlic + chili + water", on: "Tofu, noodles, chicken, veg. Dense calories." },
      { name: "Yogurt-garlic", emoji: "🥣", mix: "Greek yogurt + garlic + lemon + salt", on: "Wraps, roast veg, chicken. Protein boost." },
      { name: "Quick salsa roja", emoji: "🍅", mix: "canned tomato + onion + garlic + chili + lime", on: "Bowls, eggs, quesadillas." },
      { name: "Soy-sesame-honey", emoji: "🍯", mix: "soy + sesame oil + honey + garlic + ginger", on: "Stir-fry, rice bowls, salmon." },
      { name: "Tahini-lemon", emoji: "🌿", mix: "tahini + lemon + garlic + water", on: "Falafel-y bowls, roast veg, chickpeas." },
      { name: "Sriracha-mayo", emoji: "🌶️", mix: "mayo (or yogurt) + sriracha + lime", on: "Anything that needs a creamy kick." },
    ],
    rescue: [
      { problem: "Bland", fix: "Add acid (lemon/vinegar) + salt. 90% of 'bland' is missing acid + salt." },
      { problem: "Flat / boring", fix: "Add a fat (olive oil, cheese, butter) and something crunchy on top." },
      { problem: "Too one-note", fix: "Add a fresh element: herbs, scallion, raw onion, hot sauce." },
      { problem: "Needs body", fix: "Tomato paste, soy sauce, or parmesan rind = instant umami depth." },
      { problem: "Too thin", fix: "Simmer uncovered, or stir in mashed beans/a spoon of PB." },
      { problem: "Sweet craving mid-meal", fix: "A drizzle of honey or a few raisins balances spicy/savory dishes." },
    ],
    techniques: [
      { name: "Batch-cook a protein", why: "One cooked protein turns every meal into 2-minute assembly all week." },
      { name: "Toast your spices", why: "30s in oil before liquids = 3× the flavor for free." },
      { name: "Salt in layers", why: "Season at each stage, not just the end — tastes seasoned, not salty." },
      { name: "Day-old rice for fried rice", why: "Fresh rice steams and clumps; cold rice fries crisp." },
      { name: "Roast at high heat", why: "220°C/425°F caramelizes veg + protein — more flavor, hands-off." },
      { name: "Save the carcass/scraps", why: "Chicken bones + veg ends = free stock = free soup base." },
    ],
  };

  /* ----------------------------------------------------------------------
   * PRICE REFERENCE — rough Market-Basket unit prices for the budget view.
   * -------------------------------------------------------------------- */
  Anchor.prices = [
    { item: "Dried lentils", unit: "lb", price: 1.50, proteinPerServe: 18, note: "+ huge fiber" },
    { item: "Dried beans", unit: "lb", price: 1.40, proteinPerServe: 15, note: "Bulk + freeze" },
    { item: "Eggs", unit: "dozen", price: 3.50, proteinPerServe: 6, note: "Per egg" },
    { item: "Canned tuna", unit: "can", price: 1.00, proteinPerServe: 20, note: "No-cook" },
    { item: "Peanut butter", unit: "jar", price: 3.50, proteinPerServe: 7, note: "Dense calories" },
    { item: "Whole chicken", unit: "lb", price: 1.50, proteinPerServe: 25, note: "Cheapest meat" },
    { item: "Chicken thighs", unit: "lb", price: 2.00, proteinPerServe: 23, note: "vs $3.50 breast" },
    { item: "Whole milk", unit: "gallon", price: 3.80, proteinPerServe: 8, note: "Per cup" },
    { item: "Oats", unit: "big bag", price: 4.00, proteinPerServe: 5, note: "Pennies/serving" },
    { item: "Rice", unit: "big bag", price: 8.00, proteinPerServe: 4, note: "~$0.12/serving" },
    { item: "Cottage cheese", unit: "tub", price: 3.00, proteinPerServe: 24, note: "Bulk tub" },
    { item: "Greek yogurt", unit: "tub", price: 5.50, proteinPerServe: 17, note: "Never single cups" },
    { item: "Tofu", unit: "block", price: 2.00, proteinPerServe: 20, note: "Cheaper at intl markets" },
    { item: "Frozen veg", unit: "bag", price: 1.30, proteinPerServe: 3, note: "Zero waste" },
    { item: "Potatoes", unit: "5lb bag", price: 3.50, proteinPerServe: 4, note: "Fiber in skin" },
  ];

  /* ----------------------------------------------------------------------
   * FAQ + GLOSSARY
   * -------------------------------------------------------------------- */
  Anchor.faq = [
    { q: "I'm never hungry. How do I eat enough to gain?", a: "Don't wait for hunger — it isn't coming on stimulants. Eat on the alarm, drink calories (a shake is ~560 cal and goes down easy), and bolt cheap dense add-ons (olive oil, peanut butter, whole milk) onto everything. Liquid + dense is how you hit a surplus without choking down volume." },
    { q: "What if I skip a meal or eat junk?", a: "Nothing breaks. There's no streak. Your next alarm fires, you eat the next planned thing, you're back on track. The failure was never the bad meal — it's letting it cancel the next good one." },
    { q: "I love cooking but can't keep it consistent.", a: "That's exactly what this is built for. Cook when the spark hits — big batches — and the leftovers carry you through the days you can't. You only need to summon cooking energy 2–3 times a week, not daily." },
    { q: "Is high fiber bad for gaining?", a: "Adequate is great; maxed-out can backfire. Very high fiber is so filling it fights a surplus when your appetite is already suppressed. Get ~30–38g, then prioritize calories." },
    { q: "How do I keep it cheap in Andover?", a: "Market Basket as your main store, dried beans/lentils over canned, cheap protein cuts (thighs, whole chicken, eggs, tuna), bulk oats/rice, frozen veg over fresh. Target ~$8–10/day." },
    { q: "Do I need to count every calorie?", a: "No — that burns out fast. Hit your protein, eat the scheduled meals, add a booster, weigh weekly. Track behaviors you control, not every gram." },
    { q: "Will this work on my iPhone?", a: "Yes. Open it in Safari and 'Add to Home Screen' — it installs like an app, works offline, and can send meal reminders. Or just read the printable cheat sheet." },
    { q: "What if I have a totally empty-tank day?", a: "That's a planned state. Hit the Floor Shelf: a shake, or a 90-second rice-bean-tuna bowl. The bar is 'ate protein,' not 'ate well.'" },
  ];

  Anchor.glossary = [
    { term: "Executive function", def: "The brain's ability to start, decide, sequence, and follow through. The real bottleneck this system is built around." },
    { term: "Anchor", def: "An existing habit you attach a meal to (e.g. 'after coffee'). The habit triggers the meal." },
    { term: "Cook gear / Floor gear", def: "Two versions of every meal: cook (batch, the fun part) and floor (no-cook, 2-minute fallback)." },
    { term: "The leftover loop", def: "Cook once big → leftovers become the next day's breakfast & lunch. Cheapest + lowest-effort food at once." },
    { term: "Surplus", def: "Eating above maintenance calories to gain weight. ~+400/day here." },
    { term: "Booster", def: "A cheap, dense add-on (olive oil, PB, whole milk) to hit calories without volume." },
    { term: "Floor shelf", def: "The no-cook staples kept stocked so depleted-you always has good food closest." },
  ];

  /* ----------------------------------------------------------------------
   * DECISION ENGINE — energy × time × craving → an instant meal pick.
   * -------------------------------------------------------------------- */
  Anchor.decide = function (opts) {
    var energy = opts.energy || "low";   // low | med | high
    var time = opts.time || "5";          // "5" | "20" | "plenty"
    var crave = opts.crave || "any";      // any | savory | sweet | hot | light
    var pool = Anchor.meals.slice();

    // energy gates the gear
    if (energy === "low") pool = pool.filter(function (m) { return m.gear === "floor"; });
    if (energy === "high") {
      var cooks = pool.filter(function (m) { return m.gear === "cook"; });
      if (cooks.length) pool = cooks;
    }
    // time gates prep
    var maxPrep = time === "5" ? 6 : time === "20" ? 22 : 999;
    pool = pool.filter(function (m) { return (m.prepMin || 0) <= maxPrep; });

    // craving steers via tags/keywords
    if (crave !== "any") {
      var kw = {
        savory: ["high-protein", "one-pan", "pantry", "savory"],
        sweet: ["sweet", "dense-calories"],
        hot: ["warm", "one-pan", "one-pot"],
        light: ["no-cook", "high-fiber", "volume"],
      }[crave] || [];
      var matched = pool.filter(function (m) {
        return (m.tags || []).some(function (t) { return kw.indexOf(t) >= 0; }) ||
          (crave === "sweet" && /banana|yogurt|oat|berry|choc/i.test(m.name)) ||
          (crave === "hot" && /soup|stew|curry|chili|ramen|dal|bake/i.test(m.name));
      });
      if (matched.length) pool = matched;
    }
    if (!pool.length) pool = Anchor.meals.filter(function (m) { return m.gear === "floor"; });
    // pick one (rotate a bit by time so repeated taps vary)
    var idx = (Anchor.dayOfYear() + (Anchor._decideSalt = (Anchor._decideSalt || 0) + 1)) % pool.length;
    return pool[idx];
  };
})(window.Anchor = window.Anchor || {});
