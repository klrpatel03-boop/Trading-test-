/* ============================================================================
 * Anchor — library8.js
 * Final recipe pack — rounds the library to a deep, never-stale rotation.
 * Loaded after library7.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var MORE = [
    {
      id: "moong-dal-chilla", name: "Lentil Chilla (Savory Pancakes)", emoji: "🥞",
      category: "breakfast", gear: "cook", servings: 3,
      protein: 18, fiber: 9, carbs: 34, fat: 8, calories: 290, cost: 0.60, prepMin: 20,
      tags: ["cheap", "vegetarian", "high-protein", "high-fiber"],
      ingredients: ["Soaked/blended moong lentils", "Onion, chili, spices", "Pan-fried thin", "Yogurt/chutney"],
      steps: ["Blend lentils into a batter with spices.", "Cook thin pancakes both sides.", "Eat with yogurt."],
      booster: "oil", note: "High-protein savory breakfast from one cheap pantry staple.",
    },
    {
      id: "bean-cornbread-bake", name: "Chili Cornbread Bake", emoji: "🌽",
      category: "dinner", gear: "cook", servings: 6,
      protein: 22, fiber: 12, carbs: 58, fat: 16, calories: 510, cost: 1.30, prepMin: 45, batch: true,
      tags: ["cheap", "freezes", "comfort"],
      ingredients: ["Bean chili base", "Cornbread batter on top", "Cheese"],
      steps: ["Spread chili in a dish.", "Pour cornbread batter over.", "Bake until golden ~30 min."],
      booster: "cheese", note: "Two comfort foods in one tray; freezes in slabs.",
    },
    {
      id: "tofu-banh-mi", name: "Tofu Bánh Mì Bowl", emoji: "🥖",
      category: "lunch", gear: "cook", servings: 2,
      protein: 22, fiber: 7, carbs: 48, fat: 16, calories: 460, cost: 1.40, prepMin: 20,
      tags: ["vegetarian", "high-protein", "fresh"],
      ingredients: ["Marinated tofu", "Pickled carrot/cucumber", "Rice or baguette", "Sriracha-mayo, cilantro"],
      steps: ["Crisp marinated tofu.", "Quick-pickle the veg.", "Build a bowl or sandwich."],
      booster: "oil", note: "Bright, crunchy, satisfying — meal-preps well.",
    },
    {
      id: "shrimp-fried-rice-budget", name: "Budget 'Surf' Fried Rice", emoji: "🍤",
      category: "dinner", gear: "cook", servings: 3,
      protein: 24, fiber: 5, carbs: 56, fat: 14, calories: 470, cost: 1.70, prepMin: 18,
      tags: ["fast", "uses-leftovers"],
      ingredients: ["Day-old rice", "Frozen shrimp (or egg+tofu)", "Frozen veg, egg", "Soy, garlic, sesame"],
      steps: ["Scramble egg, set aside.", "Fry shrimp + veg.", "Add rice + soy; fold in egg."],
      booster: "oil", note: "Frozen shrimp on sale = a 15-minute treat dinner.",
    },
    {
      id: "lentil-meatballs", name: "Lentil 'Meatballs' & Marinara", emoji: "🍝",
      category: "dinner", gear: "cook", servings: 5,
      protein: 20, fiber: 14, carbs: 56, fat: 12, calories: 460, cost: 1.10, prepMin: 40, batch: true,
      tags: ["vegetarian", "high-fiber", "freezes"],
      ingredients: ["Lentils + oats + egg, baked into balls", "Marinara", "Pasta", "Parmesan"],
      steps: ["Mix + roll lentil balls; bake.", "Simmer in marinara.", "Serve over pasta."],
      booster: "cheese", note: "Freezer-friendly plant 'meatballs', 14g fiber.",
    },
    {
      id: "breakfast-rice-bowl", name: "Savory Breakfast Rice Bowl", emoji: "🍳",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 22, fiber: 5, carbs: 48, fat: 14, calories: 420, cost: 0.90, prepMin: 8,
      tags: ["uses-leftovers", "savory", "fast"],
      ingredients: ["Leftover rice", "Fried egg", "Beans or leftover protein", "Soy/hot sauce, scallion"],
      steps: ["Warm rice + beans.", "Top with a fried egg + sauce."],
      booster: "oil", note: "If sweet breakfasts bore you — leftover rice + egg, sorted.",
    },
    {
      id: "cabbage-roll-soup", name: "Unstuffed Cabbage Roll Soup", emoji: "🥬",
      category: "dinner", gear: "cook", servings: 6,
      protein: 24, fiber: 9, carbs: 40, fat: 14, calories: 420, cost: 1.30, prepMin: 40, batch: true,
      tags: ["cheap", "freezes", "one-pot", "high-protein"],
      ingredients: ["Ground turkey/beef", "Cabbage", "Rice", "Tomato + stock", "Paprika, garlic"],
      steps: ["Brown meat.", "Add cabbage, rice, tomato, stock.", "Simmer until rice is done."],
      booster: "oil", note: "All the cabbage-roll flavor, none of the rolling. Freezes well.",
    },
    {
      id: "pb-banana-toast-stack", name: "PB-Banana Protein Toast", emoji: "🍞",
      category: "breakfast", gear: "floor", servings: 1,
      protein: 20, fiber: 7, carbs: 46, fat: 18, calories: 480, cost: 0.70, prepMin: 4,
      tags: ["no-cook", "fast", "dense-calories"],
      ingredients: ["High-protein/whole-grain toast", "Peanut butter", "Banana, honey, chia"],
      steps: ["Toast.", "Layer PB, banana, honey, chia."],
      booster: "pb", note: "Dense, fast, gain-friendly. 480 cal in 4 minutes.",
    },
    {
      id: "greek-yogurt-chicken-salad", name: "Greek-Yogurt Chicken Salad", emoji: "🥗",
      category: "lunch", gear: "floor", servings: 3,
      protein: 30, fiber: 3, carbs: 14, fat: 12, calories: 300, cost: 1.50, prepMin: 8,
      tags: ["no-cook", "high-protein", "make-ahead"],
      ingredients: ["Pre-cooked/canned chicken", "Greek yogurt + mustard", "Celery, grapes, walnuts"],
      steps: ["Mix chicken with yogurt + add-ins.", "Eat on bread, crackers, or greens."],
      booster: "nuts", note: "30g protein, lighter than mayo, great make-ahead.",
    },
    {
      id: "spiced-popcorn-mix", name: "Spiced Popcorn & Nut Mix", emoji: "🍿",
      category: "snack", gear: "cook", servings: 2,
      protein: 8, fiber: 6, carbs: 22, fat: 16, calories: 280, cost: 0.40, prepMin: 6,
      tags: ["cheap", "volume", "dense-calories"],
      ingredients: ["Air-popped popcorn", "Nuts", "Olive oil + smoked paprika + salt"],
      steps: ["Pop corn.", "Toss with nuts, oil, spice."],
      booster: "nuts", note: "Cheap, crunchy, fiber + dense calories for gaining.",
    },
    {
      id: "egg-salad-protein", name: "High-Protein Egg Salad", emoji: "🥚",
      category: "lunch", gear: "floor", servings: 2,
      protein: 20, fiber: 2, carbs: 10, fat: 16, calories: 280, cost: 0.80, prepMin: 8,
      tags: ["no-cook", "high-protein", "make-ahead"],
      ingredients: ["Hard-boiled eggs (batched)", "Greek yogurt + mustard", "Chives, salt", "Bread/crackers"],
      steps: ["Chop eggs.", "Mix with yogurt + mustard.", "Pile on bread or greens."],
      booster: "oil", note: "Uses your batched eggs; lighter than mayo, 20g protein.",
    },
    {
      id: "frozen-fruit-protein-sorbet", name: "Frozen Fruit Protein 'Sorbet'", emoji: "🍧",
      category: "snack", gear: "floor", servings: 1,
      protein: 26, fiber: 6, carbs: 30, fat: 4, calories: 260, cost: 1.00, prepMin: 3,
      tags: ["no-cook", "sweet", "high-protein"],
      ingredients: ["Frozen fruit", "1 scoop protein", "Splash of milk", "Blend thick"],
      steps: ["Blend frozen fruit + protein + a little milk until ice-cream thick.", "Spoon it."],
      booster: "milk", note: "Ice-cream-feeling dessert, 26g protein. Beats the candy run.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "cabbage-roll-soup": [{ source: "Budget Bytes", title: "Unstuffed cabbage roll soup", url: "https://www.budgetbytes.com/?s=cabbage+roll+soup" }],
    "lentil-meatballs": [{ source: "Budget Bytes", title: "Lentil meatballs", url: "https://www.budgetbytes.com/?s=lentil+meatballs" }],
    "tofu-banh-mi": [{ source: "Serious Eats", title: "Tofu bánh mì", url: "https://www.seriouseats.com/search?q=tofu%20banh%20mi" }],
    "greek-yogurt-chicken-salad": [{ source: "EatingWell", title: "Greek yogurt chicken salad", url: "https://www.eatingwell.com/search?q=greek%20yogurt%20chicken%20salad" }],
    "bean-cornbread-bake": [{ source: "Budget Bytes", title: "Chili cornbread bake", url: "https://www.budgetbytes.com/?s=cornbread+chili" }],
  });
})(window.Anchor = window.Anchor || {});
