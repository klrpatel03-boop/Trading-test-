/* ============================================================================
 * Anchor — foods.js
 * A reference database of cheap, whole, high-protein/fiber foods + a sortable
 * lookup view. Answers the real budget question: "what gives me the most
 * protein (or fiber) per dollar?" Data + view in one module.
 * Values are per typical serving, approximate, Market-Basket-ish pricing.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  // NB: helpers resolved inside render() so this file can load with the data
  // packs (before util/ui) — it provides both data (Anchor.foods) and a view.

  /* group: protein | grain | veg | fruit | dairy | fat | snack */
  Anchor.foods = [
    // protein
    { name: "Dried lentils", emoji: "🫘", group: "protein", serve: "1 cup cooked", protein: 18, fiber: 16, cal: 230, cost: 0.25 },
    { name: "Dried black beans", emoji: "🫘", group: "protein", serve: "1 cup cooked", protein: 15, fiber: 15, cal: 227, cost: 0.30 },
    { name: "Chickpeas (canned)", emoji: "🫛", group: "protein", serve: "1 cup", protein: 15, fiber: 12, cal: 269, cost: 0.55 },
    { name: "Eggs", emoji: "🥚", group: "protein", serve: "2 large", protein: 12, fiber: 0, cal: 156, cost: 0.55 },
    { name: "Canned tuna", emoji: "🐟", group: "protein", serve: "1 can", protein: 20, fiber: 0, cal: 100, cost: 1.00 },
    { name: "Canned salmon", emoji: "🍣", group: "protein", serve: "1/2 can", protein: 17, fiber: 0, cal: 120, cost: 1.25 },
    { name: "Chicken thigh", emoji: "🍗", group: "protein", serve: "4 oz", protein: 23, fiber: 0, cal: 180, cost: 0.65 },
    { name: "Whole chicken", emoji: "🍗", group: "protein", serve: "4 oz", protein: 25, fiber: 0, cal: 200, cost: 0.45 },
    { name: "Ground turkey", emoji: "🦃", group: "protein", serve: "4 oz", protein: 22, fiber: 0, cal: 200, cost: 1.00 },
    { name: "Tofu (firm)", emoji: "🧈", group: "protein", serve: "1/2 block", protein: 20, fiber: 2, cal: 180, cost: 1.00 },
    { name: "Tempeh", emoji: "🧱", group: "protein", serve: "3 oz", protein: 16, fiber: 7, cal: 160, cost: 1.30 },
    { name: "Cottage cheese", emoji: "🧀", group: "protein", serve: "3/4 cup", protein: 21, fiber: 0, cal: 150, cost: 0.75 },
    { name: "Greek yogurt", emoji: "🥛", group: "protein", serve: "3/4 cup", protein: 17, fiber: 0, cal: 130, cost: 0.85 },
    { name: "Whey protein", emoji: "🥤", group: "protein", serve: "1 scoop", protein: 25, fiber: 1, cal: 120, cost: 0.70 },
    { name: "Edamame", emoji: "🫛", group: "protein", serve: "1 cup", protein: 18, fiber: 8, cal: 190, cost: 0.60 },
    { name: "Split peas", emoji: "🟢", group: "protein", serve: "1 cup cooked", protein: 16, fiber: 16, cal: 230, cost: 0.25 },
    { name: "Sardines", emoji: "🐟", group: "protein", serve: "1 can", protein: 23, fiber: 0, cal: 190, cost: 1.20 },
    // grains / carbs
    { name: "Oats", emoji: "🌾", group: "grain", serve: "1/2 cup dry", protein: 5, fiber: 4, cal: 150, cost: 0.10 },
    { name: "Brown rice", emoji: "🍚", group: "grain", serve: "1 cup cooked", protein: 5, fiber: 3, cal: 215, cost: 0.15 },
    { name: "White rice", emoji: "🍚", group: "grain", serve: "1 cup cooked", protein: 4, fiber: 1, cal: 205, cost: 0.12 },
    { name: "Whole-wheat pasta", emoji: "🍝", group: "grain", serve: "2 oz dry", protein: 7, fiber: 6, cal: 180, cost: 0.30 },
    { name: "Bean pasta", emoji: "🍝", group: "grain", serve: "2 oz dry", protein: 14, fiber: 8, cal: 190, cost: 0.65 },
    { name: "Potato", emoji: "🥔", group: "grain", serve: "1 medium", protein: 4, fiber: 4, cal: 160, cost: 0.30 },
    { name: "Whole-grain bread", emoji: "🍞", group: "grain", serve: "2 slices", protein: 8, fiber: 6, cal: 160, cost: 0.30 },
    { name: "Tortilla", emoji: "🫓", group: "grain", serve: "1 large", protein: 5, fiber: 3, cal: 150, cost: 0.25 },
    { name: "Quinoa", emoji: "🌾", group: "grain", serve: "1 cup cooked", protein: 8, fiber: 5, cal: 222, cost: 0.50 },
    { name: "Popcorn", emoji: "🍿", group: "grain", serve: "3 cups popped", protein: 3, fiber: 4, cal: 90, cost: 0.10 },
    // veg
    { name: "Frozen mixed veg", emoji: "🥦", group: "veg", serve: "1 cup", protein: 3, fiber: 4, cal: 70, cost: 0.35 },
    { name: "Cabbage", emoji: "🥬", group: "veg", serve: "1 cup", protein: 1, fiber: 2, cal: 22, cost: 0.10 },
    { name: "Carrots", emoji: "🥕", group: "veg", serve: "1 cup", protein: 1, fiber: 3, cal: 50, cost: 0.15 },
    { name: "Spinach", emoji: "🥬", group: "veg", serve: "2 cups raw", protein: 2, fiber: 1, cal: 14, cost: 0.40 },
    { name: "Onion", emoji: "🧅", group: "veg", serve: "1 medium", protein: 1, fiber: 2, cal: 44, cost: 0.20 },
    { name: "Frozen broccoli", emoji: "🥦", group: "veg", serve: "1 cup", protein: 3, fiber: 3, cal: 55, cost: 0.40 },
    { name: "Canned tomatoes", emoji: "🍅", group: "veg", serve: "1/2 can", protein: 2, fiber: 2, cal: 40, cost: 0.40 },
    { name: "Sweet potato", emoji: "🍠", group: "veg", serve: "1 medium", protein: 2, fiber: 4, cal: 112, cost: 0.40 },
    { name: "Mushrooms", emoji: "🍄", group: "veg", serve: "1 cup", protein: 3, fiber: 1, cal: 21, cost: 0.60 },
    // fruit
    { name: "Banana", emoji: "🍌", group: "fruit", serve: "1 medium", protein: 1, fiber: 3, cal: 105, cost: 0.20 },
    { name: "Apple", emoji: "🍎", group: "fruit", serve: "1 medium", protein: 0, fiber: 4, cal: 95, cost: 0.50 },
    { name: "Frozen berries", emoji: "🫐", group: "fruit", serve: "1/2 cup", protein: 1, fiber: 4, cal: 40, cost: 0.50 },
    { name: "Orange", emoji: "🍊", group: "fruit", serve: "1 medium", protein: 1, fiber: 3, cal: 62, cost: 0.40 },
    { name: "Raisins", emoji: "🍇", group: "fruit", serve: "1/4 cup", protein: 1, fiber: 2, cal: 108, cost: 0.30 },
    // dairy / fat
    { name: "Whole milk", emoji: "🥛", group: "dairy", serve: "1 cup", protein: 8, fiber: 0, cal: 150, cost: 0.25 },
    { name: "Cheddar cheese", emoji: "🧀", group: "dairy", serve: "1 oz", protein: 7, fiber: 0, cal: 110, cost: 0.40 },
    { name: "Mozzarella", emoji: "🧀", group: "dairy", serve: "1 oz", protein: 6, fiber: 0, cal: 85, cost: 0.35 },
    { name: "Peanut butter", emoji: "🥜", group: "fat", serve: "2 tbsp", protein: 7, fiber: 2, cal: 190, cost: 0.20 },
    { name: "Olive oil", emoji: "🫒", group: "fat", serve: "1 tbsp", protein: 0, fiber: 0, cal: 120, cost: 0.15 },
    { name: "Almonds", emoji: "🌰", group: "fat", serve: "1 oz", protein: 6, fiber: 4, cal: 164, cost: 0.40 },
    { name: "Chia seeds", emoji: "⚫", group: "fat", serve: "1 tbsp", protein: 2, fiber: 5, cal: 60, cost: 0.20 },
    { name: "Avocado", emoji: "🥑", group: "fat", serve: "1/2", protein: 2, fiber: 5, cal: 120, cost: 0.50 },
    { name: "Sunflower seeds", emoji: "🌻", group: "fat", serve: "1 oz", protein: 6, fiber: 3, cal: 165, cost: 0.25 },
  ];

  var GROUPS = [
    { id: "all", label: "All" },
    { id: "protein", label: "Protein" },
    { id: "grain", label: "Carbs" },
    { id: "veg", label: "Veg" },
    { id: "fruit", label: "Fruit" },
    { id: "dairy", label: "Dairy" },
    { id: "fat", label: "Fats/nuts" },
  ];

  function render(root) {
    var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;
    var st = { group: "all", sort: "protein-per-$", q: "" };
    var listHost = h("div.food-list", {});

    function proteinPerDollar(f) { return f.cost ? f.protein / f.cost : 0; }
    function fiberPerDollar(f) { return f.cost ? f.fiber / f.cost : 0; }
    function calPerDollar(f) { return f.cost ? f.cal / f.cost : 0; }

    function apply() {
      var foods = Anchor.foods.slice();
      if (st.group !== "all") foods = foods.filter(function (f) { return f.group === st.group; });
      if (st.q) {
        var q = st.q.toLowerCase();
        foods = foods.filter(function (f) { return f.name.toLowerCase().indexOf(q) >= 0; });
      }
      var sorter = {
        "protein-per-$": function (a, b) { return proteinPerDollar(b) - proteinPerDollar(a); },
        "fiber-per-$": function (a, b) { return fiberPerDollar(b) - fiberPerDollar(a); },
        "cal-per-$": function (a, b) { return calPerDollar(b) - calPerDollar(a); },
        "protein": function (a, b) { return b.protein - a.protein; },
        "cheapest": function (a, b) { return a.cost - b.cost; },
      }[st.sort];
      foods.sort(sorter);

      Anchor.util.clear(listHost);
      foods.forEach(function (f) {
        var metric = st.sort === "fiber-per-$" ? Anchor.util.round(fiberPerDollar(f), 1) + "g fib/$"
          : st.sort === "cal-per-$" ? Math.round(calPerDollar(f)) + " cal/$"
          : st.sort === "cheapest" ? money(f.cost)
          : st.sort === "protein" ? f.protein + "g P"
          : Anchor.util.round(proteinPerDollar(f), 1) + "g P/$";
        listHost.appendChild(h("div.food-row", {}, [
          h("span.food-emoji", {}, f.emoji),
          h("div.food-info", {}, [
            h("div.food-name", {}, f.name),
            h("div.food-serve.muted", {}, f.serve + " · " + money(f.cost)),
          ]),
          h("div.food-macros", {}, [
            h("span.food-metric", {}, metric),
            h("span.food-sub.muted", {}, "P" + f.protein + " · Fib" + f.fiber + " · " + f.cal + "cal"),
          ]),
        ]));
      });
    }

    var wrap = h("div.view.view-foods", {}, [
      ui.sectionHeader("Cheap food index", "What gives you the most protein (or fiber) per dollar. Build meals from the top of the list."),
      ui.card([
        h("input.search-input", { type: "search", placeholder: "Search a food…", oninput: Anchor.util.debounce(function (e) { st.q = e.target.value; apply(); }, 150) }),
        h("div.menu-seg-wrap", { style: { marginTop: "10px" } }, ui.segmented(GROUPS.map(function (g) { return { value: g.id, label: g.label }; }), st.group, function (v) { st.group = v; apply(); })),
        h("div.food-sort", {}, [
          h("label.muted", {}, "Rank by "),
          h("select.select", { onChange: function (e) { st.sort = e.target.value; apply(); } }, [
            h("option", { value: "protein-per-$" }, "Protein per $"),
            h("option", { value: "fiber-per-$" }, "Fiber per $"),
            h("option", { value: "cal-per-$" }, "Calories per $ (gaining)"),
            h("option", { value: "protein" }, "Most protein"),
            h("option", { value: "cheapest" }, "Cheapest"),
          ]),
        ]),
      ]),
      listHost,
      h("p.disclaimer", {}, "Approximate values + Market-Basket-ish prices. Use it to compare, not as exact nutrition."),
    ]);

    apply();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.foods = { render: render, title: "Food index" };
})(window.Anchor = window.Anchor || {});
