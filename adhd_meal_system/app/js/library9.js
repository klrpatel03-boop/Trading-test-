/* ============================================================================
 * Anchor — library9.js
 * Last recipe pack — a few more cheap, high-protein staples to round out the
 * library. Loaded after library8.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var MORE = [
    {
      id: "black-eyed-pea-stew", name: "Black-Eyed Pea & Greens Stew", emoji: "🥬",
      category: "dinner", gear: "cook", servings: 6,
      protein: 18, fiber: 13, carbs: 46, fat: 8, calories: 360, cost: 0.85, prepMin: 40, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["2 cans black-eyed peas", "Collards/kale", "Onion, garlic, smoked paprika", "Tomato + stock"],
      steps: ["Soften aromatics.", "Add peas, tomato, stock; simmer.", "Wilt in the greens."],
      booster: "oil", note: "Southern-style, deeply cheap, big fiber, freezes well.",
    },
    {
      id: "tuna-nicoise-bowl", name: "Tuna Niçoise-ish Bowl", emoji: "🥗",
      category: "lunch", gear: "floor", servings: 1,
      protein: 30, fiber: 7, carbs: 30, fat: 16, calories: 420, cost: 1.60, prepMin: 8,
      tags: ["no-cook", "high-protein"],
      ingredients: ["Canned tuna", "Boiled potato + egg (batched)", "Green beans, olives", "Olive oil + mustard vinaigrette"],
      steps: ["Arrange tuna, potato, egg, veg.", "Dress with oil + mustard."],
      booster: "oil", note: "Composed, filling, 30g protein from cheap tins + batched eggs.",
    },
    {
      id: "curried-egg-rice", name: "Curried Egg Fried Rice", emoji: "🍳",
      category: "dinner", gear: "cook", servings: 3,
      protein: 18, fiber: 5, carbs: 56, fat: 14, calories: 440, cost: 0.80, prepMin: 15,
      tags: ["cheap", "fast", "uses-leftovers", "one-pan"],
      ingredients: ["Day-old rice", "3 eggs", "Frozen peas/veg", "Curry powder, soy"],
      steps: ["Scramble eggs.", "Fry rice + veg with curry powder.", "Fold in eggs + soy."],
      booster: "oil", note: "Cheapest dinner here that still feels like a real meal.",
    },
    {
      id: "white-bean-tuna-melt-bake", name: "Cheesy Bean & Tuna Pasta", emoji: "🧀",
      category: "dinner", gear: "cook", servings: 4,
      protein: 30, fiber: 10, carbs: 56, fat: 16, calories: 520, cost: 1.30, prepMin: 25, batch: true,
      tags: ["cheap", "high-protein", "comfort", "freezes"],
      ingredients: ["Pasta", "2 cans tuna + 1 can white beans", "Cheese sauce", "Spinach, breadcrumb"],
      steps: ["Cook pasta.", "Mix with tuna, beans, cheese sauce, spinach.", "Bake with breadcrumb top."],
      booster: "cheese", note: "Two cheap proteins + fiber in a comfort-food bake.",
    },
    {
      id: "savory-chickpea-waffle", name: "Chickpea Flour Omelette", emoji: "🍳",
      category: "breakfast", gear: "cook", servings: 2,
      protein: 16, fiber: 8, carbs: 30, fat: 12, calories: 320, cost: 0.60, prepMin: 12,
      tags: ["cheap", "vegetarian", "high-fiber"],
      ingredients: ["Chickpea flour batter", "Onion, spinach, spices", "Pan-fried like an omelette"],
      steps: ["Whisk chickpea flour + water + spices.", "Pour + cook with veg folded in."],
      booster: "oil", note: "Eggless high-protein 'omelette' from one cheap flour.",
    },
    {
      id: "yogurt-marinated-chicken", name: "Yogurt-Marinated Chicken & Rice", emoji: "🍗",
      category: "dinner", gear: "cook", servings: 4,
      protein: 38, fiber: 5, carbs: 46, fat: 14, calories: 500, cost: 1.60, prepMin: 30, batch: true,
      tags: ["high-protein", "meal-prep"],
      ingredients: ["Chicken thighs in yogurt-spice marinade", "Rice", "Cucumber salad", "Garlic sauce"],
      steps: ["Marinate chicken in spiced yogurt.", "Sear/bake.", "Serve over rice with salad."],
      booster: "oil", note: "Yogurt makes cheap chicken tender + juicy; meal-preps great.",
    },
    {
      id: "loaded-hummus-bowl", name: "Loaded Hummus Dinner Bowl", emoji: "🫛",
      category: "dinner", gear: "floor", servings: 2,
      protein: 18, fiber: 12, carbs: 40, fat: 20, calories: 460, cost: 1.20, prepMin: 6,
      tags: ["no-cook", "vegetarian", "high-fiber"],
      ingredients: ["Big base of hummus", "Warm chickpeas + spice on top", "Cucumber, tomato, olives", "Pita, olive oil"],
      steps: ["Spread hummus in a bowl.", "Top with warm spiced chickpeas + veg.", "Scoop with pita."],
      booster: "oil", note: "'Hummus for dinner' done right — filling, high-fiber, no cooking.",
    },
    {
      id: "apple-pb-protein-wrap", name: "Apple-PB Protein Wrap", emoji: "🌯",
      category: "snack", gear: "floor", servings: 1,
      protein: 14, fiber: 7, carbs: 40, fat: 18, calories: 420, cost: 0.70, prepMin: 3,
      tags: ["no-cook", "dense-calories", "fast"],
      ingredients: ["Tortilla", "Peanut butter", "Apple slices, cinnamon, honey"],
      steps: ["Spread PB on a tortilla.", "Add apple + cinnamon; roll up."],
      booster: "pb", note: "Sweet, dense, portable — easy gain calories on the go.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "black-eyed-pea-stew": [{ source: "Budget Bytes", title: "Black-eyed pea stew", url: "https://www.budgetbytes.com/?s=black+eyed+peas" }],
    "yogurt-marinated-chicken": [{ source: "The Mediterranean Dish", title: "Yogurt marinated chicken", url: "https://www.themediterraneandish.com/?s=yogurt+chicken" }],
    "curried-egg-rice": [{ source: "Budget Bytes", title: "Egg fried rice", url: "https://www.budgetbytes.com/?s=egg+fried+rice" }],
  });
})(window.Anchor = window.Anchor || {});
