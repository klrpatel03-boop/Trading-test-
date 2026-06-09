/* ============================================================================
 * Anchor — views/cookbooks.js
 * The Recipes screen: trusted online cookbooks (vetted sources) + a universal
 * search that builds links into every source for any dish, + quick links to
 * the tested recipes behind this system's rotation.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root) {
    var resultHost = h("div.cookbook-search-results", {});

    var searchInput = h("input.search-input", {
      type: "search",
      placeholder: "Search any dish across trusted cookbooks…",
      oninput: Anchor.util.debounce(function (e) { doSearch(e.target.value); }, 200),
    });

    function doSearch(q) {
      Anchor.util.clear(resultHost);
      if (!q || q.trim().length < 2) return;
      var links = Anchor.searchAllCookbooks(q);
      resultHost.appendChild(ui.card([
        h("h4.detail-h", {}, "“" + q.trim() + "” on trusted sites"),
        h("div.recipe-search-grid", {}, links.map(function (l) {
          return h("a.recipe-source-link" + (l.primary ? ".primary" : ""), { href: l.url, target: "_blank", rel: "noopener" }, [
            h("span.recipe-source-emoji", {}, l.emoji),
            h("span.recipe-source-name", {}, l.source),
            l.free ? h("span.free-tag", {}, "free") : h("span.paid-tag", {}, "paywall"),
            h("span.recipe-go", {}, "↗"),
          ]);
        })),
      ]));
    }

    var wrap = h("div.view.view-cookbooks", {}, [
      ui.sectionHeader("Recipes", "Cook from vetted, tested recipes — exact quantities, not vibes. Every meal in Anchor links out to these."),

      ui.card([
        h("h3.detail-h", {}, "🔎 Find any recipe"),
        h("p.muted", {}, "Type a dish — get a tested recipe from each trusted cookbook. Or open any meal in the Menu and tap “Cook it from a tested recipe.”"),
        searchInput,
        resultHost,
      ]),

      ui.sectionHeader("Trusted cookbooks", "Why each one earns a spot. Budget Bytes is your default — it prices every recipe."),
      h("div.cookbook-list", {}, Anchor.cookbooks.map(function (b) {
        return h("div.cookbook-card" + (b.primary ? ".cookbook-primary" : ""), {}, [
          h("div.cookbook-head", {}, [
            h("span.cookbook-emoji", {}, b.emoji),
            h("div.cookbook-titles", {}, [
              h("h4.cookbook-name", {}, b.name),
              h("div.cookbook-best", {}, b.bestFor),
            ]),
            b.primary ? ui.chip("start here", { kind: "accent" }) : (b.free ? ui.chip("free", { kind: "soft" }) : ui.chip("paywall", { kind: "warn" })),
          ]),
          h("p.cookbook-why", {}, b.why),
          h("div.cookbook-actions", {}, [
            h("a.btn.btn-ghost.btn-sm", { href: b.url, target: "_blank", rel: "noopener" }, "Browse " + b.name + " ↗"),
          ]),
        ]);
      })),

      ui.sectionHeader("This week's rotation, with recipes", "The exact tested recipe behind each dinner."),
      h("div.rotation-recipes", {}, [
        "chili", "stirfry", "dal", "shakshuka", "friedrice", "pastafagioli", "chickpea-curry",
      ].map(function (id) {
        var meal = Anchor.byId(id);
        if (!meal) return null;
        var deep = (Anchor.recipeLinks[id] || [])[0];
        return h("div.rotation-row", {}, [
          h("span.rotation-emoji", {}, meal.emoji),
          h("div.rotation-info", {}, [
            h("div.rotation-name", {}, meal.name),
            h("div.rotation-macros.muted", {}, "P" + meal.protein + " · Fib" + meal.fiber + " · " + Anchor.util.money(meal.cost) + "/srv"),
          ]),
          deep ? h("a.btn.btn-ghost.btn-sm", { href: deep.url, target: "_blank", rel: "noopener" }, "Recipe ↗")
            : h("button.btn.btn-ghost.btn-sm", { onClick: function () { ui.openMeal(meal); } }, "Open"),
        ]);
      })),

      h("p.disclaimer", {}, "Links open trusted third-party recipe sites in a new tab. Anchor's own quick versions live on each meal card; these are the full tested originals."),
    ]);

    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.cookbooks = { render: render, title: "Recipes" };
})(window.Anchor = window.Anchor || {});
