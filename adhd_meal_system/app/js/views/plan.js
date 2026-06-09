/* ============================================================================
 * Anchor — views/plan.js
 * The week planner: 7 days × meal slots. Auto-filled, shuffle-able, with a
 * weekly cost + macro summary. Lets you set per-day overrides without thinking.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  var SLOTS = [
    { slot: "breakfast", cat: "breakfast", label: "Breakfast" },
    { slot: "lunch", cat: "lunch", label: "Lunch" },
    { slot: "snack1", cat: "snack", label: "Snack" },
    { slot: "dinner", cat: "dinner", label: "Dinner" },
    { slot: "snack2", cat: "snack", label: "Snack" },
  ];

  function mealFor(dateKey, slotObj, doy, idx) {
    var state = Anchor.store.get();
    var ov = state.overrides[dateKey] || {};
    if (ov[slotObj.slot]) {
      var m = Anchor.byId(ov[slotObj.slot]);
      if (m) return m;
    }
    return Anchor.pickForDay(slotObj.cat, doy + (slotObj.slot === "snack2" ? 3 : idx));
  }

  function render(root) {
    var today = new Date();
    var weekDays = [];
    for (var i = 0; i < 7; i++) weekDays.push(Anchor.util.addDays(today, i));

    var state = Anchor.store.get();
    var targets = Anchor.calc.targets(state.profile);

    // weekly aggregate
    var weekMeals = [];
    weekDays.forEach(function (d) {
      var key = Anchor.util.todayKey(d);
      var doy = Anchor.dayOfYear(d);
      SLOTS.forEach(function (s, idx) { weekMeals.push(mealFor(key, s, doy, idx)); });
    });
    var weekTotals = Anchor.calc.sumMeals(weekMeals);
    var dinners = weekMeals.filter(function (m) { return m.category === "dinner"; });
    var cookCount = {};
    dinners.forEach(function (m) { cookCount[m.id] = (cookCount[m.id] || 0) + 1; });

    var wrap = h("div.view.view-plan", {}, [
      ui.sectionHeader("This week", "Already planned. Cook dinners in big batches — leftovers cover breakfast & lunch.", [
        h("button.btn.btn-ghost.btn-sm", { onClick: function () { reshuffle(weekDays); } }, "↻ Shuffle week"),
      ]),

      ui.card([
        h("div.week-summary", {}, [
          ui.stat(money(weekTotals.cost), "This week", { accent: true }),
          ui.stat(money(weekTotals.cost / 7), "Per day"),
          ui.stat(money(weekTotals.cost * 4.33), "Per month"),
          ui.stat(Math.round(weekTotals.protein / 7) + "g", "Avg protein/day"),
          ui.stat(Math.round(weekTotals.calories / 7), "Avg cal/day"),
        ]),
        h("p.week-note", {}, [
          "Target is " + money(8) + "–" + money(10) + "/day (the 'comfortable cheap' tier). ",
          weekTotals.cost / 7 <= 10
            ? h("span.tag-good", {}, "✓ You're under budget.")
            : h("span.tag-warn", {}, "Trim a pricier dinner to drop the average."),
        ]),
      ]),

      /* cook plan summary */
      ui.card([
        h("h3.detail-h", {}, "🔥 Your cook sessions this week"),
        h("p.muted", {}, "Each batch dinner = several reheatable meals. Aim to cook 2–3 times, not 7."),
        h("div.cook-chips", {}, Object.keys(cookCount).map(function (id) {
          var m = Anchor.byId(id);
          return ui.chip(m.emoji + " " + m.name + " ×" + cookCount[id], {
            kind: "accent",
            onClick: function () { Anchor.router.go("cookday", { meal: id }); },
          });
        })),
      ]),

      /* the grid */
      h("div.plan-grid", {}, weekDays.map(function (d) {
        var key = Anchor.util.todayKey(d);
        var doy = Anchor.dayOfYear(d);
        var dayMeals = SLOTS.map(function (s, idx) { return mealFor(key, s, doy, idx); });
        var dayTotals = Anchor.calc.sumMeals(dayMeals);
        var isToday = key === Anchor.util.todayKey();
        return h("div.plan-day" + (isToday ? ".is-today" : ""), {}, [
          h("div.plan-day-head", {}, [
            h("span.plan-day-name", {}, Anchor.util.weekdayName(d.getDay()).slice(0, 3)),
            h("span.plan-day-date", {}, d.getDate()),
            h("span.plan-day-cost", {}, money(dayTotals.cost)),
          ]),
          h("div.plan-day-meals", {}, SLOTS.map(function (s, idx) {
            var m = dayMeals[idx];
            return h("button.plan-cell", {
              onClick: function () { swap(key, s, m); },
              title: s.label + ": " + m.name + " — tap to swap",
            }, [
              h("span.plan-cell-slot", {}, s.label),
              h("span.plan-cell-meal", {}, m.emoji + " " + m.name),
            ]);
          })),
          h("div.plan-day-foot", {}, "P" + dayTotals.protein + " · " + dayTotals.calories + "cal"),
        ]);
      })),
    ]);

    Anchor.util.append(root, wrap);
  }

  function swap(dateKey, slotObj, current) {
    var options = Anchor.byCategory(slotObj.cat);
    Anchor.ui.modal(h("div", {}, [
      h("h2.modal-title", {}, "Swap " + slotObj.label),
      h("p.muted", {}, Anchor.util.fmtLong(Anchor.util.keyToDate(dateKey))),
      h("div.swap-list", {}, options.map(function (m) {
        return h("button.swap-option" + (m.id === current.id ? ".current" : ""), {
          onClick: function () {
            Anchor.store.setOverride(dateKey, slotObj.slot, m.id);
            Anchor.ui.closeModal();
            Anchor.router.refresh();
          },
        }, [
          h("span.swap-emoji", {}, m.emoji),
          h("div.swap-text", {}, [
            h("div.swap-name", {}, m.name),
            h("div.swap-macros", {}, "P" + m.protein + " · " + m.calories + "cal · " + money(m.cost)),
          ]),
          Anchor.ui.gearBadge(m.gear),
        ]);
      })),
    ]));
  }

  function reshuffle(weekDays) {
    // clear overrides for the visible week so picks regenerate, then jitter snacks
    Anchor.store.update(function (s) {
      weekDays.forEach(function (d) {
        var key = Anchor.util.todayKey(d);
        delete s.overrides[key];
      });
    });
    Anchor.util.toast("Week reshuffled");
    Anchor.router.refresh();
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.plan = { render: render, title: "Week" };
})(window.Anchor = window.Anchor || {});
