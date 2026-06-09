/* ============================================================================
 * Anchor — library7.js
 * Extra recipe pack to keep a long-term user in fresh variety. Loaded after
 * library6.js. Same shape; cheap, high-protein, gain-friendly.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var MORE = [
    {
      id: "lentil-tacos", name: "Lentil Walnut Tacos", emoji: "🌮",
      category: "dinner", gear: "cook", servings: 4,
      protein: 18, fiber: 14, carbs: 44, fat: 16, calories: 430, cost: 1.00, prepMin: 25, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber"],
      ingredients: ["Lentils + crushed walnuts", "Taco spice", "Tortillas", "Slaw, salsa, cheese"],
      steps: ["Cook lentils with taco spice + a little walnut for 'meaty' texture.", "Pile into tortillas with toppings."],
      booster: "cheese", note: "Meaty taco texture, no meat cost, 14g fiber.",
    },
    {
      id: "egg-roll-bowl", name: "Egg Roll in a Bowl", emoji: "🥬",
      category: "dinner", gear: "cook", servings: 4,
      protein: 28, fiber: 6, carbs: 18, fat: 18, calories: 360, cost: 1.30, prepMin: 18,
      tags: ["high-protein", "low-carb-ish", "fast", "one-pan"],
      ingredients: ["Ground pork/turkey", "Bag of coleslaw mix", "Garlic, ginger, soy, sesame", "Sriracha"],
      steps: ["Brown the meat.", "Add slaw mix + sauce; stir-fry until tender.", "Top with sriracha + sesame."],
      booster: "oil", note: "Takeout-flavor, low-effort, high-protein, cabbage-cheap.",
    },
    {
      id: "shakshuka-green", name: "Green Shakshuka", emoji: "🥬",
      category: "breakfast", gear: "cook", servings: 3,
      protein: 20, fiber: 8, carbs: 20, fat: 18, calories: 320, cost: 1.10, prepMin: 18,
      tags: ["vegetarian", "high-protein", "one-pan"],
      ingredients: ["Lots of greens (spinach/kale)", "White beans", "Eggs", "Garlic, cumin, feta"],
      steps: ["Wilt greens with garlic + beans.", "Make wells, add eggs, cover till set.", "Feta on top."],
      booster: "cheese", note: "A green twist on shakshuka — fiber + protein, any meal.",
    },
    {
      id: "dan-rice-porridge", name: "Savory Chicken Rice Porridge", emoji: "🍚",
      category: "dinner", gear: "cook", servings: 5,
      protein: 22, fiber: 3, carbs: 46, fat: 8, calories: 340, cost: 0.90, prepMin: 45, batch: true,
      tags: ["cheap", "gentle", "freezes", "one-pot"],
      ingredients: ["Rice + lots of stock", "Shredded chicken", "Ginger, scallion, soy", "Egg optional"],
      steps: ["Simmer rice in stock until creamy.", "Add chicken + ginger.", "Top with scallion + soy."],
      booster: "oil", note: "Comfort food that's easy to eat on a low-appetite day.",
    },
    {
      id: "chickpea-shawarma-bowl", name: "Chickpea Shawarma Bowl", emoji: "🥙",
      category: "lunch", gear: "cook", servings: 3,
      protein: 18, fiber: 12, carbs: 46, fat: 16, calories: 440, cost: 1.10, prepMin: 25, batch: true,
      tags: ["vegetarian", "high-fiber", "meal-prep"],
      ingredients: ["Chickpeas roasted in shawarma spice", "Rice/pita", "Cucumber-tomato salad", "Garlic-yogurt sauce"],
      steps: ["Roast spiced chickpeas crispy.", "Build bowls with grain, salad, sauce."],
      booster: "oil", note: "Meal-preps for the week; bright, spiced, high-fiber.",
    },
    {
      id: "tofu-scramble-burrito", name: "Freezer Tofu Breakfast Burritos", emoji: "🌯",
      category: "breakfast", gear: "cook", servings: 8,
      protein: 20, fiber: 8, carbs: 38, fat: 14, calories: 360, cost: 0.90, prepMin: 35, batch: true,
      tags: ["vegetarian", "freezes", "make-ahead"],
      ingredients: ["Tofu scramble (turmeric, garlic)", "Beans", "Potato, pepper", "Tortillas, salsa"],
      steps: ["Make a big tofu scramble + beans.", "Fill + wrap + freeze 8 burritos.", "Microwave from frozen."],
      booster: "oil", note: "Plant-based grab-and-reheat breakfasts for the whole week.",
    },
    {
      id: "white-chicken-chili", name: "White Chicken Chili", emoji: "🌽",
      category: "dinner", gear: "cook", servings: 6,
      protein: 30, fiber: 10, carbs: 38, fat: 14, calories: 420, cost: 1.40, prepMin: 35, batch: true,
      tags: ["high-protein", "freezes", "one-pot"],
      ingredients: ["Chicken", "White beans", "Green chili/salsa verde", "Cumin, corn", "Yogurt to finish"],
      steps: ["Simmer chicken with beans + salsa verde + cumin.", "Shred chicken; stir in corn + yogurt."],
      booster: "cheese", note: "Creamy, protein-packed, freezes in portions.",
    },
    {
      id: "veggie-pakora-snack", name: "Spiced Chickpea Fritters", emoji: "🧆",
      category: "snack", gear: "cook", servings: 4,
      protein: 10, fiber: 8, carbs: 30, fat: 10, calories: 250, cost: 0.70, prepMin: 25, batch: true,
      tags: ["vegetarian", "high-fiber"],
      ingredients: ["Chickpea flour batter", "Onion, spinach, spices", "Pan-fried in a little oil"],
      steps: ["Mix veg into spiced chickpea batter.", "Pan-fry small fritters.", "Dip in yogurt sauce."],
      booster: "oil", note: "Crispy, savory, high-fiber snack that batches well.",
    },
    {
      id: "salmon-patties", name: "Canned Salmon Patties", emoji: "🐟",
      category: "dinner", gear: "cook", servings: 4,
      protein: 26, fiber: 3, carbs: 22, fat: 16, calories: 360, cost: 1.40, prepMin: 20,
      tags: ["high-protein", "omega-3", "cheap"],
      ingredients: ["2 cans salmon", "Egg + breadcrumb binder", "Onion, herbs, lemon", "Pan-fried"],
      steps: ["Mix salmon with binder + aromatics.", "Form patties; pan-fry.", "Serve with salad or rice."],
      booster: "oil", note: "Cheap omega-3 protein; great hot or in a next-day sandwich.",
    },
    {
      id: "miso-glazed-tofu", name: "Miso-Glazed Tofu & Rice", emoji: "🍱",
      category: "dinner", gear: "cook", servings: 3,
      protein: 22, fiber: 6, carbs: 52, fat: 14, calories: 460, cost: 1.20, prepMin: 25,
      tags: ["vegetarian", "high-protein", "meal-prep"],
      ingredients: ["Tofu slabs", "Miso + honey + soy glaze", "Rice", "Steamed greens"],
      steps: ["Glaze + roast tofu until sticky.", "Serve over rice with greens."],
      booster: "oil", note: "Sticky-savory tofu that meal-preps beautifully.",
    },
    {
      id: "loaded-sweet-potato", name: "Loaded Sweet Potato + Black Beans", emoji: "🍠",
      category: "dinner", gear: "cook", servings: 2,
      protein: 16, fiber: 14, carbs: 60, fat: 12, calories: 420, cost: 0.90, prepMin: 20,
      tags: ["cheap", "vegetarian", "high-fiber"],
      ingredients: ["Sweet potatoes", "Black beans + cumin", "Yogurt-lime drizzle", "Cheese, scallion"],
      steps: ["Bake/microwave sweet potatoes.", "Load with spiced beans, yogurt, cheese."],
      booster: "cheese", note: "14g fiber, naturally sweet, deeply cheap.",
    },
    {
      id: "protein-overnight-weetabix", name: "Protein Weetabix/Oat Mush", emoji: "🥣",
      category: "breakfast", gear: "floor", servings: 1,
      protein: 30, fiber: 8, carbs: 50, fat: 10, calories: 430, cost: 0.90, prepMin: 3,
      tags: ["no-cook", "fast", "high-protein"],
      ingredients: ["Weetabix/shredded wheat", "Warm milk + 1 scoop protein", "Banana, PB, honey"],
      steps: ["Soak biscuits in protein-milk.", "Top with banana + PB."],
      booster: "pb", note: "Pantry-cheap, 30g protein, ready in 3 minutes.",
    },
    {
      id: "tuna-stuffed-peppers", name: "Tuna-Stuffed Peppers (no-cook)", emoji: "🫑",
      category: "lunch", gear: "floor", servings: 2,
      protein: 26, fiber: 5, carbs: 16, fat: 12, calories: 280, cost: 1.30, prepMin: 6,
      tags: ["no-cook", "high-protein", "low-carb"],
      ingredients: ["2 cans tuna + Greek yogurt", "Bell peppers (halved)", "Sweetcorn, herbs, lemon"],
      steps: ["Mix tuna with yogurt + corn.", "Spoon into pepper halves."],
      booster: "oil", note: "Crunchy, 26g protein, zero cooking — desk-lunch friendly.",
    },
    {
      id: "choc-protein-oatbar", name: "No-Bake Oat Protein Bars", emoji: "🍫",
      category: "snack", gear: "floor", servings: 10,
      protein: 12, fiber: 4, carbs: 22, fat: 10, calories: 220, cost: 0.45, prepMin: 15, batch: true,
      tags: ["no-cook", "make-ahead", "dense-calories", "sweet"],
      ingredients: ["Oats + protein powder", "Peanut butter + honey", "Dark chocolate chips"],
      steps: ["Mix into a stiff dough.", "Press into a pan; chill.", "Cut into bars — your homemade protein bar."],
      booster: "pb", note: "Cheaper + better than store protein bars; dense gain-fuel.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "egg-roll-bowl": [{ source: "Budget Bytes", title: "Egg roll in a bowl", url: "https://www.budgetbytes.com/?s=egg+roll+bowl" }],
    "white-chicken-chili": [{ source: "Budget Bytes", title: "White chicken chili", url: "https://www.budgetbytes.com/?s=white+chicken+chili" }],
    "lentil-tacos": [{ source: "Budget Bytes", title: "Lentil tacos", url: "https://www.budgetbytes.com/?s=lentil+tacos" }],
    "salmon-patties": [{ source: "Budget Bytes", title: "Salmon patties/cakes", url: "https://www.budgetbytes.com/?s=salmon+cakes" }],
    "loaded-sweet-potato": [{ source: "Budget Bytes", title: "Loaded sweet potato", url: "https://www.budgetbytes.com/?s=loaded+sweet+potato" }],
    "chickpea-shawarma-bowl": [{ source: "The Mediterranean Dish", title: "Chickpea shawarma", url: "https://www.themediterraneandish.com/?s=chickpea+shawarma" }],
  });
})(window.Anchor = window.Anchor || {});
