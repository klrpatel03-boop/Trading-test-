/* ============================================================================
 * Anchor — views/budget.js
 * The money model: monthly cost tiers, an interactive monthly-cost estimator
 * tied to the week plan, cheapest protein/fiber per dollar, store strategy,
 * and the budget rules. Tuned for cheapest living in Andover, MA.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function weeklyPlanCost() {
    // mirror the plan view's selection to estimate real cost
    var today = new Date();
    var SLOTS = ["breakfast", "lunch", "snack1", "dinner", "snack2"];
    var CATS = { breakfast: "breakfast", lunch: "lunch", snack1: "snack", dinner: "dinner", snack2: "snack" };
    var meals = [];
    for (var i = 0; i < 7; i++) {
      var d = Anchor.util.addDays(today, i);
      var key = Anchor.util.todayKey(d);
      var doy = Anchor.dayOfYear(d);
      var ov = Anchor.store.get().overrides[key] || {};
      SLOTS.forEach(function (slot, idx) {
        var m = ov[slot] ? Anchor.byId(ov[slot]) : Anchor.pickForDay(CATS[slot], doy + (slot === "snack2" ? 3 : idx));
        if (m) meals.push(m);
      });
    }
    return Anchor.calc.sumMeals(meals).cost;
  }

  function render(root) {
    var b = Anchor.budget;
    var weekCost = weeklyPlanCost();
    var dayCost = weekCost / 7;
    var monthCost = weekCost * 4.33;

    var wrap = h("div.view.view-budget", {}, [
      ui.sectionHeader("Budget", "Cheapest eating in Andover, MA. The cheapest foods are also the highest-protein — eating well and eating cheap are the same move."),

      /* your projected cost */
      ui.card([
        h("h3.detail-h", {}, "Your current plan costs"),
        h("div.budget-projection", {}, [
          ui.stat(money(dayCost), "Per day", { accent: true }),
          ui.stat(money(weekCost), "Per week"),
          ui.stat(money(monthCost), "Per month"),
        ]),
        (function () {
          var tier = monthCost <= 180 ? b.tiers[0] : monthCost <= 300 ? b.tiers[1] : b.tiers[2];
          return h("div.nudge" + (tier.target ? ".nudge-good" : ""), {}, [
            "You're at the ", h("strong", {}, '"' + tier.name + '"'), " tier (", tier.perMonth, "/mo). ",
            tier.desc,
          ]);
        })(),
        h("p.muted", {}, "Note: Andover housing dominates your real budget — food is the line item you can actually crush. This keeps it near " + money(250) + "/mo."),
      ]),

      /* tiers */
      ui.sectionHeader("The tiers", "Pick your comfort level. Most people land happily in the middle."),
      h("div.tier-grid", {}, b.tiers.map(function (t) {
        return h("div.tier-card" + (t.target ? ".tier-target" : ""), {}, [
          t.target ? h("div.tier-flag", {}, "TARGET") : null,
          h("h4.tier-name", {}, t.name),
          h("div.tier-cost", {}, t.perMonth),
          h("div.tier-day.muted", {}, t.perDay + " / day"),
          h("p.tier-desc", {}, t.desc),
        ]);
      })),

      /* stores */
      ui.sectionHeader("Where to shop", "Merrimack Valley strategy. Market Basket is your single biggest cost lever."),
      h("div.store-list", {}, b.stores.map(function (s) {
        return h("div.store-card" + (s.primary ? ".store-primary" : ""), {}, [
          h("div.store-head", {}, [
            h("h4.store-name", {}, s.name),
            s.primary ? ui.chip("main store", { kind: "accent" }) : null,
          ]),
          h("div.store-use", {}, s.use),
          h("p.store-note.muted", {}, s.note),
        ]);
      })),

      /* per-dollar tables */
      h("div.perdollar-grid", {}, [
        ui.card([
          h("h3.detail-h", {}, "🥩 Cheapest protein / $"),
          h("ol.ranked-list", {}, b.proteinPerDollar.map(function (x, i) {
            return h("li", {}, [h("span.rank", {}, (i + 1)), x]);
          })),
        ]),
        ui.card([
          h("h3.detail-h", {}, "🌾 Cheapest fiber / $"),
          h("ol.ranked-list", {}, b.fiberPerDollar.map(function (x, i) {
            return h("li", {}, [h("span.rank", {}, (i + 1)), x]);
          })),
        ]),
      ]),

      /* rules */
      ui.card([
        h("h3.detail-h", {}, "The budget rules"),
        h("ul.rule-list", {}, b.rules.map(function (r) {
          return h("li", {}, [h("span.rule-dot", {}, "→"), r]);
        })),
      ]),
    ]);

    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.budget = { render: render, title: "Budget" };
})(window.Anchor = window.Anchor || {});
