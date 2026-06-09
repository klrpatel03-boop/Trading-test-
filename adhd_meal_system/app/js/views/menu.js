/* ============================================================================
 * Anchor — views/menu.js
 * Browse the full meal database. Search, filter by category / gear / tag,
 * sort by protein / cost / fiber. Favorites surface first.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  var ALL_TAGS = (function () {
    var set = {};
    Anchor.meals.forEach(function (m) { (m.tags || []).forEach(function (t) { set[t] = 1; }); });
    return Object.keys(set).sort();
  })();

  function render(root, params) {
    var st = {
      q: "",
      cat: (params && params.cat) || "all",
      gear: "all",
      tag: "all",
      sort: "default",
      favOnly: false,
    };

    var listEl = h("div.menu-grid", {});
    var countEl = h("div.menu-count.muted", {});

    function apply() {
      var meals = Anchor.meals.slice();
      var fav = Anchor.store.get().favorites;

      if (st.cat !== "all") meals = meals.filter(function (m) { return m.category === st.cat; });
      if (st.gear !== "all") meals = meals.filter(function (m) { return m.gear === st.gear; });
      if (st.tag !== "all") meals = meals.filter(function (m) { return (m.tags || []).indexOf(st.tag) >= 0; });
      if (st.favOnly) meals = meals.filter(function (m) { return fav.indexOf(m.id) >= 0; });
      if (st.q) {
        var q = st.q.toLowerCase();
        meals = meals.filter(function (m) {
          return (m.name + " " + (m.tags || []).join(" ") + " " + (m.ingredients || []).join(" "))
            .toLowerCase().indexOf(q) >= 0;
        });
      }

      if (st.sort === "protein") meals.sort(function (a, b) { return b.protein - a.protein; });
      else if (st.sort === "cost") meals.sort(function (a, b) { return a.cost - b.cost; });
      else if (st.sort === "fiber") meals.sort(function (a, b) { return b.fiber - a.fiber; });
      else if (st.sort === "cal") meals.sort(function (a, b) { return b.calories - a.calories; });
      else {
        // default: favorites first, then category order
        meals.sort(function (a, b) {
          var fa = fav.indexOf(a.id) >= 0 ? 0 : 1, fb = fav.indexOf(b.id) >= 0 ? 0 : 1;
          return fa - fb;
        });
      }

      Anchor.util.clear(listEl);
      Anchor.util.clear(countEl);
      countEl.appendChild(document.createTextNode(meals.length + " meal" + (meals.length === 1 ? "" : "s")));
      if (meals.length === 0) {
        listEl.appendChild(ui.empty("🔍", "No matches", "Try clearing a filter or the search."));
      } else {
        meals.forEach(function (m) { listEl.appendChild(ui.mealCard(m)); });
      }
    }

    var search = h("input.search-input", {
      type: "search", placeholder: "Search meals, ingredients, tags…",
      oninput: Anchor.util.debounce(function (e) { st.q = e.target.value; apply(); }, 150),
    });

    var catSeg = ui.segmented(
      [{ value: "all", label: "All" }].concat(Anchor.categories.map(function (c) {
        return { value: c.id, label: c.emoji };
      })), st.cat, function (v) { st.cat = v; apply(); rebuildSeg(); }
    );

    var segWrap = h("div.menu-seg-wrap", {}, catSeg);
    function rebuildSeg() {
      Anchor.util.clear(segWrap);
      segWrap.appendChild(ui.segmented(
        [{ value: "all", label: "All" }].concat(Anchor.categories.map(function (c) {
          return { value: c.id, label: c.emoji + " " + c.label };
        })), st.cat, function (v) { st.cat = v; apply(); rebuildSeg(); }
      ));
    }
    rebuildSeg();

    var sortSel = h("select.select", {
      onChange: function (e) { st.sort = e.target.value; apply(); },
    }, [
      h("option", { value: "default" }, "Sort: default"),
      h("option", { value: "protein" }, "Most protein"),
      h("option", { value: "fiber" }, "Most fiber"),
      h("option", { value: "cost" }, "Cheapest first"),
      h("option", { value: "cal" }, "Most calories"),
    ]);

    var gearSel = h("select.select", {
      onChange: function (e) { st.gear = e.target.value; apply(); },
    }, [
      h("option", { value: "all" }, "Any effort"),
      h("option", { value: "cook" }, "🔥 Cook"),
      h("option", { value: "floor" }, "🔋 No-cook"),
    ]);

    var tagSel = h("select.select", {
      onChange: function (e) { st.tag = e.target.value; apply(); },
    }, [h("option", { value: "all" }, "Any tag")].concat(ALL_TAGS.map(function (t) {
      return h("option", { value: t }, t);
    })));

    var favBtn = h("button.btn.btn-ghost.btn-sm", {
      onClick: function (e) {
        st.favOnly = !st.favOnly;
        e.target.classList.toggle("active", st.favOnly);
        apply();
      },
    }, "★ Favorites");

    var wrap = h("div.view.view-menu", {}, [
      ui.sectionHeader("Menu", "Every meal: cheap, high-protein, with the full recipe. Tap any card."),
      h("div.menu-controls", {}, [
        search,
        segWrap,
        h("div.menu-filters", {}, [sortSel, gearSel, tagSel, favBtn]),
        countEl,
      ]),
      listEl,
    ]);

    apply();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.menu = { render: render, title: "Menu" };
})(window.Anchor = window.Anchor || {});
