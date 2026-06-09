/* ============================================================================
 * Anchor — library5.js
 * Final content pack: more globally-varied recipes, more cheap foods, more
 * flavor + FAQ, and a gentle (streak-free) milestones system. Loaded last
 * among the data packs, after library4.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  /* ----------------------------------------------------------- MEALS */
  var MORE = [
    {
      id: "okonomiyaki", name: "Cabbage Egg Pancake (Okonomiyaki-ish)", emoji: "🥞",
      category: "dinner", gear: "cook", servings: 2,
      protein: 20, fiber: 6, carbs: 30, fat: 16, calories: 380, cost: 0.90, prepMin: 20,
      tags: ["cheap", "vegetarian", "veg-forward"],
      ingredients: ["Half a cabbage, shredded", "3 eggs + a little flour", "Scallion", "Soy + sriracha-mayo drizzle"],
      steps: ["Mix cabbage into egg+flour batter.", "Fry like a thick pancake, both sides.", "Drizzle sauces on top."],
      booster: "oil", note: "Turns cheap cabbage + eggs into a savory, satisfying dinner.",
    },
    {
      id: "ful-medames", name: "Ful Medames (Stewed Fava/Beans)", emoji: "🫘",
      category: "breakfast", gear: "cook", servings: 3,
      protein: 18, fiber: 14, carbs: 40, fat: 12, calories: 360, cost: 0.70, prepMin: 15,
      tags: ["cheap", "vegetarian", "high-fiber", "mediterranean"],
      ingredients: ["2 cans fava or white beans", "Garlic, cumin, lemon", "Olive oil", "Tomato, parsley, pita/egg"],
      steps: ["Warm beans with garlic + cumin, mash some.", "Top with lemon, oil, tomato, parsley.", "Great with an egg + pita."],
      booster: "oil", note: "An ancient cheap high-protein breakfast; keeps you full for hours.",
    },
    {
      id: "congee", name: "Savory Rice Congee + Egg", emoji: "🍚",
      category: "breakfast", gear: "cook", servings: 4,
      protein: 14, fiber: 3, carbs: 48, fat: 8, calories: 300, cost: 0.50, prepMin: 40, batch: true,
      tags: ["cheap", "warm", "gentle", "no-appetite-friendly"],
      ingredients: ["Rice simmered in lots of stock", "Ginger, scallion", "Soft/century egg", "Soy, sesame, leftover protein"],
      steps: ["Simmer rice in 6× water/stock until porridge-y.", "Top with egg, ginger, scallion, soy."],
      booster: "oil", note: "Gentle on a low-appetite morning; cheap and comforting.",
    },
    {
      id: "harira", name: "Harira (Chickpea-Lentil Soup)", emoji: "🍲",
      category: "dinner", gear: "cook", servings: 6,
      protein: 18, fiber: 14, carbs: 48, fat: 8, calories: 360, cost: 0.85, prepMin: 40, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["Lentils + chickpeas", "Tomato, onion, celery", "Cumin, ginger, cinnamon, turmeric", "Cilantro, lemon"],
      steps: ["Build a spiced tomato base.", "Add lentils, chickpeas, water; simmer 30 min.", "Finish with herbs + lemon."],
      booster: "oil", note: "Moroccan soup — huge fiber, deeply spiced, pennies a bowl.",
    },
    {
      id: "tofu-katsu", name: "Crispy Tofu Katsu Curry", emoji: "🍛",
      category: "dinner", gear: "cook", servings: 3,
      protein: 24, fiber: 7, carbs: 56, fat: 18, calories: 510, cost: 1.40, prepMin: 30,
      tags: ["vegetarian", "high-protein", "weekend"],
      ingredients: ["Tofu, breaded + pan-crisped", "Japanese curry roux (or DIY)", "Rice", "Frozen veg"],
      steps: ["Bread + crisp tofu slabs.", "Make curry sauce with veg.", "Serve tofu over rice + curry."],
      booster: "oil", note: "A fun cook-day project; crispy-saucy-satisfying.",
    },
    {
      id: "bean-burger", name: "Black Bean Burgers (batch)", emoji: "🍔",
      category: "dinner", gear: "cook", servings: 6,
      protein: 18, fiber: 12, carbs: 40, fat: 12, calories: 380, cost: 1.00, prepMin: 30, batch: true,
      tags: ["cheap", "vegetarian", "freezes", "high-fiber"],
      ingredients: ["2 cans black beans (mashed)", "Oats/breadcrumb + egg", "Onion, garlic, cumin, smoked paprika", "Buns + toppings"],
      steps: ["Mash beans with binder + spices.", "Form patties; pan-fry or bake.", "Freeze extras between parchment."],
      booster: "cheese", note: "Batch a stack, freeze, and a 'burger night' is 5 minutes away.",
    },
    {
      id: "soba-peanut", name: "Cold Peanut Soba Bowl", emoji: "🥗",
      category: "lunch", gear: "cook", servings: 2,
      protein: 20, fiber: 8, carbs: 56, fat: 18, calories: 480, cost: 1.30, prepMin: 15,
      tags: ["make-ahead", "dense-calories"],
      ingredients: ["Soba/whole-wheat noodles", "Peanut sauce", "Edamame", "Cucumber, carrot, scallion"],
      steps: ["Cook + cool noodles.", "Toss with peanut sauce + edamame + veg.", "Keeps great for next-day lunch."],
      booster: "pb", note: "Cold, dense, protein-y — a meal-prep lunch you look forward to.",
    },
    {
      id: "stuffed-peppers", name: "Stuffed Peppers (batch)", emoji: "🫑",
      category: "dinner", gear: "cook", servings: 6,
      protein: 24, fiber: 10, carbs: 44, fat: 14, calories: 440, cost: 1.40, prepMin: 55, batch: true,
      tags: ["high-protein", "freezes", "meal-prep"],
      ingredients: ["6 peppers", "Ground turkey + beans + rice filling", "Tomato, spices", "Cheese on top"],
      steps: ["Mix filling, stuff peppers.", "Bake 190°C/375°F ~40 min.", "Freeze individually."],
      booster: "cheese", note: "Pretty, portioned, freezable — a meal-prep classic.",
    },
    {
      id: "kimchi-tofu-stew", name: "Kimchi Tofu Stew", emoji: "🌶️",
      category: "dinner", gear: "cook", servings: 3,
      protein: 22, fiber: 6, carbs: 24, fat: 14, calories: 330, cost: 1.20, prepMin: 20,
      tags: ["spicy", "warm", "one-pot", "fast"],
      ingredients: ["Kimchi", "Block of tofu", "Stock + gochugaru/soy", "Egg, scallion", "Rice to serve"],
      steps: ["Sizzle kimchi, add stock.", "Add tofu cubes; simmer.", "Crack in an egg; serve with rice."],
      booster: "oil", note: "Punchy, warming, gut-friendly, fast. Great cold-day dinner.",
    },
    {
      id: "tinned-fish-pasta", name: "Tinned Fish & Tomato Pasta", emoji: "🍝",
      category: "dinner", gear: "cook", servings: 3,
      protein: 26, fiber: 7, carbs: 60, fat: 14, calories: 500, cost: 1.30, prepMin: 18,
      tags: ["cheap", "high-protein", "pantry", "fast"],
      ingredients: ["Pasta", "1–2 tins sardines/mackerel/tuna", "Garlic, chili, tomato", "Lemon, parsley"],
      steps: ["Make a quick garlic-tomato sauce.", "Flake in tinned fish.", "Toss with pasta + lemon."],
      booster: "oil", note: "Cheap omega-3 protein, pantry-stable, 18 minutes.",
    },
    {
      id: "protein-fluff", name: "Protein Mug Cake", emoji: "🍫",
      category: "snack", gear: "cook", servings: 1,
      protein: 24, fiber: 4, carbs: 28, fat: 8, calories: 280, cost: 0.80, prepMin: 3,
      tags: ["fast", "sweet", "high-protein"],
      ingredients: ["1 scoop protein + 1 tbsp flour/oat flour", "Cocoa, baking powder", "Milk + egg", "Microwave 60–90s"],
      steps: ["Mix in a mug.", "Microwave ~75s.", "Warm chocolate cake, 24g protein."],
      booster: "pb", note: "Dessert craving → 24g protein in 3 minutes. Beats candy.",
    },
    {
      id: "miso-soup-tofu-snack", name: "Quick Miso Soup + Tofu", emoji: "🍵",
      category: "snack", gear: "cook", servings: 1,
      protein: 12, fiber: 2, carbs: 8, fat: 5, calories: 120, cost: 0.70, prepMin: 4,
      tags: ["warm", "light", "no-appetite-friendly"],
      ingredients: ["Miso paste", "Hot water", "Cubed tofu", "Scallion, seaweed"],
      steps: ["Whisk miso into hot (not boiling) water.", "Add tofu + scallion."],
      booster: "oil", note: "Warm, salty, gentle — coaxes appetite when nothing sounds good.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  Object.assign(Anchor.recipeLinks, {
    "okonomiyaki": [{ source: "Serious Eats", title: "Okonomiyaki", url: "https://www.seriouseats.com/search?q=okonomiyaki" }],
    "ful-medames": [{ source: "The Mediterranean Dish", title: "Ful medames", url: "https://www.themediterraneandish.com/?s=ful+medames" }],
    "harira": [{ source: "The Mediterranean Dish", title: "Harira soup", url: "https://www.themediterraneandish.com/?s=harira" }],
    "bean-burger": [{ source: "Budget Bytes", title: "Black bean burgers", url: "https://www.budgetbytes.com/?s=black+bean+burger" }],
    "stuffed-peppers": [{ source: "Budget Bytes", title: "Stuffed peppers", url: "https://www.budgetbytes.com/?s=stuffed+peppers" }],
    "tinned-fish-pasta": [{ source: "BBC Good Food", title: "Sardine/tuna pasta", url: "https://www.bbcgoodfood.com/search?q=sardine%20pasta" }],
    "soba-peanut": [{ source: "Budget Bytes", title: "Peanut noodles", url: "https://www.budgetbytes.com/?s=peanut+noodles" }],
    "kimchi-tofu-stew": [{ source: "Serious Eats", title: "Kimchi jjigae", url: "https://www.seriouseats.com/search?q=kimchi%20stew" }],
  });

  /* ----------------------------------------------------------- FOODS */
  Array.prototype.push.apply(Anchor.foods, [
    { name: "Kidney beans (canned)", emoji: "🫘", group: "protein", serve: "1 cup", protein: 13, fiber: 11, cal: 215, cost: 0.55 },
    { name: "Pinto beans (dried)", emoji: "🫘", group: "protein", serve: "1 cup cooked", protein: 15, fiber: 15, cal: 245, cost: 0.28 },
    { name: "Peanuts", emoji: "🥜", group: "fat", serve: "1 oz", protein: 7, fiber: 2, cal: 160, cost: 0.20 },
    { name: "Mackerel (tinned)", emoji: "🐟", group: "protein", serve: "1 tin", protein: 20, fiber: 0, cal: 230, cost: 1.10 },
    { name: "Lentil pasta", emoji: "🍝", group: "grain", serve: "2 oz dry", protein: 13, fiber: 6, cal: 190, cost: 0.65 },
    { name: "Barley", emoji: "🌾", group: "grain", serve: "1 cup cooked", protein: 4, fiber: 6, cal: 193, cost: 0.20 },
    { name: "Pumpkin seeds", emoji: "🎃", group: "fat", serve: "1 oz", protein: 9, fiber: 2, cal: 160, cost: 0.40 },
    { name: "Kefir", emoji: "🥛", group: "dairy", serve: "1 cup", protein: 9, fiber: 0, cal: 110, cost: 0.70 },
    { name: "Frozen spinach", emoji: "🥬", group: "veg", serve: "1 cup", protein: 5, fiber: 4, cal: 65, cost: 0.30 },
    { name: "Beets", emoji: "🟣", group: "veg", serve: "1 cup", protein: 2, fiber: 4, cal: 60, cost: 0.30 },
    { name: "Dates", emoji: "🌴", group: "fruit", serve: "2 dates", protein: 1, fiber: 3, cal: 110, cost: 0.40 },
    { name: "Pear", emoji: "🍐", group: "fruit", serve: "1 medium", protein: 1, fiber: 6, cal: 100, cost: 0.55 },
  ]);

  /* ----------------------------------------------------------- FLAVOR */
  Array.prototype.push.apply(Anchor.flavor.sauces, [
    { name: "Gochujang glaze", emoji: "🌶️", mix: "gochujang + soy + honey + garlic + sesame", on: "Tofu, chicken, rice bowls, eggs." },
    { name: "Lemon-herb yogurt", emoji: "🍋", mix: "yogurt + lemon + dill/mint + garlic", on: "Falafel bowls, fish, roast veg." },
  ]);

  /* ----------------------------------------------------------- FAQ */
  Array.prototype.push.apply(Anchor.faq, [
    { q: "What if I genuinely can't afford much this week?", a: "Drop to the rock-bottom tier: dried lentils/beans, eggs, oats, rice, frozen veg, a whole chicken, peanut butter. That's ~$5–6/day and still high-protein. The Cheap Food Index ranks everything by protein-per-dollar." },
    { q: "I want it to taste different without buying new stuff.", a: "Same base, new spice blend or sauce from the Flavor Lab. A pot of lentils + taco spice, then curry spice, then Italian herbs = three totally different meals, zero new groceries." },
  ]);

  /* --------------------------------------------------- MILESTONES (streak-free) */
  Anchor.milestones = [
    { id: "first-cook", emoji: "🍳", title: "First batch cooked", test: function (s) { return Object.values(s.logs || {}).some(function (l) { return l.meals >= 1; }); }, blurb: "You started. That's the hardest part." },
    { id: "leftover-loop", emoji: "♻️", title: "Ran the leftover loop", test: function (s) { return countLoggedDays(s) >= 2; }, blurb: "Cooked once, ate it again. The engine is running." },
    { id: "week-strong", emoji: "💪", title: "5 good days in a window", test: function (s) { return goodDays(s) >= 5; }, blurb: "5 days hitting 3+ meals. A winning week — no perfection required." },
    { id: "hydrated", emoji: "💧", title: "Hit a water goal", test: function (s) { return Object.entries(s.water || {}).some(function (e) { return e[1] >= (s.waterGoal || 8); }); }, blurb: "Fed and watered. Energy follows." },
    { id: "weighed-in", emoji: "⚖️", title: "Logged 2 weeks of weight", test: function (s) { return (s.weights || []).length >= 2; }, blurb: "Now you can see if the surplus is working." },
    { id: "stocked", emoji: "🥫", title: "Floor shelf stocked", test: function (s) { return (s.pantry || []).filter(function (p) { return p.qty >= p.target; }).length >= 6; }, blurb: "Depleted-you is covered. Cheap insurance, banked." },
  ];
  function countLoggedDays(s) { return Object.keys(s.logs || {}).filter(function (k) { return s.logs[k].meals >= 1; }).length; }
  function goodDays(s) { return Object.keys(s.logs || {}).filter(function (k) { return s.logs[k].meals >= 3; }).length; }

  Anchor.earnedMilestones = function () {
    var s = Anchor.store.get();
    return Anchor.milestones.map(function (m) {
      var earned = false;
      try { earned = !!m.test(s); } catch (e) { earned = false; }
      return { id: m.id, emoji: m.emoji, title: m.title, blurb: m.blurb, earned: earned };
    });
  };
})(window.Anchor = window.Anchor || {});
