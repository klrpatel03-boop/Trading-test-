/* ============================================================================
 * Anchor — views/insights.js
 * A calm dashboard: weight trend, average protein/cost vs targets, consistency,
 * and the single most useful next action. Read-only — no pressure, just signal.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function render(root) {
    var state = Anchor.store.get();
    var targets = Anchor.calc.targets(state.profile);

    // weight
    var weights = state.weights.slice();
    var chartData = weights.map(function (w) { return { x: Anchor.util.keyToDate(w.date).getTime(), y: w.lb }; });
    var trend = Anchor.calc.weightTrend(weights);

    // logged consistency (28d)
    var hit = 0, logged = 0, boosters = 0, proteinDays = 0;
    for (var i = 0; i < 28; i++) {
      var k = Anchor.util.todayKey(Anchor.util.addDays(new Date(), -i));
      var l = state.logs[k];
      if (l) { logged++; if (l.meals >= 3) hit++; if (l.booster) boosters++; if (l.protein) proteinDays++; }
    }

    // plan cost (week)
    var SLOTS = ["breakfast", "lunch", "snack1", "dinner", "snack2"];
    var CATS = { breakfast: "breakfast", lunch: "lunch", snack1: "snack", dinner: "dinner", snack2: "snack" };
    var meals = [];
    for (var d = 0; d < 7; d++) {
      var dt = Anchor.util.addDays(new Date(), d);
      var doy = Anchor.dayOfYear(dt);
      SLOTS.forEach(function (slot, idx) { meals.push(Anchor.pickForDay(CATS[slot], doy + idx)); });
    }
    var wk = Anchor.calc.sumMeals(meals);
    var avgProtein = Math.round(wk.protein / 7);
    var avgCost = wk.cost / 7;

    // next best action
    var action;
    if (logged < 3) action = { t: "Log a few check-ins", d: "Even 3 days of data unlocks your trend and a real nudge.", go: "track" };
    else if (!trend) action = { t: "Log your weight 2 weeks running", d: "It's the one number that tells us if the surplus is working.", go: "track" };
    else if (state.profile.goal === "gain" && trend.perWeek < 0.1) action = { t: "Bump calories ~200", d: "You're not gaining yet — add a shake or more olive oil/PB.", go: "calculator" };
    else if (avgProtein < targets.protein * 0.85) action = { t: "Add protein to your default day", d: "Swap a snack for a higher-protein one in the Menu.", go: "menu" };
    else action = { t: "You're dialed in — keep coasting", d: "Cook a batch when the spark hits and let leftovers carry you.", go: "cookday" };

    var wrap = h("div.view.view-insights", {}, [
      ui.sectionHeader("Insights", "The signal, none of the nagging. Glance and move on."),

      h("div.insight-tiles", {}, [
        ui.stat(trend ? (trend.perWeek >= 0 ? "+" : "") + Anchor.util.round(trend.perWeek, 2) + " lb" : "—", "Weekly trend", { accent: true, sub: state.profile.goal === "gain" ? "target +0.25–0.5" : "" }),
        ui.stat(avgProtein + "g", "Avg protein/day", { sub: "target " + targets.protein + "g" }),
        ui.stat(money(avgCost), "Avg cost/day", { sub: "target ≤$10" }),
        ui.stat(logged ? Math.round((hit / logged) * 100) + "%" : "—", "Days w/ 3+ meals", { sub: logged + " logged" }),
      ]),

      ui.card([
        h("h3.detail-h", {}, "Weight trend"),
        weights.length ? Anchor.charts.line(chartData, { trend: trend }) : ui.empty("⚖️", "No weight logged yet", "Add one in Track to start the trend."),
        trend ? h("p.muted", {}, Anchor.calc.trendAdvice(trend, state.profile.goal)) : null,
      ]),

      ui.card([
        h("h3.detail-h", {}, "Consistency — last 4 weeks"),
        Anchor.charts.heatmap(state.logs, { days: 28, cols: 7 }),
      ]),

      Anchor.earnedMilestones ? ui.card([
        h("h3.detail-h", {}, "🏅 Wins so far"),
        h("p.muted", {}, "No streaks, no pressure — just things you've already done."),
        h("div.milestone-grid", {}, Anchor.earnedMilestones().map(function (m) {
          return h("div.milestone" + (m.earned ? ".earned" : ""), { title: m.blurb }, [
            h("span.milestone-emoji", {}, m.earned ? m.emoji : "🔒"),
            h("span.milestone-title", {}, m.title),
            m.earned ? h("span.milestone-blurb", {}, m.blurb) : null,
          ]);
        })),
      ]) : null,

      h("div.next-action", {}, [
        h("div.next-action-label", {}, "👉 Your one next move"),
        h("h3.next-action-title", {}, action.t),
        h("p.next-action-desc", {}, action.d),
        h("button.btn.btn-primary", { onClick: function () { Anchor.router.go(action.go); } }, "Do it"),
      ]),
    ]);

    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.insights = { render: render, title: "Insights" };
})(window.Anchor = window.Anchor || {});
