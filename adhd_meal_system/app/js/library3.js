/* ============================================================================
 * Anchor — library3.js
 * Third content pack. More recipes spanning cuisines + budgets so the rotation
 * never goes stale, plus more trusted deep-links. Loaded after library2.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var MORE = [
    /* ---------- hearty cheap dinners ---------- */
    {
      id: "jambalaya-beans", name: "Bean & Sausage Jambalaya", emoji: "🍤",
      category: "dinner", gear: "cook", servings: 6,
      protein: 26, fiber: 11, carbs: 62, fat: 16, calories: 520, cost: 1.40, prepMin: 40, batch: true,
      tags: ["cheap", "one-pot", "freezes", "spicy"],
      ingredients: ["2 sausages, sliced", "1 can red beans", "Rice", "Onion, pepper, celery, garlic", "Cajun spice, tomato", "Stock"],
      steps: ["Brown sausage + the veg trinity.", "Add rice, beans, tomato, cajun spice, stock.", "Cover, simmer ~20 min until rice cooks."],
      booster: "oil", note: "Big spicy one-pot; a little sausage flavors a whole tray.",
    },
    {
      id: "mapo-tofu", name: "Mapo-ish Tofu & Pork", emoji: "🌶️",
      category: "dinner", gear: "cook", servings: 4,
      protein: 28, fiber: 5, carbs: 36, fat: 20, calories: 470, cost: 1.60, prepMin: 25,
      tags: ["high-protein", "spicy", "fast"],
      ingredients: ["Block of tofu", "1/2 lb ground pork or turkey", "Garlic, ginger, scallion", "Chili-bean paste / sriracha + soy", "Rice, cornstarch slurry"],
      steps: ["Brown the pork.", "Add aromatics + chili paste.", "Add cubed tofu + a little water; simmer.", "Thicken with slurry; serve over rice."],
      booster: "oil", note: "Silky, spicy, protein-dense — restaurant flavor at home.",
    },
    {
      id: "ratatouille-beans", name: "Ratatouille + White Beans", emoji: "🍆",
      category: "dinner", gear: "cook", servings: 5,
      protein: 16, fiber: 14, carbs: 42, fat: 12, calories: 360, cost: 1.20, prepMin: 40, batch: true,
      tags: ["vegetarian", "high-fiber", "freezes", "veg-forward"],
      ingredients: ["Eggplant, zucchini, pepper, onion", "1 can white beans", "1 can tomatoes", "Garlic, herbs, olive oil"],
      steps: ["Roast or sauté the veg until soft.", "Add tomato + beans, simmer to meld.", "Great over rice, pasta, or with an egg on top."],
      booster: "cheese", note: "Veg-heavy fiber bomb; beans make it a meal.",
    },
    {
      id: "dan-dan-ish-noodles", name: "Peanut Sesame Noodles", emoji: "🍜",
      category: "dinner", gear: "cook", servings: 3,
      protein: 22, fiber: 7, carbs: 58, fat: 20, calories: 520, cost: 1.30, prepMin: 18,
      tags: ["cheap", "dense-calories", "fast"],
      ingredients: ["Noodles/spaghetti", "Peanut butter + soy + vinegar + chili + garlic", "Ground turkey or tofu crumbles", "Cucumber/scallion"],
      steps: ["Cook noodles.", "Brown the protein.", "Toss noodles in peanut sauce + protein.", "Top with cucumber + scallion."],
      booster: "pb", note: "Dense, savory, gain-friendly. Eat hot or cold.",
    },
    {
      id: "enchilada-bake", name: "Black Bean Enchilada Bake", emoji: "🌮",
      category: "dinner", gear: "cook", servings: 6,
      protein: 24, fiber: 14, carbs: 54, fat: 16, calories: 480, cost: 1.30, prepMin: 40, batch: true,
      tags: ["cheap", "vegetarian", "freezes", "high-fiber"],
      ingredients: ["Tortillas, torn", "2 cans black beans", "Enchilada/salsa sauce", "Corn, cheese", "Cumin, chili"],
      steps: ["Layer torn tortillas, beans, sauce, corn, cheese.", "Repeat; top with cheese.", "Bake 190°C/375°F ~30 min."],
      booster: "cheese", note: "Casserole comfort, big batch, freezes in slabs.",
    },
    {
      id: "miso-salmon-bowl", name: "Miso Salmon & Greens", emoji: "🍱",
      category: "dinner", gear: "cook", servings: 2,
      protein: 34, fiber: 6, carbs: 44, fat: 18, calories: 500, cost: 2.20, prepMin: 18,
      tags: ["high-protein", "omega-3"],
      ingredients: ["Canned or cheap salmon fillet", "Miso + honey + soy glaze", "Rice", "Greens (bok choy/cabbage)"],
      steps: ["Glaze + roast/pan the salmon.", "Wilt greens.", "Serve over rice."],
      booster: "oil", note: "When you want something that feels 'nice' — still cheap-ish.",
    },
    {
      id: "greek-bowl", name: "Greek Chicken & Chickpea Bowl", emoji: "🥙",
      category: "dinner", gear: "cook", servings: 4,
      protein: 36, fiber: 11, carbs: 40, fat: 16, calories: 480, cost: 1.70, prepMin: 25, batch: true,
      tags: ["high-protein", "meal-prep", "mediterranean"],
      ingredients: ["Chicken thighs, oregano-lemon marinade", "1 can chickpeas", "Cucumber-tomato salad", "Yogurt-garlic sauce", "Rice or pita"],
      steps: ["Sear marinated chicken.", "Warm chickpeas.", "Build bowls with salad + yogurt sauce."],
      booster: "oil", note: "Meal-preps beautifully; bright and high-protein.",
    },

    /* ---------- breakfasts ---------- */
    {
      id: "shakshuka-leftover", name: "Beans on Toast, Upgraded", emoji: "🍞",
      category: "breakfast", gear: "cook", servings: 1,
      protein: 22, fiber: 12, carbs: 46, fat: 12, calories: 400, cost: 0.70, prepMin: 8,
      tags: ["cheap", "high-fiber", "fast"],
      ingredients: ["1 can beans (white/baked)", "Whole-grain toast", "1 egg", "Smoked paprika, cheese, hot sauce"],
      steps: ["Warm beans with paprika.", "Pile on toast with a fried egg + cheese."],
      booster: "cheese", note: "British classic, upgraded with egg + fiber. Pennies.",
    },
    {
      id: "yogurt-granola-jar", name: "Make-Ahead Yogurt Jars", emoji: "🫙",
      category: "breakfast", gear: "floor", servings: 4,
      protein: 26, fiber: 6, carbs: 40, fat: 10, calories: 360, cost: 1.00, prepMin: 10, batch: true,
      tags: ["no-cook", "make-ahead", "grab-and-go"],
      ingredients: ["Greek yogurt (big tub)", "Granola (kept separate)", "Frozen berries", "Honey, chia"],
      steps: ["Layer yogurt + berries + chia in 4 jars.", "Granola on top just before eating.", "Grab one on the way out."],
      booster: "nuts", note: "Assembly-line 4 breakfasts in 10 minutes.",
    },

    /* ---------- lunches ---------- */
    {
      id: "soup-and-grilled-cheese", name: "Tomato Soup + Protein Grilled Cheese", emoji: "🥪",
      category: "lunch", gear: "cook", servings: 1,
      protein: 26, fiber: 6, carbs: 40, fat: 22, calories: 500, cost: 1.20, prepMin: 12,
      tags: ["comfort", "warm"],
      ingredients: ["Canned tomato soup (+ a scoop of white beans, blended in)", "Whole-grain bread", "Plenty of cheese"],
      steps: ["Blend a few beans into the soup for protein.", "Grill a cheesy sandwich.", "Dip + enjoy."],
      booster: "cheese", note: "Childhood comfort with a stealth protein boost.",
    },
    {
      id: "falafel-bowl", name: "Crispy Chickpea Bowl", emoji: "🧆",
      category: "lunch", gear: "cook", servings: 2,
      protein: 18, fiber: 13, carbs: 48, fat: 16, calories: 440, cost: 1.10, prepMin: 20,
      tags: ["vegetarian", "high-fiber"],
      ingredients: ["2 cans chickpeas (roasted crispy with spices)", "Rice or pita", "Cucumber-tomato salad", "Tahini-lemon sauce"],
      steps: ["Toss chickpeas in oil + cumin/paprika, roast crispy.", "Build a bowl with grain, salad, tahini."],
      booster: "oil", note: "Falafel vibes without the deep-fry. 13g fiber.",
    },

    /* ---------- snacks ---------- */
    {
      id: "savory-cottage-bowl", name: "Cottage Cheese + Tomato + Oil", emoji: "🍅",
      category: "snack", gear: "floor", servings: 1,
      protein: 24, fiber: 2, carbs: 10, fat: 10, calories: 220, cost: 0.80, prepMin: 2,
      tags: ["no-cook", "high-protein"],
      ingredients: ["Cottage cheese", "Cherry tomatoes", "Olive oil, salt, pepper, herbs"],
      steps: ["Spoon cottage cheese.", "Top with tomato, oil, seasoning."],
      booster: "oil", note: "Savory 24g-protein snack that feels like a tiny meal.",
    },
    {
      id: "dark-choc-nuts", name: "Dark Chocolate + Almonds", emoji: "🍫",
      category: "snack", gear: "floor", servings: 1,
      protein: 6, fiber: 5, carbs: 16, fat: 18, calories: 250, cost: 0.60, prepMin: 0,
      tags: ["no-cook", "sweet", "dense-calories"],
      ingredients: ["A few squares dark chocolate", "Handful almonds"],
      steps: ["Eat together."],
      booster: "nuts", note: "Sweet craving + dense calories, with fiber and good fats.",
    },
    {
      id: "protein-iced-coffee", name: "Protein Iced Coffee", emoji: "☕",
      category: "snack", gear: "floor", servings: 1,
      protein: 25, fiber: 0, carbs: 12, fat: 6, calories: 200, cost: 0.80, prepMin: 2,
      tags: ["no-cook", "liquid-calories", "high-protein"],
      ingredients: ["Cold brew or cooled coffee", "Milk + 1 scoop protein (vanilla)", "Ice"],
      steps: ["Shake protein with milk + coffee.", "Pour over ice."],
      booster: "milk", note: "Caffeine + 25g protein in one cup — easy calories when appetite is low.",
    },
    {
      id: "rice-cake-stack", name: "Rice Cakes + Cottage Cheese + Honey", emoji: "🍘",
      category: "snack", gear: "floor", servings: 1,
      protein: 16, fiber: 2, carbs: 30, fat: 4, calories: 220, cost: 0.70, prepMin: 2,
      tags: ["no-cook", "fast"],
      ingredients: ["Rice cakes", "Cottage cheese", "Honey, cinnamon"],
      steps: ["Spread cottage cheese on rice cakes.", "Drizzle honey + cinnamon."],
      booster: "honey", note: "Crunchy-sweet-protein in under two minutes.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "greek-bowl": [{ source: "The Mediterranean Dish", title: "Greek chicken bowls", url: "https://www.themediterraneandish.com/?s=greek+chicken+bowl" }],
    "enchilada-bake": [{ source: "Budget Bytes", title: "Enchilada bake / casserole", url: "https://www.budgetbytes.com/?s=enchilada" }],
    "falafel-bowl": [{ source: "Budget Bytes", title: "Crispy chickpeas", url: "https://www.budgetbytes.com/?s=crispy+chickpeas" }],
    "dan-dan-ish-noodles": [{ source: "Serious Eats", title: "Sesame/peanut noodles", url: "https://www.seriouseats.com/search?q=sesame%20noodles" }],
    "mapo-tofu": [{ source: "Serious Eats", title: "Mapo tofu", url: "https://www.seriouseats.com/search?q=mapo%20tofu" }],
    "jambalaya-beans": [{ source: "Budget Bytes", title: "Jambalaya", url: "https://www.budgetbytes.com/?s=jambalaya" }],
    "ratatouille-beans": [{ source: "BBC Good Food", title: "Ratatouille", url: "https://www.bbcgoodfood.com/search?q=ratatouille" }],
  });
})(window.Anchor = window.Anchor || {});
