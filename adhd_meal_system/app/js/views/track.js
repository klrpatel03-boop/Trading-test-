/* ============================================================================
 * Anchor — views/track.js
 * The minimum tracking that actually helps: a 3-question daily check-in, a
 * streak-free consistency heatmap, weekly weight logging with an SVG trend
 * chart, and a plain-language trend nudge. No food diary, no streak to break.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root) {
    var state = Anchor.store.get();
    var todayKey = Anchor.util.todayKey();
    var log = Anchor.store.getLog(todayKey);
    var targets = Anchor.calc.targets(state.profile);

    /* ---- weight chart data ---- */
    var weights = state.weights.slice();
    var chartData = weights.map(function (w) {
      return { x: Anchor.util.keyToDate(w.date).getTime(), y: w.lb };
    });
    var trend = Anchor.calc.weightTrend(weights);

    var chartHost = h("div.chart-host", {});
    function rebuildChart() {
      Anchor.util.clear(chartHost);
      chartHost.appendChild(Anchor.charts.line(chartData, { trend: trend }));
    }

    var weightInput = h("input.input", {
      type: "number", step: "0.1", placeholder: "lb", value: state.profile.weightLb || "",
    });

    function consistency() {
      // last 28 days, % of days with 3+ meals
      var hits = 0, days = 0;
      for (var i = 0; i < 28; i++) {
        var k = Anchor.util.todayKey(Anchor.util.addDays(new Date(), -i));
        var l = state.logs[k];
        if (l) {
          days++;
          if (l.meals >= 3) hits++;
        }
      }
      return { hits: hits, days: days };
    }
    var cons = consistency();

    var wrap = h("div.view.view-track", {}, [
      ui.sectionHeader("Track", "The least tracking that still works. Win = mostly-yes, most days. There's no streak to break."),

      /* daily check-in */
      ui.card([
        h("h3.detail-h", {}, "Today's 10-second check-in"),
        checkRow("Ate at 3+ anchor meals?", log.meals >= 3, function () {
          // toggle a synthetic "3 meals" — better: link to actual marks
          Anchor.store.setLog(todayKey, { meals: log.meals >= 3 ? 0 : 3 });
          Anchor.router.refresh();
        }),
        checkRow("Hit protein + calorie (surplus) target?", log.protein, function () {
          Anchor.store.setLog(todayKey, { protein: !log.protein });
          Anchor.router.refresh();
        }),
        checkRow("Added a calorie booster (oil/PB/shake)?", log.booster, function () {
          Anchor.store.setLog(todayKey, { booster: !log.booster });
          Anchor.router.refresh();
        }),
        h("p.muted", {}, "Tip: the Today screen check-circles auto-count your meals here."),
      ]),

      /* consistency heatmap */
      ui.card([
        h("div.section-head", {}, [
          h("h3.detail-h", {}, "Consistency — last 4 weeks"),
          h("span.muted", {}, cons.days ? Math.round((cons.hits / cons.days) * 100) + "% of logged days hit 3+ meals" : "Start logging"),
        ]),
        Anchor.charts.heatmap(state.logs, { days: 28, cols: 7 }),
        h("div.heat-legend", {}, [
          h("span.muted", {}, "less"),
          h("span.heatcell", { dataset: { level: 0 } }),
          h("span.heatcell", { dataset: { level: 1 } }),
          h("span.heatcell", { dataset: { level: 2 } }),
          h("span.heatcell", { dataset: { level: 3 } }),
          h("span.muted", {}, "more"),
        ]),
        h("p.muted", {}, "5/7 days is a winning week. Missing days are not failures — just resume."),
      ]),

      /* weight tracking */
      ui.card([
        h("h3.detail-h", {}, "Weight — log once a week"),
        h("div.weight-input-row", {}, [
          weightInput,
          h("button.btn.btn-primary.btn-sm", {
            onClick: function () {
              var v = parseFloat(weightInput.value);
              if (!v) { Anchor.util.toast("Enter a weight first"); return; }
              Anchor.store.addWeight(v);
              weights = Anchor.store.get().weights.slice();
              chartData = weights.map(function (w) { return { x: Anchor.util.keyToDate(w.date).getTime(), y: w.lb }; });
              trend = Anchor.calc.weightTrend(weights);
              rebuildChart();
              Anchor.util.toast("Logged " + v + " lb");
              Anchor.router.refresh();
            },
          }, "Log today"),
        ]),
        chartHost,
        trend ? h("div.trend-box", {}, [
          h("div.trend-stat", {}, [
            h("span.trend-num" + (trend.perWeek >= 0 ? ".up" : ".down"), {},
              (trend.perWeek >= 0 ? "+" : "") + Anchor.util.round(trend.perWeek, 2) + " lb/wk"),
            h("span.muted", {}, " trend"),
          ]),
          h("div.trend-advice", {}, Anchor.calc.trendAdvice(trend, state.profile.goal)),
        ]) : h("p.muted", {}, "Log 2+ weeks to see your trend and a calorie nudge."),
        h("p.disclaimer", {}, "Weigh same morning weekly, after bathroom, before eating. Track the trend, not any single day."),
      ]),
    ]);

    rebuildChart();
    Anchor.util.append(root, wrap);
  }

  function checkRow(label, checked, onToggle) {
    return h("button.checkin-row" + (checked ? ".on" : ""), { onClick: onToggle }, [
      h("span.checkbox" + (checked ? ".on" : ""), {}, checked ? "✓" : ""),
      h("span.checkin-label", {}, label),
    ]);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.track = { render: render, title: "Track" };
})(window.Anchor = window.Anchor || {});
