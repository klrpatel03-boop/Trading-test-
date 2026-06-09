/* ============================================================================
 * Anchor — views/decide.js
 * "Decide for me." The ultimate ADHD decision-killer: pick your energy, time,
 * and craving and it hands you ONE meal — no scrolling, no choosing. Tap again
 * for a different one. Then jump straight to its tested recipe.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function render(root) {
    var opts = { energy: "low", time: "5", crave: "any" };
    var resultHost = h("div.decide-result", {});

    function spin() {
      var meal = Anchor.decide(opts);
      Anchor.util.clear(resultHost);
      if (!meal) {
        resultHost.appendChild(ui.empty("🤔", "No match", "Loosen a filter — try higher energy or 'Any' craving."));
        return;
      }
      resultHost.appendChild(buildResult(meal));
    }

    function buildResult(meal) {
      var deep = (Anchor.recipeLinks && Anchor.recipeLinks[meal.id]) || [];
      var primary = Anchor.recipeSearchLinks(meal).filter(function (s) { return s.primary; })[0];
      var link = deep[0] ? deep[0].url : (primary ? primary.url : null);
      return h("div.decide-card", { key: meal.id }, [
        h("div.decide-emoji", {}, meal.emoji),
        h("h2.decide-name", {}, meal.name),
        h("div.decide-badges", {}, [
          ui.gearBadge(meal.gear),
          h("span.chip", {}, meal.prepMin + " min"),
          h("span.chip", {}, "P" + meal.protein + "g"),
          h("span.chip", {}, meal.calories + " cal"),
          h("span.chip.chip-accent", {}, money(meal.cost)),
        ]),
        meal.note ? h("p.decide-note", {}, meal.note) : null,
        h("div.decide-actions", {}, [
          h("button.btn.btn-primary", { onClick: function () { ui.openMeal(meal); } }, "How to make it"),
          link ? h("a.btn.btn-ghost", { href: link, target: "_blank", rel: "noopener" }, "Tested recipe ↗") : null,
          h("button.btn.btn-ghost", { onClick: spin }, "↻ Something else"),
        ]),
      ]);
    }

    function pickRow(label, key, choices) {
      return h("div.decide-field", {}, [
        h("label.decide-label", {}, label),
        ui.segmented(choices, opts[key], function (v) { opts[key] = v; spin(); }),
      ]);
    }

    var wrap = h("div.view.view-decide", {}, [
      ui.sectionHeader("Decide for me", "Can't choose? Don't. Set three sliders and eat what it says."),
      ui.card([
        pickRow("Energy right now", "energy", [
          { value: "low", label: "🔋 Low" }, { value: "med", label: "🙂 Some" }, { value: "high", label: "🔥 High" },
        ]),
        pickRow("Time you've got", "time", [
          { value: "5", label: "5 min" }, { value: "20", label: "20 min" }, { value: "plenty", label: "Plenty" },
        ]),
        pickRow("Craving", "crave", [
          { value: "any", label: "Any" }, { value: "savory", label: "Savory" },
          { value: "hot", label: "Hot" }, { value: "sweet", label: "Sweet" },
        ]),
      ]),
      resultHost,
      h("p.muted.decide-hint", {}, "Low energy only shows no-cook meals. High energy unlocks the fun cook recipes. There's no wrong answer — eat the thing it gives you."),
    ]);

    spin();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.decide = { render: render, title: "Decide" };
})(window.Anchor = window.Anchor || {});
