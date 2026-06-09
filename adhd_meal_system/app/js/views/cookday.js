/* ============================================================================
 * Anchor — views/cookday.js
 * The cook-once-eat-many planner. Pick a batch dinner, scale the servings, and
 * see: scaled ingredients, total + per-serving cost, how many days of leftovers
 * it buys, and the macros per serving. This is the engine of the whole system.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function batchMeals() {
    return Anchor.meals.filter(function (m) { return m.batch || m.gear === "cook"; });
  }

  function render(root, params) {
    var batches = batchMeals();
    if (!batches.length) {
      Anchor.util.append(root, h("div.view.view-cookday", {}, [
        ui.sectionHeader("Cook day", "The leftover loop is the whole system."),
        ui.empty("🍲", "No batch recipes found", "Browse the Menu and favorite a few cook-gear meals."),
      ]));
      return;
    }
    var current = (params && params.meal && Anchor.byId(params.meal)) || batches[0];
    var servings = current.servings;

    var detailHost = h("div.cookday-detail", {});

    function pickerCard(m) {
      return h("button.cook-pick" + (m.id === current.id ? ".active" : ""), {
        onClick: function () { current = m; servings = m.servings; rebuild(); },
      }, [
        h("span.cook-pick-emoji", {}, m.emoji),
        h("span.cook-pick-name", {}, m.name),
        h("span.cook-pick-cost.muted", {}, money(m.cost) + "/srv"),
      ]);
    }

    var pickerEl = h("div.cook-picker", {}, batches.map(pickerCard));

    function scaleIngredient(text, factor) {
      // best-effort scaling: multiply a leading number if present
      return text.replace(/^(\d+(?:\.\d+)?)/, function (_, n) {
        var scaled = Anchor.util.round(parseFloat(n) * factor, 2);
        return scaled;
      });
    }

    function rebuild() {
      Anchor.util.qsa(".cook-pick", pickerEl).forEach(function (el, i) {
        el.classList.toggle("active", batches[i].id === current.id);
      });
      Anchor.util.clear(detailHost);

      var factor = servings / current.servings;
      var totalCost = current.cost * servings;
      var leftovers = Math.max(0, servings - 1);

      detailHost.appendChild(h("div", {}, [
        h("div.cookday-head", {}, [
          h("span.cookday-emoji", {}, current.emoji),
          h("div", {}, [
            h("h2.cookday-name", {}, current.name),
            h("p.muted", {}, current.note),
          ]),
        ]),

        /* servings stepper */
        ui.card([
          h("div.stepper-row", {}, [
            h("span.stepper-label", {}, "Cook this many servings:"),
            h("div.stepper", {}, [
              h("button.stepper-btn", { onClick: function () { servings = Math.max(1, servings - 1); rebuild(); } }, "−"),
              h("span.stepper-val", {}, servings),
              h("button.stepper-btn", { onClick: function () { servings = Math.min(16, servings + 1); rebuild(); } }, "+"),
            ]),
          ]),
          h("div.cookday-yield", {}, [
            ui.stat(money(totalCost), "Total cost", { accent: true }),
            ui.stat(money(current.cost), "Per serving"),
            ui.stat("1 + " + leftovers, "Tonight + leftovers"),
            ui.stat(current.prepMin + " min", "Active time, once"),
          ]),
          h("div.nudge.nudge-good", {}, [
            "🔥 One cook session feeds you ", h("strong", {}, "tonight"),
            " plus ", h("strong", {}, leftovers + " reheatable meal" + (leftovers === 1 ? "" : "s")),
            " — that's ~" + Math.ceil(leftovers / 2) + " day" + (Math.ceil(leftovers / 2) === 1 ? "" : "s") + " of breakfasts & lunches handled with zero effort.",
          ]),
        ]),

        /* per-serving macros */
        ui.card([
          h("h3.detail-h", {}, "Per serving"),
          ui.macroRow(current),
        ]),

        /* scaled ingredients + steps */
        h("div.detail-cols", {}, [
          h("div.detail-col", {}, [
            h("h4.detail-h", {}, "Shopping for " + servings + " servings"),
            h("ul.detail-list", {}, (current.ingredients || []).map(function (ing) {
              return h("li", {}, factor !== 1 ? scaleIngredient(ing, factor) : ing);
            })),
            factor !== 1 ? h("p.muted", {}, "Quantities scaled ×" + Anchor.util.round(factor, 2) + " — eyeball the spices.") : null,
          ]),
          h("div.detail-col", {}, [
            h("h4.detail-h", {}, "Steps"),
            h("ol.detail-steps", {}, (current.steps || []).map(function (s) { return h("li", {}, s); })),
            h("div.cookday-portion-tip", {}, "🔑 Portion into single containers the moment it's done — bulk in a pot won't get eaten; grab-able containers will."),
          ]),
        ]),

        h("div.modal-actions", {}, [
          h("button.btn.btn-primary", {
            onClick: function () {
              Anchor.store.addPanCook(1);
              Anchor.util.toast("🍳 Cooked! Pan use #" + Anchor.store.panUses() + " — " + money(Anchor.store.panStats().costPerUse) + "/use");
            },
          }, "✓ I cooked this batch"),
          h("button.btn.btn-ghost", { onClick: function () { Anchor.router.go("groceries"); } }, "Grocery list"),
          h("button.btn.btn-ghost", { onClick: function () { Anchor.ui.openMeal(current); } }, "Recipe card"),
        ]),
      ]));
    }

    var wrap = h("div.view.view-cookday", {}, [
      ui.sectionHeader("Cook day", "Cook once when the spark hits, eat for days. The leftover loop is the whole system."),
      pickerEl,
      detailHost,
    ]);

    rebuild();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.cookday = { render: render, title: "Cook day" };
})(window.Anchor = window.Anchor || {});
