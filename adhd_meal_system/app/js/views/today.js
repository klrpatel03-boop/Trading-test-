/* ============================================================================
 * Anchor — views/today.js
 * The home screen: today's decided plan, anchor schedule with check-off,
 * day totals vs targets, the booster, and a rotating tip. This is where you
 * land — no decisions required.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function plannedMeals(dateKey) {
    var d = Anchor.util.keyToDate(dateKey);
    var doy = Anchor.dayOfYear(d);
    var state = Anchor.store.get();
    var overrides = state.overrides[dateKey] || {};
    var slots = [
      { slot: "breakfast", cat: "breakfast" },
      { slot: "lunch", cat: "lunch" },
      { slot: "snack1", cat: "snack" },
      { slot: "dinner", cat: "dinner" },
      { slot: "snack2", cat: "snack" },
    ];
    return slots.map(function (s, i) {
      var meal;
      if (overrides[s.slot]) meal = Anchor.byId(overrides[s.slot]);
      if (!meal) meal = Anchor.pickForDay(s.cat, doy + (s.slot === "snack2" ? 3 : i));
      return { slot: s.slot, cat: s.cat, meal: meal };
    });
  }

  function render(root, params) {
    var state = Anchor.store.get();
    var dateKey = (params && params.date) || Anchor.util.todayKey();
    var date = Anchor.util.keyToDate(dateKey);
    var isToday = dateKey === Anchor.util.todayKey();
    var plan = plannedMeals(dateKey);
    var targets = Anchor.calc.targets(state.profile);
    var totals = Anchor.calc.sumMeals(plan.map(function (p) { return p.meal; }));
    var cov = Anchor.calc.coverage(totals, targets);
    var log = Anchor.store.getLog(dateKey);
    var tip = Anchor.tips[Anchor.dayOfYear(date) % Anchor.tips.length];
    var booster = Anchor.boosters[Anchor.dayOfYear(date) % Anchor.boosters.length];

    var schedule = {};
    state.schedule.forEach(function (s) { schedule[s.id] = s; });

    var wrap = h("div.view.view-today", {}, [
      /* hero */
      h("div.today-hero", {}, [
        h("div.today-hero-row", {}, [
          h("button.daynav", { "aria-label": "Previous day", onClick: function () {
            Anchor.router.go("today", { date: Anchor.util.todayKey(Anchor.util.addDays(date, -1)) });
          } }, "‹"),
          h("div.today-hero-center", {}, [
            h("div.today-eyebrow", {}, isToday ? "Today" : Anchor.util.weekdayName(date.getDay())),
            h("h1.today-date", {}, Anchor.util.fmtLong(date)),
          ]),
          h("button.daynav", { "aria-label": "Next day", onClick: function () {
            Anchor.router.go("today", { date: Anchor.util.todayKey(Anchor.util.addDays(date, 1)) });
          } }, "›"),
        ]),
        h("p.today-mantra", {}, "No hunger cue is coming. Eat on the alarm — you need the surplus."),
      ]),

      /* day totals vs targets */
      ui.card([
        h("div.rings-row", {}, [
          h("div.ring-block", {}, [
            Anchor.charts.ring({ value: cov.calories, label: "cal", color: "var(--accent)" }),
            h("div.ring-caption", {}, totals.calories + " / " + targets.calories + " cal"),
          ]),
          h("div.ring-block", {}, [
            Anchor.charts.ring({ value: cov.protein, label: "protein", color: "var(--good)" }),
            h("div.ring-caption", {}, totals.protein + " / " + targets.protein + "g protein"),
          ]),
          h("div.ring-block", {}, [
            Anchor.charts.ring({ value: cov.fiber, label: "fiber", color: "var(--warn)" }),
            h("div.ring-caption", {}, totals.fiber + " / " + targets.fiber + "g fiber"),
          ]),
        ]),
        h("div.today-cost", {}, [
          h("span", {}, "Today's plan: "),
          h("strong", {}, money(totals.cost)),
          h("span.muted", {}, "  ·  ~" + money(totals.cost * 30) + "/mo at this rate"),
        ]),
        cov.calories < 0.9 ? h("div.nudge", {}, [
          "⚠️ Below your surplus. Add a booster: ",
          h("strong", {}, booster.text),
          " (+" + booster.kcal + " cal).",
        ]) : h("div.nudge.nudge-good", {}, "✓ Plan covers your gain target. Just eat it."),
      ]),

      /* now strip: next meal + water + meds (only for today) */
      isToday ? nowStrip(dateKey, state) : null,

      /* schedule / meals */
      ui.sectionHeader("Your day, already decided", "Tap a meal for the recipe. Check it off when you eat."),
      h("div.timeline", {}, plan.map(function (p) {
        var sch = schedule[p.slot] || {};
        var checked = log.marks && log.marks[p.slot];
        var cat = Anchor.categories.find(function (c) { return c.id === p.cat; });
        return h("div.timeline-item" + (checked ? ".done" : ""), {}, [
          h("div.timeline-time", {}, [
            h("button.check-circle" + (checked ? ".on" : ""), {
              "aria-label": "Mark " + p.slot + " eaten",
              onClick: function () {
                Anchor.store.toggleMealMark(dateKey, p.slot);
                Anchor.router.refresh();
              },
            }, checked ? "✓" : ""),
            h("div.timeline-clock", {}, sch.time || cat.alarm),
          ]),
          h("div.timeline-body", {}, [
            h("div.timeline-slot", {}, (cat ? cat.emoji + " " : "") + (cat ? cat.label : p.slot)),
            h("button.timeline-meal", {
              onClick: function () { Anchor.ui.openMeal(p.meal); },
            }, [
              h("span.timeline-meal-name", {}, p.meal.emoji + " " + p.meal.name),
              h("span.timeline-meal-macros", {}, "P" + p.meal.protein + " · " + p.meal.calories + "cal · " + money(p.meal.cost)),
            ]),
            sch.anchor ? h("div.timeline-anchor", {}, "⚓ " + sch.anchor) : null,
            h("div.timeline-actions", {}, [
              h("button.linkbtn", {
                onClick: function () { swapMeal(dateKey, p); },
              }, "↻ swap"),
              p.meal.gear === "cook" ? h("button.linkbtn", {
                onClick: function () { Anchor.router.go("cookday", { meal: p.meal.id }); },
              }, "🔥 batch this") : null,
            ]),
          ]),
        ]);
      })),

      /* depleted-day quick access */
      ui.card([
        h("div.crash-quick", {}, [
          h("div", {}, [
            h("h3.crash-quick-title", {}, "🔋 Too fried to cook?"),
            h("p.muted", {}, Anchor.crash.meals[1].text),
          ]),
          h("button.btn.btn-ghost", { onClick: function () { Anchor.router.go("learn", { tab: "crash" }); } }, "Depleted-day plan"),
        ]),
      ]),

      /* tip */
      h("div.tip-banner", {}, [h("span.tip-emoji", {}, "💡"), h("span", {}, tip)]),
    ]);

    Anchor.util.append(root, wrap);
  }

  function nextMealLabel(state) {
    var now = new Date();
    var mins = now.getHours() * 60 + now.getMinutes();
    var upcoming = null;
    state.schedule.forEach(function (s) {
      var p = (s.time || "00:00").split(":");
      var t = (+p[0]) * 60 + (+p[1]);
      if (t >= mins && (!upcoming || t < upcoming.t)) upcoming = { t: t, s: s };
    });
    if (!upcoming) return { text: "Kitchen's winding down — last snack if you're under target.", when: "" };
    var diff = upcoming.t - mins;
    var when = diff < 60 ? "in " + diff + " min" : "in " + Math.round(diff / 60) + "h " + (diff % 60) + "m";
    return { text: upcoming.s.label, when: when };
  }

  function nowStrip(dateKey, state) {
    var nm = nextMealLabel(state);
    var water = Anchor.store.getWater(dateKey);
    var goal = state.waterGoal;
    var med = Anchor.store.getMed(dateKey);
    var waterEl = h("strong", {}, water + "/" + goal);
    return ui.card([
      h("div.now-strip", {}, [
        h("div.now-next", {}, [
          h("div.now-label", {}, "⏭ Next"),
          h("div.now-meal", {}, nm.text),
          nm.when ? h("div.now-when", {}, nm.when) : null,
        ]),
        h("div.now-quick", {}, [
          h("button.now-chip", {
            onClick: function () { Anchor.store.addWater(1); waterEl.textContent = Anchor.store.getWater(dateKey) + "/" + state.waterGoal; },
          }, ["💧 +", waterEl]),
          h("button.now-chip" + (med.taken ? ".on" : ""), {
            onClick: function () { Anchor.store.setMed({ taken: !med.taken }); Anchor.router.refresh(); },
          }, med.taken ? "💊 ✓" : "💊 meds"),
        ]),
      ]),
    ], { class: "now-card" });
  }

  function swapMeal(dateKey, p) {
    var options = Anchor.byCategory(p.cat);
    var list = h("div.swap-list", {}, options.map(function (m) {
      return h("button.swap-option" + (m.id === p.meal.id ? ".current" : ""), {
        onClick: function () {
          Anchor.store.setOverride(dateKey, p.slot, m.id);
          Anchor.ui.closeModal();
          Anchor.util.toast("Swapped to " + m.name);
          Anchor.router.refresh();
        },
      }, [
        h("span.swap-emoji", {}, m.emoji),
        h("div.swap-text", {}, [
          h("div.swap-name", {}, m.name),
          h("div.swap-macros", {}, "P" + m.protein + " · " + m.calories + "cal · " + Anchor.util.money(m.cost)),
        ]),
        Anchor.ui.gearBadge(m.gear),
      ]);
    }));
    Anchor.ui.modal(h("div", {}, [
      h("h2.modal-title", {}, "Swap your " + p.cat),
      h("p.muted", {}, "Pick anything — no wrong answer. Or keep what's there."),
      list,
    ]));
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.today = { render: render, title: "Today" };
})(window.Anchor = window.Anchor || {});
