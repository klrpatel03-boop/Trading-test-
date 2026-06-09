/* ============================================================================
 * Anchor — views/wellness.js
 * Hydration + medication tracker. Why it's here: stimulants dehydrate you, and
 * dehydration mimics both hunger and fatigue — so water is a quiet lever on
 * eating and energy. And logging "ate before meds" protects your best appetite
 * window. Small, low-pressure, high-leverage.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root) {
    var todayKey = Anchor.util.todayKey();
    var state = Anchor.store.get();
    var cups = Anchor.store.getWater(todayKey);
    var goal = state.waterGoal;
    var med = Anchor.store.getMed(todayKey);

    /* hydration glasses */
    var glassesHost = h("div.glasses", {});
    function buildGlasses() {
      Anchor.util.clear(glassesHost);
      var c = Anchor.store.getWater(todayKey);
      var g = Anchor.store.get().waterGoal;
      for (var i = 0; i < g; i++) {
        (function (idx) {
          glassesHost.appendChild(h("button.glass" + (idx < c ? ".full" : ""), {
            "aria-label": "Cup " + (idx + 1),
            onClick: function () {
              // tapping fills up to this glass, or empties it if it's the last full one
              var cur = Anchor.store.getWater(todayKey);
              var target = (idx + 1 === cur) ? idx : idx + 1;
              Anchor.store.update(function (s) { s.water[todayKey] = target; });
              buildGlasses();
              countEl.textContent = Anchor.store.getWater(todayKey) + " / " + Anchor.store.get().waterGoal + " cups";
            },
          }, idx < c ? "💧" : ""));
        })(i);
      }
    }
    var countEl = h("strong", {}, cups + " / " + goal + " cups");

    var wrap = h("div.view.view-wellness", {}, [
      ui.sectionHeader("Hydration & meds", "Two quiet levers on appetite and energy. Tap, don't agonize."),

      ui.card([
        h("div.wellness-head", {}, [
          h("h3.detail-h", {}, "💧 Water today"),
          h("span.muted", {}, countEl),
        ]),
        glassesHost,
        h("div.water-actions", {}, [
          h("button.btn.btn-ghost.btn-sm", { onClick: function () { Anchor.store.addWater(1); buildGlasses(); countEl.textContent = Anchor.store.getWater(todayKey) + " / " + Anchor.store.get().waterGoal + " cups"; } }, "+1 cup"),
          h("button.btn.btn-ghost.btn-sm", { onClick: function () { setGoal(); } }, "Set goal"),
        ]),
        h("p.muted", {}, "Dehydration feels like hunger and fatigue — both of which already mess with ADHD + meds. Easy water = steadier appetite and focus."),
      ]),

      ui.card([
        h("h3.detail-h", {}, "💊 Medication"),
        ui.toggle("Took meds today", med.taken, function (v) { Anchor.store.setMed({ taken: v }); Anchor.router.refresh(); }),
        ui.toggle("Ate protein BEFORE meds peaked", med.ateFirst, function (v) { Anchor.store.setMed({ ateFirst: v }); }),
        h("div.med-time-row", {}, [
          h("label.setting-label", {}, "Time taken (optional)"),
          h("input.input", { type: "time", value: med.time || "", onChange: function (e) { Anchor.store.setMed({ time: e.target.value }); } }),
        ]),
        h("div.nudge", {}, "Your best appetite window is BEFORE meds fully kick in. Front-load protein then — once appetite drops midday, switch to liquid calories."),
      ]),

      ui.card([
        h("h3.detail-h", {}, "Why this matters for gaining"),
        h("ul.rule-list", {}, [
          "Meds suppress appetite → you must eat on the alarm, not on hunger.",
          "Best appetite = morning, before peak. Eat real food then.",
          "Midday dead zone → drink calories (shake) instead of skipping.",
          "Stay hydrated so 'I feel off' isn't actually just thirst.",
        ].map(function (x) { return h("li", {}, [h("span.rule-dot", {}, "→"), x]); })),
      ]),
    ]);

    function setGoal() {
      var input = h("input.input", { type: "number", min: "1", max: "16", value: Anchor.store.get().waterGoal });
      Anchor.ui.modal(h("div", {}, [
        h("h2.modal-title", {}, "Daily water goal"),
        h("label.setting-label", {}, "Cups per day"),
        input,
        h("div.modal-actions", {}, [
          h("button.btn.btn-primary", { onClick: function () {
            Anchor.store.setWaterGoal(+input.value || 8);
            Anchor.ui.closeModal();
            Anchor.router.refresh();
          } }, "Save"),
          h("button.btn.btn-ghost", { onClick: Anchor.ui.closeModal }, "Cancel"),
        ]),
      ]));
    }

    buildGlasses();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.wellness = { render: render, title: "Hydration" };
})(window.Anchor = window.Anchor || {});
