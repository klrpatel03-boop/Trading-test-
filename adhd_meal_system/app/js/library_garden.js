/* ============================================================================
 * Anchor — library_garden.js
 * Kale-forward recipes for a 7-plant surplus, most built for a big 6-qt pan.
 * Each tagged garden:["kale"] + "garden" so they surface in "From your garden"
 * and the Menu's tag filter. Loaded after the other library packs.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var MORE = [
    {
      id: "garlicky-kale-eggs", name: "Garlicky Kale & Eggs", emoji: "🥬",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 22, fiber: 5, carbs: 14, fat: 18, calories: 320, cost: 0.70, prepMin: 8,
      tags: ["cheap", "high-protein", "one-pan", "garden", "fast"],
      garden: ["kale"],
      ingredients: ["A big handful of garden kale (stems stripped)", "2–3 eggs", "Garlic, chili flakes, olive oil", "Parmesan, lemon"],
      steps: ["Sizzle garlic + chili in oil in your pan.", "Add torn kale; cook until soft.", "Push aside, fry/scramble the eggs in the same pan.", "Parmesan + a squeeze of lemon."],
      booster: "oil", note: "A fast, savory way to eat a big handful of kale at breakfast.",
    },
    {
      id: "kale-white-bean-skillet", name: "Kale & White Bean Skillet", emoji: "🥬",
      category: "dinner", gear: "cook", servings: 4,
      protein: 20, fiber: 14, carbs: 38, fat: 16, calories: 430, cost: 1.10, prepMin: 20,
      tags: ["cheap", "vegetarian", "high-fiber", "one-pan", "garden"],
      garden: ["kale"],
      ingredients: ["A big bunch of garden kale", "2 cans white beans", "Garlic, chili, tomato or stock", "Olive oil, parmesan, lemon, bread"],
      steps: ["Soften garlic + chili in your 6-qt pan.", "Add beans + a splash of stock/tomato; simmer, mash some for creaminess.", "Pile in the kale; cook down until silky.", "Finish with parmesan, lemon, oil. Mop with bread."],
      booster: "oil", note: "Uses a whole bunch of kale; 14g fiber, comes together in one pan.",
    },
    {
      id: "kale-sausage-stew", name: "Kale, Sausage & Bean Stew", emoji: "🥘",
      category: "dinner", gear: "cook", servings: 6,
      protein: 28, fiber: 13, carbs: 36, fat: 20, calories: 500, cost: 1.60, prepMin: 35, batch: true,
      tags: ["high-protein", "one-pot", "freezes", "garden"],
      garden: ["kale"],
      ingredients: ["4 sausages, sliced", "2 cans beans", "Onion, garlic, smoked paprika", "Big bunch of garden kale", "Stock or tomato"],
      steps: ["Brown sausage in your 6-qt pan.", "Add aromatics + beans + stock; simmer 20 min.", "Stir in a big load of kale; cook until tender.", "Portion + freeze the extra."],
      booster: "oil", note: "A 6-qt-pan classic — a little sausage flavors the whole pot, kale bulks it up.",
    },
    {
      id: "kale-lentil-soup", name: "Lentil & Kale Soup", emoji: "🍲",
      category: "dinner", gear: "cook", servings: 6,
      protein: 18, fiber: 16, carbs: 48, fat: 8, calories: 380, cost: 0.85, prepMin: 35, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "one-pot", "freezes", "garden"],
      garden: ["kale"],
      ingredients: ["1.5 cups lentils", "Carrot, celery, onion, garlic", "Tomato + stock, cumin/thyme", "A big bunch of garden kale", "Lemon, olive oil"],
      steps: ["Soften the veg base in your pan.", "Add lentils + tomato + stock; simmer 25 min.", "Stir in chopped kale for the last 8 min.", "Finish with lemon + oil."],
      booster: "oil", note: "16g fiber, freezes great, and it loves a big pile of garden kale.",
    },
    {
      id: "kale-fried-rice", name: "Kale & Egg Fried Rice", emoji: "🍚",
      category: "dinner", gear: "cook", servings: 4,
      protein: 20, fiber: 7, carbs: 56, fat: 14, calories: 460, cost: 1.10, prepMin: 18,
      tags: ["cheap", "fast", "one-pan", "uses-leftovers", "garden"],
      garden: ["kale"],
      ingredients: ["Day-old rice", "3 eggs", "Big handful finely-shredded garden kale", "Garlic, ginger, soy, sesame", "Optional leftover protein"],
      steps: ["Scramble eggs in your pan; set aside.", "Fry garlic, ginger, then the shredded kale until it wilts and crisps a touch.", "Add rice + soy; toss hot.", "Fold the eggs back in + sesame."],
      booster: "oil", note: "Shredded kale crisps up beautifully in fried rice — sneaks in a big handful.",
    },
    {
      id: "massaged-kale-salad", name: "Massaged Kale & Chickpea Salad", emoji: "🥗",
      category: "lunch", gear: "floor", servings: 2,
      protein: 18, fiber: 12, carbs: 34, fat: 18, calories: 410, cost: 1.20, prepMin: 10,
      tags: ["no-cook", "high-fiber", "vegetarian", "make-ahead", "garden"],
      garden: ["kale"],
      ingredients: ["Big bunch raw garden kale (stemmed, chopped)", "1 can chickpeas", "Olive oil + lemon + salt", "Parmesan or feta, nuts/seeds"],
      steps: ["Massage chopped kale with oil, lemon, salt 1–2 min until soft + dark.", "Toss with chickpeas, cheese, nuts.", "Holds for days — actually better the next day (kale won't wilt like spinach)."],
      booster: "nuts", note: "Raw kale's superpower: it makes a salad that survives in the fridge for days.",
    },
    {
      id: "kale-chips", name: "Kale Chips", emoji: "🍂",
      category: "snack", gear: "cook", servings: 2,
      protein: 4, fiber: 4, carbs: 10, fat: 9, calories: 120, cost: 0.40, prepMin: 18,
      tags: ["cheap", "high-fiber", "garden", "volume"],
      garden: ["kale"],
      ingredients: ["A big tray of garden kale (dry, stemmed)", "Olive oil, salt", "Optional: parmesan / smoked paprika"],
      steps: ["Toss kale with a little oil + salt (don't overdo the oil).", "Bake low (~150°C/300°F) ~15–20 min until crisp.", "Eat immediately — a great way to use a surplus."],
      booster: "oil", note: "Turns a big harvest into a crunchy, cheap, high-fiber snack.",
    },
    {
      id: "kale-pesto-pasta", name: "Kale Pesto Pasta", emoji: "🌿",
      category: "dinner", gear: "cook", servings: 4,
      protein: 18, fiber: 9, carbs: 62, fat: 22, calories: 540, cost: 1.30, prepMin: 20,
      tags: ["dense-calories", "garden", "fast"],
      garden: ["kale"],
      ingredients: ["Big bunch garden kale", "Nuts/seeds + garlic + parmesan + olive oil", "Pasta", "Lemon, chili"],
      steps: ["Blanch kale 1 min in the pasta water.", "Blitz with nuts, garlic, parm, oil into a pesto.", "Toss with pasta + a splash of pasta water + lemon."],
      booster: "oil", note: "Uses the most kale at once + the oil/nuts make it gain-friendly. Freeze extra pesto.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "massaged-kale-salad": [{ source: "Budget Bytes", title: "Massaged kale salad", url: "https://www.budgetbytes.com/?s=kale+salad" }],
    "kale-chips": [{ source: "Budget Bytes", title: "Kale chips", url: "https://www.budgetbytes.com/?s=kale+chips" }],
    "kale-white-bean-skillet": [{ source: "The Mediterranean Dish", title: "Kale & white beans", url: "https://www.themediterraneandish.com/?s=kale+white+beans" }],
    "kale-sausage-stew": [{ source: "Budget Bytes", title: "Sausage kale bean", url: "https://www.budgetbytes.com/?s=sausage+kale" }],
    "kale-pesto-pasta": [{ source: "Serious Eats", title: "Kale pesto", url: "https://www.seriouseats.com/search?q=kale%20pesto" }],
    "kale-lentil-soup": [{ source: "Budget Bytes", title: "Lentil kale soup", url: "https://www.budgetbytes.com/?s=lentil+kale+soup" }],
  });
})(window.Anchor = window.Anchor || {});
