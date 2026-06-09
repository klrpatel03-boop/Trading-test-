/* ============================================================================
 * Anchor — library4.js
 * Fourth (final) recipe pack. Rounds out cuisines, quick wins, and a few
 * "weekend cook" projects for high-energy days. Loaded after foods.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var MORE = [
    /* ---------- weekend / high-energy cook projects ---------- */
    {
      id: "beef-bean-burritos", name: "Big-Batch Burritos (freeze)", emoji: "🌯",
      category: "dinner", gear: "cook", servings: 8,
      protein: 30, fiber: 12, carbs: 56, fat: 18, calories: 540, cost: 1.50, prepMin: 50, batch: true,
      tags: ["cheap", "freezes", "meal-prep", "make-ahead"],
      ingredients: ["1 lb lean beef/turkey", "2 cans beans", "Rice", "Cheese", "8 large tortillas", "Taco spice, salsa"],
      steps: ["Cook seasoned meat + beans.", "Assembly-line fill tortillas with meat, rice, beans, cheese.", "Wrap in foil, freeze.", "Microwave from frozen ~3 min any day."],
      booster: "cheese", note: "One session = 8 grab-and-reheat dinners/lunches. Elite leftover loop.",
    },
    {
      id: "chicken-tray-bake", name: "Chicken & Veg Tray Bake", emoji: "🍗",
      category: "dinner", gear: "cook", servings: 5,
      protein: 38, fiber: 9, carbs: 40, fat: 18, calories: 510, cost: 1.80, prepMin: 50, batch: true,
      tags: ["high-protein", "one-pan", "meal-prep"],
      ingredients: ["Chicken thighs/legs", "Potatoes, carrots, onion, pepper", "Olive oil, paprika, garlic, herbs"],
      steps: ["Toss everything in oil + spices on a sheet pan.", "Roast 220°C/425°F ~40 min.", "Portion into containers."],
      booster: "oil", note: "One pan, minimal cleanup, a week of high-protein lunches.",
    },
    {
      id: "lasagna-lentil", name: "Lentil & Spinach Lasagna", emoji: "🍝",
      category: "dinner", gear: "cook", servings: 8,
      protein: 26, fiber: 12, carbs: 52, fat: 18, calories: 500, cost: 1.40, prepMin: 75, batch: true,
      tags: ["vegetarian", "freezes", "make-ahead", "weekend"],
      ingredients: ["Lasagna sheets", "Lentil bolognese (see recipe)", "Spinach + ricotta or cottage cheese", "Mozzarella", "Tomato sauce"],
      steps: ["Layer sauce, sheets, lentil ragu, cheese.", "Repeat; top with mozzarella.", "Bake 190°C/375°F ~40 min.", "Freezes in slabs."],
      booster: "cheese", note: "A weekend project that pays back all week. Sneaky-high protein + fiber.",
    },
    {
      id: "pulled-bbq-jackfruit-or-chicken", name: "BBQ Pulled Chicken", emoji: "🍖",
      category: "dinner", gear: "cook", servings: 6,
      protein: 32, fiber: 5, carbs: 44, fat: 12, calories: 440, cost: 1.50, prepMin: 60, batch: true,
      tags: ["high-protein", "freezes", "meal-prep"],
      ingredients: ["Chicken thighs", "BBQ sauce + a little vinegar", "Buns or rice", "Slaw (cabbage + carrot)"],
      steps: ["Simmer/braise chicken until it shreds.", "Toss in BBQ sauce.", "Serve on buns/rice with slaw."],
      booster: "oil", note: "Crowd-pleaser that meal-preps and freezes; slaw adds cheap fiber.",
    },

    /* ---------- fast weeknight ---------- */
    {
      id: "gnocchi-skillet", name: "Crispy Gnocchi & Beans", emoji: "🥔",
      category: "dinner", gear: "cook", servings: 3,
      protein: 18, fiber: 9, carbs: 60, fat: 14, calories: 470, cost: 1.30, prepMin: 18,
      tags: ["fast", "one-pan", "comfort"],
      ingredients: ["Shelf gnocchi", "1 can white beans", "Spinach/tomato", "Garlic, parmesan, olive oil"],
      steps: ["Crisp gnocchi in oil (don't boil).", "Add beans + greens + tomato.", "Finish with parmesan."],
      booster: "cheese", note: "Crispy, fast, comforting; beans sneak in protein + fiber.",
    },
    {
      id: "tuna-pasta-bake", name: "Tuna Pasta Bake", emoji: "🍝",
      category: "dinner", gear: "cook", servings: 5,
      protein: 30, fiber: 8, carbs: 58, fat: 16, calories: 520, cost: 1.30, prepMin: 35, batch: true,
      tags: ["cheap", "high-protein", "freezes", "comfort"],
      ingredients: ["Pasta", "2 cans tuna", "Frozen peas/sweetcorn", "Cheese sauce (or milk + cheese + flour)", "Breadcrumb top"],
      steps: ["Cook pasta + peas.", "Mix with tuna + cheese sauce.", "Top with breadcrumb + cheese; bake 20 min."],
      booster: "cheese", note: "Nostalgic comfort, cheap protein, freezes in portions.",
    },
    {
      id: "egg-curry", name: "Egg Curry", emoji: "🥚",
      category: "dinner", gear: "cook", servings: 4,
      protein: 20, fiber: 6, carbs: 38, fat: 18, calories: 400, cost: 1.00, prepMin: 25,
      tags: ["cheap", "vegetarian", "one-pot"],
      ingredients: ["6 hard-boiled eggs", "Onion-tomato curry base", "Coconut milk or yogurt", "Curry spices", "Rice"],
      steps: ["Make a spiced onion-tomato gravy.", "Add halved boiled eggs.", "Simmer; serve over rice."],
      booster: "oil", note: "Cheap protein in a rich curry — eggs go further than you'd think.",
    },
    {
      id: "smashed-bean-tacos", name: "Crispy Smashed Bean Tacos", emoji: "🌮",
      category: "dinner", gear: "cook", servings: 3,
      protein: 18, fiber: 13, carbs: 46, fat: 16, calories: 440, cost: 0.90, prepMin: 18,
      tags: ["cheap", "vegetarian", "fast", "high-fiber"],
      ingredients: ["Tortillas", "2 cans refried/mashed beans", "Cheese", "Salsa, slaw, hot sauce"],
      steps: ["Spread beans on tortillas, cheese on top.", "Crisp face-down in a dry pan.", "Fold, top with slaw + salsa."],
      booster: "cheese", note: "Crispy taco crunch, 13g fiber, under a dollar a serving.",
    },

    /* ---------- breakfasts ---------- */
    {
      id: "breakfast-quesadilla", name: "Egg & Cheese Breakfast Quesadilla", emoji: "🫓",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 26, fiber: 6, carbs: 30, fat: 18, calories: 420, cost: 1.00, prepMin: 8,
      tags: ["fast", "high-protein"],
      ingredients: ["Tortilla", "2 eggs", "Cheese", "Beans or spinach", "Salsa"],
      steps: ["Scramble eggs.", "Fill tortilla with eggs, cheese, beans.", "Crisp both sides; cut."],
      booster: "cheese", note: "Crispy, savory, fast — and travels.",
    },
    {
      id: "savory-oats", name: "Savory Oats with Egg", emoji: "🍳",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 22, fiber: 7, carbs: 40, fat: 16, calories: 420, cost: 0.70, prepMin: 8,
      tags: ["cheap", "savory", "warm"],
      ingredients: ["Oats cooked in stock (not milk)", "Cheese stirred in", "Fried/soft egg on top", "Scallion, soy, chili"],
      steps: ["Cook oats in savory stock.", "Stir in cheese.", "Top with an egg + scallion + chili."],
      booster: "cheese", note: "If sweet breakfasts bore you — savory oats are a revelation.",
    },

    /* ---------- lunches ---------- */
    {
      id: "mediterranean-box", name: "Mezze Lunch Box", emoji: "🫓",
      category: "lunch", gear: "floor", servings: 1,
      protein: 20, fiber: 12, carbs: 44, fat: 18, calories: 470, cost: 1.40, prepMin: 5,
      tags: ["no-cook", "high-fiber", "mediterranean"],
      ingredients: ["Hummus", "Pita", "Cucumber, tomato, olives", "Feta", "Handful chickpeas"],
      steps: ["Box it all up.", "Dip + graze. Great desk lunch."],
      booster: "oil", note: "Snack-plate energy that's actually a balanced, high-fiber meal.",
    },
    {
      id: "leftover-grain-salad", name: "Leftover Grain + Bean Salad", emoji: "🥗",
      category: "lunch", gear: "floor", servings: 2,
      protein: 18, fiber: 13, carbs: 46, fat: 14, calories: 420, cost: 1.00, prepMin: 6,
      tags: ["no-cook", "high-fiber", "make-ahead"],
      ingredients: ["Leftover rice/quinoa", "1 can beans", "Whatever veg + herbs", "Olive oil + lemon + mustard"],
      steps: ["Toss leftovers with beans + dressing.", "Keeps for days; better cold."],
      booster: "oil", note: "Turns yesterday's grain into a no-cook high-fiber lunch.",
    },

    /* ---------- snacks ---------- */
    {
      id: "tuna-cucumber", name: "Tuna & Cucumber Boats", emoji: "🥒",
      category: "snack", gear: "floor", servings: 1,
      protein: 20, fiber: 2, carbs: 8, fat: 8, calories: 180, cost: 1.00, prepMin: 4,
      tags: ["no-cook", "high-protein", "low-carb"],
      ingredients: ["1 pouch tuna", "Cucumber halves", "Greek yogurt + lemon + dill"],
      steps: ["Mix tuna with yogurt.", "Spoon into cucumber boats."],
      booster: "oil", note: "Crunchy, light, 20g protein for low-appetite afternoons.",
    },
    {
      id: "frozen-yogurt-bark", name: "Frozen Yogurt Bark", emoji: "🍦",
      category: "snack", gear: "floor", servings: 6,
      protein: 12, fiber: 2, carbs: 16, fat: 4, calories: 130, cost: 0.60, prepMin: 10, batch: true,
      tags: ["no-cook", "make-ahead", "sweet"],
      ingredients: ["Greek yogurt", "Honey", "Berries + a little granola/chocolate"],
      steps: ["Spread sweetened yogurt on a tray.", "Scatter toppings.", "Freeze; snap into shards."],
      booster: "honey", note: "Dessert-feeling, protein-y, batch-made — beats ice cream cravings.",
    },
    {
      id: "loaded-toast", name: "Cottage Cheese 'Whipped' Toast", emoji: "🍞",
      category: "snack", gear: "floor", servings: 1,
      protein: 22, fiber: 5, carbs: 28, fat: 8, calories: 280, cost: 0.80, prepMin: 4,
      tags: ["no-cook", "high-protein", "fast"],
      ingredients: ["Cottage cheese (blended smooth)", "Toast", "Tomato/everything seasoning or berries+honey"],
      steps: ["Blend cottage cheese smooth.", "Spread thick on toast.", "Top savory or sweet."],
      booster: "honey", note: "Trendy for a reason — 22g protein, sweet or savory.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "beef-bean-burritos": [{ source: "Budget Bytes", title: "Freezer breakfast/burritos", url: "https://www.budgetbytes.com/?s=freezer+burrito" }],
    "chicken-tray-bake": [{ source: "BBC Good Food", title: "Chicken traybake", url: "https://www.bbcgoodfood.com/search?q=chicken%20traybake" }],
    "lasagna-lentil": [{ source: "Budget Bytes", title: "Lentil lasagna / vegetarian lasagna", url: "https://www.budgetbytes.com/?s=lasagna" }],
    "gnocchi-skillet": [{ source: "Budget Bytes", title: "Crispy gnocchi", url: "https://www.budgetbytes.com/?s=gnocchi" }],
    "tuna-pasta-bake": [{ source: "BBC Good Food", title: "Tuna pasta bake", url: "https://www.bbcgoodfood.com/search?q=tuna%20pasta%20bake" }],
    "egg-curry": [{ source: "Budget Bytes", title: "Egg curry", url: "https://www.budgetbytes.com/?s=egg+curry" }],
    "smashed-bean-tacos": [{ source: "Budget Bytes", title: "Crispy bean tacos", url: "https://www.budgetbytes.com/?s=bean+tacos" }],
    "pulled-bbq-jackfruit-or-chicken": [{ source: "Budget Bytes", title: "BBQ pulled chicken", url: "https://www.budgetbytes.com/?s=bbq+chicken" }],
    "savory-oats": [{ source: "Serious Eats", title: "Savory oatmeal", url: "https://www.seriouseats.com/search?q=savory%20oatmeal" }],
  });
})(window.Anchor = window.Anchor || {});
