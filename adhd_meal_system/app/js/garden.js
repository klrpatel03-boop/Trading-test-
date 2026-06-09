/* ============================================================================
 * Anchor — garden.js
 * Personalization for a cook with a kit + a garden. Surfaces recipes that suit
 * your big 6-qt pan, and turns your kale surplus into a plan (cut-and-come-
 * again, use-a-big-bunch recipes, blanch & freeze). Perpetual spinach is a
 * trickle, so it's treated as a garnish, not an ingredient. Loaded after the
 * library packs, before util/views.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  /* Default kit + garden — seeded with your real setup, editable in Settings. */
  Anchor.defaultKit = [
    { name: "All-Clad Essential 5-ply 6-qt pan", kind: "big-pan",
      note: "Deep, even, oven-safe — your batch-cook workhorse: chili, dal, stir-fries, soups, frittatas, braises, one-pan everything." },
  ];
  Anchor.defaultGarden = [
    { crop: "Kale", emoji: "🥬", plants: 7, supply: "abundant",
      note: "7 plants = a steady surplus. Harvest the outer leaves (cut-and-come-again) and it keeps producing. Frost makes it sweeter — great into the cold months in MA." },
    { crop: "Perpetual spinach", emoji: "🌿", plants: 2, supply: "trickle",
      note: "Only 1–2 leaves a week — too little to build a meal on. Use it as a fresh garnish: torn into an omelette, on top of a bowl, in a sandwich." },
  ];

  /* Rotation slots (0–6) to swap for kale-forward 6-qt batch dinners when the
   * garden preference is on — gives ~2 kale dinners/week without crowding out
   * variety. Both are one-pot, batch, kale-heavy. */
  Anchor.gardenDinnerMap = { 1: "kale-sausage-stew", 4: "kale-lentil-soup" };

  /* Does this recipe shine in a big 6-qt pan? (deep, high-volume, one-vessel) */
  Anchor.fitsBigPan = function (meal) {
    var t = meal.tags || [];
    var oneVessel = t.indexOf("one-pot") >= 0 || t.indexOf("one-pan") >= 0;
    var bigBatch = meal.batch && meal.servings >= 5;
    return oneVessel || bigBatch;
  };

  /* Does this recipe use kale / leafy greens you can swap kale into? */
  var GREEN_RE = /\bkale\b|\bgreens\b|\bspinach\b|\bcollard|\bchard\b|\bcabbage\b|\bbok choy\b/i;
  Anchor.usesKale = function (meal) {
    if ((meal.garden || []).indexOf("kale") >= 0) return true;
    return (meal.ingredients || []).some(function (i) { return GREEN_RE.test(i); });
  };
  Anchor.kaleRecipes = function () {
    return Anchor.meals.filter(Anchor.usesKale);
  };

  /* When a recipe calls for spinach/greens, you can use your kale instead. */
  Anchor.kaleSwapNote = function (meal) {
    var usesSpinach = (meal.ingredients || []).some(function (i) { return /spinach|greens|chard/i.test(i) && !/kale/i.test(i); });
    if (usesSpinach) return "🥬 Use your garden kale here instead of spinach — strip the stems and give it an extra minute to soften.";
    if (Anchor.usesKale(meal)) return "🥬 Straight from your garden — a big handful of kale fits right in.";
    return null;
  };

  /* Tips for handling a surplus. */
  Anchor.gardenTips = {
    harvest: [
      "Pick the outer/lower leaves first — the plant keeps growing from the center (cut-and-come-again).",
      "A big handful per plant every few days is normal with 7 plants — that's a steady supply.",
      "Strip the tough center rib before cooking; massage raw kale with oil + salt to tenderize it.",
      "Frost sweetens kale — it'll keep producing well into the cold months around Andover.",
    ],
    preserve: [
      "Surplus? Blanch 2 min, ice-bath, squeeze dry, freeze in balls — drop straight into soups/chili later.",
      "Make kale chips with the extra (olive oil + salt, low oven) — cheap, crunchy, high-fiber snack.",
      "Blitz a big bunch into kale pesto (kale + nuts + oil + garlic + parm); freeze in an ice tray.",
    ],
    useBig: [
      "Soups & stews swallow a whole bunch — Tuscan white bean, minestrone, lentil, sausage & bean.",
      "Wilt a big handful into chili, dal, fried rice, shakshuka, or pasta at the end.",
      "Kale pesto pasta or a giant garlicky sauté uses the most at once.",
    ],
  };

  /* Seed a few garden/kit-aware tips into the Today rotation. */
  if (Anchor.tips) {
    Array.prototype.push.apply(Anchor.tips, [
      "🥬 Your kale's ready — wilt a big handful into tonight's pot at the end.",
      "🍳 Cooking a batch? Your 6-qt pan is the right tool. Make extra.",
      "🥬 Surplus kale? Blanch 2 min + freeze it in balls to drop into soups later.",
      "🥬 Raw kale salad keeps for days in the fridge (unlike spinach) — a great make-ahead.",
    ]);
  }
})(window.Anchor = window.Anchor || {});
