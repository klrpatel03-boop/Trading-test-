/* ============================================================================
 * Anchor — cookbooks.js
 * Trusted, internet-backed recipe sources + real tested-recipe links mapped to
 * the meals in this system. So when you cook, you follow a vetted recipe with
 * exact quantities — not a vague paragraph. Loaded after library.js.
 *
 * Approach: where a great tested recipe exists we deep-link it. For everything
 * else we generate a SEARCH link into each trusted cookbook from the dish name
 * (search links don't rot the way deep links can).
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  /* ----------------------------------------------------------------------
   * TRUSTED COOKBOOKS — vetted, well-known, mostly free. Each has a search
   * template ("%s" is replaced by the URL-encoded dish name).
   * -------------------------------------------------------------------- */
  Anchor.cookbooks = [
    {
      id: "budgetbytes", name: "Budget Bytes", emoji: "💸",
      url: "https://www.budgetbytes.com/",
      search: "https://www.budgetbytes.com/?s=%s",
      free: true, primary: true,
      bestFor: "Cheapest-per-serving cooking",
      why: "Every recipe lists an exact cost per serving and a full cost breakdown. Tested, simple, batch- and meal-prep-focused. This is your #1 source — it's literally built for cheap, clear cooking.",
    },
    {
      id: "bbcgoodfood", name: "BBC Good Food", emoji: "📗",
      url: "https://www.bbcgoodfood.com/",
      search: "https://www.bbcgoodfood.com/search?q=%s",
      free: true,
      bestFor: "Free, reliable, nutrition info",
      why: "Huge free library, triple-tested recipes, and full nutrition (protein/fiber/calories) on every recipe — handy for your macro targets.",
    },
    {
      id: "eatingwell", name: "EatingWell", emoji: "🥗",
      url: "https://www.eatingwell.com/",
      search: "https://www.eatingwell.com/search?q=%s",
      free: true,
      bestFor: "High-protein & balanced",
      why: "Dietitian-reviewed, health-forward recipes with full nutrition. Great for finding high-protein versions of a dish.",
    },
    {
      id: "seriouseats", name: "Serious Eats", emoji: "🔬",
      url: "https://www.seriouseats.com/",
      search: "https://www.seriouseats.com/search?q=%s",
      free: true,
      bestFor: "Technique & the 'why'",
      why: "Obsessively tested with the reasoning explained. When you want to actually get better at cooking (you love it), this is the one.",
    },
    {
      id: "mediterraneandish", name: "The Mediterranean Dish", emoji: "🫒",
      url: "https://www.themediterraneandish.com/",
      search: "https://www.themediterraneandish.com/?s=%s",
      free: true,
      bestFor: "High-fiber, bean & veg forward",
      why: "Bean-, lentil-, and veg-heavy Mediterranean cooking — exactly the cheap, high-fiber profile this plan runs on.",
    },
    {
      id: "minimalistbaker", name: "Minimalist Baker", emoji: "🥄",
      url: "https://minimalistbaker.com/",
      search: "https://minimalistbaker.com/?s=%s",
      free: true,
      bestFor: "Few ingredients, few steps",
      why: "Most recipes are ≤10 ingredients or 1 bowl/pot — low activation energy, which is the whole point for an ADHD kitchen.",
    },
    {
      id: "nytcooking", name: "NYT Cooking", emoji: "📰",
      url: "https://cooking.nytimes.com/",
      search: "https://cooking.nytimes.com/search?q=%s",
      free: false,
      bestFor: "Gold-standard, some paywall",
      why: "The most rigorously tested recipes online with huge reader notes. Some are free; full access is a subscription.",
    },
  ];

  /* ----------------------------------------------------------------------
   * DEEP LINKS — specific tested recipes mapped to our meal ids. Verified
   * real Budget Bytes / BBC Good Food pages. Each meal can have several so you
   * can pick the version you like.
   * -------------------------------------------------------------------- */
  Anchor.recipeLinks = {
    chili: [
      { source: "Budget Bytes", title: "Slow Cooker Lentil Chili ($0.77/serving)", url: "https://www.budgetbytes.com/slow-cooker-vegetarian-lentil-chili/" },
      { source: "Budget Bytes", title: "Classic Chili", url: "https://www.budgetbytes.com/basic-chili/" },
    ],
    dal: [
      { source: "Budget Bytes", title: "Dal Nirvana (creamy lentil dal)", url: "https://www.budgetbytes.com/dal-nirvana/" },
      { source: "Budget Bytes", title: "Creamy Coconut Curry Lentils + Spinach", url: "https://www.budgetbytes.com/creamy-coconut-curry-lentils-with-spinach/" },
    ],
    shakshuka: [
      { source: "Budget Bytes", title: "Smoky White Bean Shakshuka", url: "https://www.budgetbytes.com/smoky-white-bean-shakshuka/" },
      { source: "Budget Bytes", title: "Simple Shakshuka", url: "https://www.budgetbytes.com/shakshuka/" },
    ],
    stirfry: [
      { source: "Budget Bytes", title: "Easy 5-Star Chicken Stir-Fry", url: "https://www.budgetbytes.com/chicken-stir-fry/" },
    ],
    friedrice: [
      { source: "Budget Bytes", title: "Vegetable Fried Rice", url: "https://www.budgetbytes.com/vegetable-fried-rice/" },
      { source: "Budget Bytes", title: "Chicken Fried Rice", url: "https://www.budgetbytes.com/chicken-fried-rice/" },
    ],
    pastafagioli: [
      { source: "Budget Bytes", title: "Pasta e Fagioli", url: "https://www.budgetbytes.com/pasta-e-fagioli/" },
    ],
    "chickpea-curry": [
      { source: "Budget Bytes", title: "Coconut Lentils", url: "https://www.budgetbytes.com/coconut-lentils/" },
      { source: "Budget Bytes", title: "Golden Coconut Lentil Soup", url: "https://www.budgetbytes.com/golden-coconut-lentil-soup/" },
    ],
    "lentil-bolognese": [
      { source: "Budget Bytes", title: "Lentil recipes (browse)", url: "https://www.budgetbytes.com/tag/lentils/" },
    ],
    "loaded-ramen": [
      { source: "Budget Bytes", title: "Kimchi Fried Rice / noodle ideas", url: "https://www.budgetbytes.com/kimchi-fried-rice/" },
    ],
    "overnight-oats": [
      { source: "Budget Bytes", title: "Overnight oats recipes (browse)", url: "https://www.budgetbytes.com/?s=overnight+oats" },
    ],
  };

  /* ----------------------------------------------------------------------
   * SEARCH-LINK GENERATOR — for any meal, build a search URL into each
   * trusted cookbook from a clean version of the dish name.
   * -------------------------------------------------------------------- */
  Anchor.cleanQuery = function (name) {
    return (name || "")
      .replace(/\(.*?\)/g, "")          // drop parentheticals
      .replace(/[—–·|]/g, " ")
      .replace(/\b(batch|the default|upgraded|build-a-)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  Anchor.recipeSearchLinks = function (meal, opts) {
    opts = opts || {};
    var q = encodeURIComponent(Anchor.cleanQuery(meal.name || meal));
    var books = Anchor.cookbooks;
    if (opts.freeOnly) books = books.filter(function (b) { return b.free; });
    return books.map(function (b) {
      return { id: b.id, source: b.name, emoji: b.emoji, primary: b.primary,
        url: b.search.replace("%s", q) };
    });
  };

  /* Build search links from a raw query string (used by the Recipes view). */
  Anchor.searchAllCookbooks = function (query) {
    var q = encodeURIComponent(Anchor.cleanQuery(query));
    return Anchor.cookbooks.map(function (b) {
      return { id: b.id, source: b.name, emoji: b.emoji, primary: b.primary, free: b.free,
        url: b.search.replace("%s", q) };
    });
  };
})(window.Anchor = window.Anchor || {});
