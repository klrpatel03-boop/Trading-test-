/* ============================================================================
 * Anchor — library2.js
 * Second content pack: more recipes (variety is the novelty an ADHD brain
 * craves — without re-deciding the system), more trusted deep-links, and
 * extra flavor/FAQ/glossary content. Loaded after cookbooks.js.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  /* ---------------------------------------------------------------- MEALS */
  var MORE = [
    /* dinners */
    {
      id: "tortilla-pizza", name: "High-Protein Tortilla Pizza", emoji: "🍕",
      category: "dinner", gear: "cook", servings: 2,
      protein: 34, fiber: 8, carbs: 40, fat: 18, calories: 470, cost: 1.30, prepMin: 12,
      tags: ["cheap", "fast", "kid-in-you"],
      ingredients: ["High-protein tortillas/flatbread", "Marinara", "Mozzarella", "Pre-cooked chicken or beans", "Oregano, chili flakes"],
      steps: ["Top tortilla with sauce, cheese, protein.", "Bake 220°C/425°F ~8 min until crisp.", "Slice."],
      booster: "cheese", note: "Scratches the pizza itch in 10 minutes with real protein.",
    },
    {
      id: "kidney-bean-curry", name: "Rajma (Kidney Bean Curry)", emoji: "🫘",
      category: "dinner", gear: "cook", servings: 5,
      protein: 20, fiber: 15, carbs: 52, fat: 9, calories: 390, cost: 0.90, prepMin: 35, batch: true,
      tags: ["cheap", "vegetarian", "high-fiber", "freezes", "one-pot"],
      ingredients: ["2 cans kidney beans", "1 can tomatoes", "Onion, garlic, ginger", "Garam masala, cumin, coriander", "Rice"],
      steps: ["Make a thick onion-tomato masala base.", "Add beans + water; simmer 20 min, mash some.", "Serve over rice."],
      booster: "oil", note: "North-Indian comfort food, protein + fiber, pennies a serving.",
    },
    {
      id: "salmon-rice-bowl", name: "Canned Salmon Rice Bowl", emoji: "🍣",
      category: "dinner", gear: "cook", servings: 2,
      protein: 32, fiber: 6, carbs: 50, fat: 16, calories: 480, cost: 2.00, prepMin: 12,
      tags: ["high-protein", "omega-3", "fast"],
      ingredients: ["1 can salmon", "Rice", "Frozen edamame/veg", "Soy + sriracha + mayo", "Seaweed/scallion optional"],
      steps: ["Warm rice + veg.", "Flake salmon on top.", "Drizzle spicy mayo + soy."],
      booster: "oil", note: "Cheaper omega-3 protein than fresh fish, 5-minute assembly.",
    },
    {
      id: "veggie-chili-mac", name: "Chili Mac", emoji: "🧀",
      category: "dinner", gear: "cook", servings: 5,
      protein: 26, fiber: 12, carbs: 60, fat: 16, calories: 520, cost: 1.30, prepMin: 30, batch: true,
      tags: ["cheap", "comfort", "one-pot", "freezes"],
      ingredients: ["Ground turkey or extra beans", "2 cans beans", "1 can tomatoes", "Pasta", "Cheese", "Chili spices"],
      steps: ["Brown turkey/onion.", "Add beans, tomato, spices, water + pasta.", "Simmer until pasta cooks.", "Stir in cheese."],
      booster: "cheese", note: "Comfort-food cravings, handled cheap with protein + fiber.",
    },
    {
      id: "shepherds-lentil", name: "Lentil Shepherd's Pie", emoji: "🥧",
      category: "dinner", gear: "cook", servings: 6,
      protein: 22, fiber: 15, carbs: 58, fat: 12, calories: 450, cost: 1.20, prepMin: 50, batch: true,
      tags: ["cheap", "high-fiber", "freezes", "make-ahead"],
      ingredients: ["Lentils + frozen veg in gravy", "Potatoes (mashed)", "Onion, garlic, thyme, tomato paste", "Cheese on top"],
      steps: ["Make a lentil + veg gravy base.", "Top with mashed potato + cheese.", "Bake 200°C/400°F ~25 min."],
      booster: "cheese", note: "Big tray, freezes in portions, deeply satisfying.",
    },
    {
      id: "korean-rice-bowl", name: "Bibimbap-ish Rice Bowl", emoji: "🍳",
      category: "dinner", gear: "cook", servings: 2,
      protein: 26, fiber: 8, carbs: 56, fat: 16, calories: 500, cost: 1.50, prepMin: 20,
      tags: ["customizable", "veg-forward"],
      ingredients: ["Rice", "Whatever veg, lightly fried", "Fried egg", "Leftover/tofu protein", "Gochujang or sriracha + sesame"],
      steps: ["Arrange rice + veg + protein.", "Top with fried egg.", "Sauce + sesame; mix it all up."],
      booster: "oil", note: "A 'clean out the fridge' bowl that always tastes intentional.",
    },
    {
      id: "white-bean-soup", name: "Tuscan White Bean Soup", emoji: "🍲",
      category: "dinner", gear: "cook", servings: 5,
      protein: 18, fiber: 14, carbs: 44, fat: 10, calories: 350, cost: 0.85, prepMin: 30, batch: true,
      tags: ["cheap", "high-fiber", "vegetarian", "freezes", "one-pot"],
      ingredients: ["2 cans white beans", "Carrot, celery, onion, garlic", "Kale", "Stock + rosemary", "Parmesan rind (umami)"],
      steps: ["Soften the veg base.", "Add beans + stock; simmer 20 min, mash some for body.", "Wilt in kale."],
      booster: "oil", note: "Under a dollar, freezer-friendly, comforting fiber.",
    },

    /* breakfasts */
    {
      id: "protein-pancakes", name: "Banana Protein Pancakes", emoji: "🥞",
      category: "breakfast", gear: "cook", servings: 2,
      protein: 28, fiber: 5, carbs: 44, fat: 12, calories: 400, cost: 0.90, prepMin: 12,
      tags: ["high-protein", "weekend"],
      ingredients: ["Banana + eggs", "Oats + 1 scoop protein", "Baking powder", "Cinnamon"],
      steps: ["Blend into a batter.", "Cook like pancakes.", "Top with PB + honey for gain calories."],
      booster: "pb", note: "Treat-feeling breakfast you love cooking; lands 28g protein.",
    },
    {
      id: "tofu-scramble", name: "Tofu Scramble Wrap", emoji: "🌯",
      category: "breakfast", gear: "cook", servings: 2,
      protein: 22, fiber: 7, carbs: 30, fat: 16, calories: 380, cost: 1.00, prepMin: 12,
      tags: ["vegetarian", "high-protein", "fast"],
      ingredients: ["Block of tofu, crumbled", "Turmeric, cumin, garlic, nutritional yeast", "Spinach", "Tortilla, salsa"],
      steps: ["Crumble + fry tofu with spices.", "Wilt in spinach.", "Wrap with salsa."],
      booster: "oil", note: "Eggy-savory vibe, plant-cheap protein.",
    },

    /* lunches */
    {
      id: "burrito-bowl-lunch", name: "Burrito Bowl (no-cook)", emoji: "🌯",
      category: "lunch", gear: "floor", servings: 1,
      protein: 34, fiber: 14, carbs: 52, fat: 16, calories: 500, cost: 1.40, prepMin: 4,
      tags: ["no-cook", "high-protein", "high-fiber"],
      ingredients: ["Microwave rice", "Canned black beans", "Pre-cooked chicken or extra beans", "Salsa, cheese, corn"],
      steps: ["Heat rice + beans.", "Add protein, salsa, cheese, corn.", "Done — Chipotle at home for ~$1.40."],
      booster: "cheese", note: "A fast-food bowl dupe with way better macros and cost.",
    },
    {
      id: "lentil-salad", name: "Lemon Lentil Salad", emoji: "🥗",
      category: "lunch", gear: "floor", servings: 2,
      protein: 18, fiber: 15, carbs: 40, fat: 14, calories: 380, cost: 0.90, prepMin: 6,
      tags: ["no-cook", "high-fiber", "vegetarian", "make-ahead"],
      ingredients: ["Cooked/canned lentils", "Cucumber, tomato, onion", "Feta", "Olive oil + lemon + herbs"],
      steps: ["Toss everything.", "Better after it sits — great make-ahead lunch."],
      booster: "oil", note: "15g fiber, keeps for days, gets better overnight.",
    },

    /* snacks */
    {
      id: "edamame", name: "Edamame + Sea Salt", emoji: "🫛",
      category: "snack", gear: "floor", servings: 1,
      protein: 18, fiber: 8, carbs: 14, fat: 8, calories: 200, cost: 0.60, prepMin: 3,
      tags: ["no-cook", "high-protein", "high-fiber"],
      ingredients: ["Frozen edamame (in pod)", "Sea salt"],
      steps: ["Microwave the bag.", "Salt + eat."],
      booster: "oil", note: "18g protein + 8g fiber, 3 minutes, cheap.",
    },
    {
      id: "cheese-crackers-apple", name: "Cheese, Crackers & Apple", emoji: "🧀",
      category: "snack", gear: "floor", servings: 1,
      protein: 12, fiber: 4, carbs: 28, fat: 14, calories: 290, cost: 0.80, prepMin: 1,
      tags: ["no-cook", "dense-calories"],
      ingredients: ["Cheese", "Whole-grain crackers", "Apple"],
      steps: ["Slice + assemble."],
      booster: "nuts", note: "Sweet/savory/crunchy, dense calories, zero effort.",
    },
    {
      id: "overnight-chia", name: "Chia Protein Pudding", emoji: "🍮",
      category: "snack", gear: "floor", servings: 1,
      protein: 20, fiber: 10, carbs: 24, fat: 12, calories: 300, cost: 0.90, prepMin: 3,
      tags: ["no-cook", "make-ahead", "high-fiber"],
      ingredients: ["Chia seeds", "Milk + 1 scoop protein", "Honey, berries"],
      steps: ["Stir, fridge overnight.", "Top with berries."],
      booster: "honey", note: "10g fiber, dessert feel, make a few at once.",
    },
  ];
  Array.prototype.push.apply(Anchor.meals, MORE);

  /* ---------------------------------------------------- MORE DEEP LINKS */
  Object.assign(Anchor.recipeLinks, {
    "chana-masala": [{ source: "Budget Bytes", title: "Chana Masala", url: "https://www.budgetbytes.com/?s=chana+masala" }],
    "kidney-bean-curry": [{ source: "Budget Bytes", title: "Rajma / kidney bean curry", url: "https://www.budgetbytes.com/?s=rajma" }],
    "tortilla-pizza": [{ source: "Budget Bytes", title: "Tortilla / flatbread pizza", url: "https://www.budgetbytes.com/?s=tortilla+pizza" }],
    "white-bean-soup": [{ source: "Budget Bytes", title: "Tuscan white bean soup", url: "https://www.budgetbytes.com/?s=white+bean+soup" }],
    "shepherds-lentil": [{ source: "BBC Good Food", title: "Lentil shepherd's pie", url: "https://www.bbcgoodfood.com/search?q=lentil%20shepherds%20pie" }],
    "protein-pancakes": [{ source: "EatingWell", title: "Protein pancakes", url: "https://www.eatingwell.com/search?q=protein%20pancakes" }],
    "white-bean-tuna-bake": [{ source: "BBC Good Food", title: "Tuna & bean bake", url: "https://www.bbcgoodfood.com/search?q=tuna%20bean%20bake" }],
    "tofu-peanut-stirfry": [{ source: "Budget Bytes", title: "Peanut tofu / sauce", url: "https://www.budgetbytes.com/?s=peanut+tofu" }],
    "salmon-rice-bowl": [{ source: "Budget Bytes", title: "Canned salmon ideas", url: "https://www.budgetbytes.com/?s=salmon+rice+bowl" }],
    "veggie-chili-mac": [{ source: "Budget Bytes", title: "Cheesy chili mac", url: "https://www.budgetbytes.com/cheesy-vegetarian-chili-mac/" }],
  });

  /* ---------------------------------------------------- MORE FLAVOR */
  Array.prototype.push.apply(Anchor.flavor.blends, [
    { name: "Italian herb", emoji: "🌿", mix: "2 basil · 1 oregano · 1 garlic · ½ thyme · ½ rosemary · chili flakes", on: "Pasta, beans, tomato dishes, roast veg." },
    { name: "Chinese-ish 5-spice-y", emoji: "🥡", mix: "star anise · fennel · cinnamon · clove · pepper (or buy 5-spice)", on: "Stir-fry, tofu, rice, braises." },
    { name: "Smoky BBQ rub", emoji: "🍖", mix: "2 brown sugar · 2 paprika · 1 garlic · 1 onion · ½ cumin · ½ pepper", on: "Chicken, beans, roast potatoes." },
  ]);
  Array.prototype.push.apply(Anchor.flavor.sauces, [
    { name: "Chimichurri", emoji: "🌿", mix: "parsley + garlic + olive oil + vinegar + chili", on: "Eggs, chicken, beans, potatoes. Brightens anything." },
    { name: "Honey-mustard", emoji: "🍯", mix: "mustard + honey + a splash of vinegar", on: "Chicken, salad bowls, roast veg." },
    { name: "Coconut-curry quick", emoji: "🥥", mix: "curry paste + coconut milk + lime", on: "Tofu, lentils, chicken, noodles." },
  ]);

  /* ---------------------------------------------------- MORE FAQ / GLOSSARY */
  Array.prototype.push.apply(Anchor.faq, [
    { q: "I get bored eating the same things.", a: "That's why the base stays constant and the flavor changes. A pot of lentils + the Flavor Lab = a different dinner every night. Spend novelty on spices and sauces, not on re-deciding the whole meal." },
    { q: "Cooking feels like too much some nights.", a: "Then don't — that's what the Floor gear and the Decide screen (set energy to Low) are for. Cook only when you want to; coast on leftovers and no-cook meals the rest of the time." },
    { q: "How do I not waste food / forget it exists?", a: "Use the Floor Shelf tracker, freeze leftovers in single portions, keep an 'eat-me-first' fridge spot, and buy frozen veg. Forgotten food is the real budget leak — not price per item." },
  ]);
  Array.prototype.push.apply(Anchor.glossary, [
    { term: "Tier-1 grocery", def: "The staples you buy every single week so the floor shelf never empties (marked ★ in Groceries)." },
    { term: "Maintenance calories", def: "What you burn in a day. Eat above it to gain, below to cut." },
    { term: "Activation energy", def: "The effort to START a task. ADHD's hardest part — this app keeps it near zero for eating." },
  ]);
})(window.Anchor = window.Anchor || {});
