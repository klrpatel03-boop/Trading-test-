/* ============================================================================
 * Anchor — library10.js
 * A last handful of recipes + a few more cheap foods. Loaded after library9.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  Array.prototype.push.apply(Anchor.meals, [
    {
      id: "lentil-soup-curried", name: "Curried Carrot-Lentil Soup", emoji: "🥕",
      category: "dinner", gear: "cook", servings: 5,
      protein: 16, fiber: 12, carbs: 44, fat: 8, calories: 320, cost: 0.70, prepMin: 30, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["Red lentils + carrots", "Onion, garlic, ginger", "Curry powder, cumin", "Stock, lemon"],
      steps: ["Soften aromatics + spice.", "Add lentils, carrot, stock; simmer 25 min.", "Blend; finish with lemon."],
      booster: "oil", note: "Smooth, warming, blends away — easy on a low-appetite day.",
    },
    {
      id: "beef-broccoli-budget", name: "Budget Beef & Broccoli", emoji: "🥦",
      category: "dinner", gear: "cook", servings: 4,
      protein: 30, fiber: 6, carbs: 46, fat: 16, calories: 470, cost: 1.80, prepMin: 20,
      tags: ["high-protein", "fast", "one-pan"],
      ingredients: ["Thin-sliced cheap beef (or turkey)", "Frozen broccoli", "Soy + garlic + ginger + cornstarch", "Rice"],
      steps: ["Sear beef.", "Add broccoli + sauce; thicken.", "Serve over rice."],
      booster: "oil", note: "Takeout favorite, made cheaper and higher-protein at home.",
    },
    {
      id: "shaved-egg-salad-sandwich", name: "Protein Egg-Salad Sandwich", emoji: "🥪",
      category: "lunch", gear: "floor", servings: 1,
      protein: 24, fiber: 6, carbs: 30, fat: 16, calories: 380, cost: 0.90, prepMin: 6,
      tags: ["no-cook", "high-protein", "fast"],
      ingredients: ["3 boiled eggs", "Greek yogurt + mustard", "Whole-grain bread", "Lettuce"],
      steps: ["Mash eggs with yogurt + mustard.", "Sandwich with lettuce."],
      booster: "oil", note: "Uses batched eggs; 24g protein, lighter than mayo.",
    },
    {
      id: "frozen-burrito-diy", name: "DIY Bean-Rice Freezer Bowls", emoji: "🥡",
      category: "lunch", gear: "cook", servings: 8,
      protein: 22, fiber: 13, carbs: 56, fat: 12, calories: 440, cost: 1.10, prepMin: 40, batch: true,
      tags: ["cheap", "freezes", "meal-prep", "high-fiber"],
      ingredients: ["Rice + 2 cans beans", "Pre-cooked chicken or extra beans", "Corn, salsa, cheese", "8 containers"],
      steps: ["Cook rice + beans + protein.", "Portion into 8 containers with salsa + cheese.", "Freeze; microwave any day."],
      booster: "cheese", note: "Eight grab-and-reheat lunches — the leftover loop, industrialized.",
    },
    {
      id: "banana-oat-protein-muffins", name: "Banana-Oat Protein Muffins", emoji: "🧁",
      category: "snack", gear: "cook", servings: 12,
      protein: 10, fiber: 4, carbs: 24, fat: 8, calories: 200, cost: 0.40, prepMin: 30, batch: true,
      tags: ["make-ahead", "freezes", "sweet", "grab-and-go"],
      ingredients: ["Oats + banana + eggs", "Protein powder", "Baking powder, cinnamon", "Chocolate chips/nuts"],
      steps: ["Blend a batter.", "Bake in a muffin tin ~20 min.", "Freeze; grab for sweet protein."],
      booster: "pb", note: "Cheaper than store muffins, 10g protein, batch + freeze.",
    },
    {
      id: "chickpea-tuna-melt-bowl", name: "Smoky Chickpea & Tomato Stew", emoji: "🍲",
      category: "dinner", gear: "cook", servings: 5,
      protein: 18, fiber: 13, carbs: 48, fat: 12, calories: 400, cost: 0.95, prepMin: 30, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["2 cans chickpeas", "1 can tomatoes", "Onion, garlic, smoked paprika", "Spinach, bread to mop"],
      steps: ["Build a smoky tomato base.", "Add chickpeas; simmer 20 min, mash some.", "Wilt spinach; serve with bread."],
      booster: "oil", note: "Five-ingredient, freezer-friendly, 13g fiber.",
    },
    {
      id: "turkey-lettuce-wraps", name: "Turkey Lettuce Wraps", emoji: "🥬",
      category: "dinner", gear: "cook", servings: 4,
      protein: 28, fiber: 4, carbs: 20, fat: 14, calories: 330, cost: 1.40, prepMin: 18,
      tags: ["high-protein", "low-carb-ish", "fast", "one-pan"],
      ingredients: ["Ground turkey", "Water chestnuts/carrot", "Hoisin/soy + garlic + ginger", "Lettuce cups, rice optional"],
      steps: ["Brown turkey with aromatics.", "Add sauce + crunchy veg.", "Spoon into lettuce cups."],
      booster: "oil", note: "Light but high-protein; rice on the side bumps gain calories.",
    },
    {
      id: "oat-protein-smoothie-bowl", name: "Peanut-Oat Gainer Bowl", emoji: "🥣",
      category: "breakfast", gear: "floor", servings: 1,
      protein: 36, fiber: 9, carbs: 62, fat: 20, calories: 600, cost: 1.20, prepMin: 4,
      tags: ["no-cook", "dense-calories", "high-protein"],
      ingredients: ["Blended oats + banana + protein + PB + whole milk", "Granola + chia on top"],
      steps: ["Blend thick.", "Top with granola + chia.", "Spoon a 600-cal gainer breakfast."],
      booster: "pb", note: "Big, dense, 36g protein — a serious surplus breakfast.",
    },
    {
      id: "refried-bean-tostadas", name: "Refried Bean Tostadas", emoji: "🫓",
      category: "dinner", gear: "cook", servings: 3,
      protein: 18, fiber: 13, carbs: 48, fat: 14, calories: 420, cost: 0.85, prepMin: 12,
      tags: ["cheap", "vegetarian", "fast", "high-fiber"],
      ingredients: ["Tostada shells (or crisped tortillas)", "Refried beans", "Cheese, lettuce, salsa", "Yogurt + hot sauce"],
      steps: ["Warm beans, spread on crisp tostadas.", "Top with cheese, lettuce, salsa, yogurt."],
      booster: "cheese", note: "Crunchy, fast, under a dollar a serving, 13g fiber.",
    },
    {
      id: "tuna-pasta-salad", name: "Tuna Pasta Salad (make-ahead)", emoji: "🥗",
      category: "lunch", gear: "floor", servings: 3,
      protein: 24, fiber: 7, carbs: 48, fat: 14, calories: 420, cost: 1.20, prepMin: 12,
      tags: ["no-cook-ish", "high-protein", "make-ahead"],
      ingredients: ["Cooked pasta (cooled)", "2 cans tuna", "Greek yogurt + mustard + lemon", "Sweetcorn, peas, herbs"],
      steps: ["Toss cooled pasta with tuna + dressing + veg.", "Keeps 3 days; great desk lunch."],
      booster: "oil", note: "Batch it Sunday for a week of high-protein lunches.",
    },
    {
      id: "masala-omelette-roll", name: "Masala Omelette Roll", emoji: "🌯",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 22, fiber: 4, carbs: 28, fat: 18, calories: 400, cost: 0.80, prepMin: 8,
      tags: ["cheap", "fast", "high-protein"],
      ingredients: ["2–3 eggs", "Onion, chili, cilantro, spices", "Tortilla/roti", "Hot sauce or chutney"],
      steps: ["Whisk eggs with chopped onion + chili + spices.", "Cook as an omelette.", "Roll up in a warm tortilla with sauce."],
      booster: "cheese", note: "Spiced, savory, portable — a 5-ingredient protein breakfast.",
    },
    {
      id: "white-bean-kale-pasta", name: "White Bean & Kale Pasta", emoji: "🍝",
      category: "dinner", gear: "cook", servings: 4,
      protein: 22, fiber: 13, carbs: 62, fat: 14, calories: 500, cost: 1.20, prepMin: 20,
      tags: ["cheap", "vegetarian", "high-fiber", "fast", "one-pan"],
      ingredients: ["Pasta", "1 can white beans", "Kale/spinach", "Garlic, chili, olive oil, parmesan", "Lemon"],
      steps: ["Cook pasta; save some water.", "Sizzle garlic + chili in oil, wilt greens + beans.", "Toss with pasta, parmesan, lemon, a splash of pasta water."],
      booster: "oil", note: "20-minute, 13g-fiber pasta from pantry + a bag of greens.",
    },
  ]);

  Array.prototype.push.apply(Anchor.foods, [
    { name: "Black-eyed peas", emoji: "🫘", group: "protein", serve: "1 cup", protein: 13, fiber: 11, cal: 200, cost: 0.50 },
    { name: "Frozen edamame", emoji: "🫛", group: "protein", serve: "1 cup", protein: 18, fiber: 8, cal: 190, cost: 0.60 },
    { name: "Couscous", emoji: "🌾", group: "grain", serve: "1 cup cooked", protein: 6, fiber: 2, cal: 176, cost: 0.30 },
    { name: "Frozen peas", emoji: "🟢", group: "veg", serve: "1 cup", protein: 8, fiber: 7, cal: 110, cost: 0.30 },
    { name: "Plain kefir", emoji: "🥛", group: "dairy", serve: "1 cup", protein: 9, fiber: 0, cal: 110, cost: 0.70 },
    { name: "Cannellini beans", emoji: "🫘", group: "protein", serve: "1 cup", protein: 15, fiber: 11, cal: 225, cost: 0.55 },
    { name: "Sunflower butter", emoji: "🌻", group: "fat", serve: "2 tbsp", protein: 6, fiber: 2, cal: 200, cost: 0.30 },
    { name: "Bulgur wheat", emoji: "🌾", group: "grain", serve: "1 cup cooked", protein: 6, fiber: 8, cal: 150, cost: 0.20 },
    { name: "Green peas (frozen)", emoji: "🟢", group: "veg", serve: "1 cup", protein: 8, fiber: 7, cal: 110, cost: 0.30 },
    { name: "Cabbage (green)", emoji: "🥬", group: "veg", serve: "2 cups", protein: 2, fiber: 4, cal: 44, cost: 0.20 },
    { name: "Hemp seeds", emoji: "🌿", group: "fat", serve: "3 tbsp", protein: 10, fiber: 2, cal: 170, cost: 0.55 },
    { name: "Black beans (dried)", emoji: "🫘", group: "protein", serve: "1 cup cooked", protein: 15, fiber: 15, cal: 227, cost: 0.22 },
    { name: "Pearl barley", emoji: "🌾", group: "grain", serve: "1 cup cooked", protein: 4, fiber: 6, cal: 193, cost: 0.18 },
    { name: "Collard greens", emoji: "🥬", group: "veg", serve: "1 cup cooked", protein: 4, fiber: 5, cal: 63, cost: 0.30 },
  ]);

  Object.assign(Anchor.recipeLinks, {
    "beef-broccoli-budget": [{ source: "Budget Bytes", title: "Beef & broccoli", url: "https://www.budgetbytes.com/?s=beef+and+broccoli" }],
    "banana-oat-protein-muffins": [{ source: "EatingWell", title: "Banana oat protein muffins", url: "https://www.eatingwell.com/search?q=banana%20protein%20muffins" }],
  });
})(window.Anchor = window.Anchor || {});
