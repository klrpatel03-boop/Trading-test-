/* ============================================================================
 * Anchor — views/calculator.js
 * Macro & calorie target calculator for lean weight gain. Live updates as you
 * change weight/goal/activity, with a plain-language breakdown and how-to-hit-it
 * guidance specific to appetite-suppressed gaining.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function render(root) {
    var profile = Object.assign({}, Anchor.store.get().profile);

    var resultEl = h("div.calc-result", {});

    function recompute() {
      var t = Anchor.calc.targets(profile);
      Anchor.util.clear(resultEl);
      resultEl.appendChild(buildResult(t));
    }

    function buildResult(t) {
      return h("div", {}, [
        h("div.calc-headline", {}, [
          h("div.calc-big", {}, [h("span.calc-num", {}, t.calories), h("span.calc-unit", {}, "cal/day")]),
          h("div.calc-headline-sub", {}, t.goal === "gain"
            ? "Maintenance ~" + t.maintenance + " + a " + Math.abs(t.surplus) + " surplus to gain"
            : t.goal === "cut" ? "Maintenance ~" + t.maintenance + " − a " + Math.abs(t.surplus) + " deficit"
            : "Maintenance ~" + t.maintenance),
        ]),
        h("div.calc-macros", {}, [
          macroTile(t.protein + "g", "Protein", "The #1 number. ~" + t.proteinPerLb + "g/lb.", "var(--good)"),
          macroTile(t.carbs + "g", "Carbs", "Fuel + the easiest surplus calories.", "var(--accent)"),
          macroTile(t.fat + "g", "Fat", "Dense calories — your gaining friend.", "var(--warn)"),
          macroTile(t.fiber + "g", "Fiber", "Adequate, not maxed (it fills you up).", "var(--muted-strong)"),
        ]),
        h("div.calc-weekly", {}, [
          h("span.muted", {}, "Target weight change: "),
          h("strong", {}, t.weeklyTarget),
        ]),

        t.goal === "gain" ? ui.card([
          h("h4.detail-h", {}, "How to hit a surplus when meds kill your appetite"),
          h("ul.rule-list", {}, [
            "Drink calories — a mass-gainer shake goes down when food won't (~560 cal).",
            "Add calorie-dense cheap fats: olive oil, peanut butter, nuts, whole milk.",
            "Eat on the alarm every time. You cannot wait for hunger.",
            "Spread protein across 3 meals + 2 snacks (~" + Math.round(t.protein / 5) + "g each).",
          ].map(function (x) { return h("li", {}, [h("span.rule-dot", {}, "→"), x]); })),
        ]) : null,

        h("div.calc-boosters", {}, [
          h("h4.detail-h", {}, "Cheap calorie boosters (bolt onto any meal)"),
          h("div.booster-chips", {}, Anchor.boosters.map(function (bo) {
            return ui.chip("+" + bo.kcal + " · " + bo.text, { kind: "soft" });
          })),
        ]),

        h("p.disclaimer", {}, "Educational framework only — not medical advice. For a body-comp goal on stimulant meds, a registered dietitian is worth it if accessible."),
      ]);
    }

    function macroTile(val, label, hint, color) {
      return h("div.calc-macro-tile", { style: { borderColor: color } }, [
        h("div.calc-macro-val", { style: { color: color } }, val),
        h("div.calc-macro-label", {}, label),
        h("div.calc-macro-hint", {}, hint),
      ]);
    }

    function field(label, control) {
      return h("div.calc-field", {}, [h("label.calc-label", {}, label), control]);
    }

    var weightInput = h("input.range", {
      type: "range", min: "90", max: "320", step: "1", value: profile.weightLb,
      oninput: function (e) {
        profile.weightLb = +e.target.value;
        weightVal.textContent = profile.weightLb + " lb";
        recompute();
      },
    });
    var weightVal = h("span.range-val", {}, profile.weightLb + " lb");

    var wrap = h("div.view.view-calc", {}, [
      ui.sectionHeader("Targets", "Your numbers for lean weight gain. Adjust and watch them update."),
      ui.card([
        field("Bodyweight", h("div.range-wrap", {}, [weightInput, weightVal])),
        field("Goal", ui.segmented([
          { value: "gain", label: "Gain" },
          { value: "maintain", label: "Maintain" },
          { value: "cut", label: "Cut" },
        ], profile.goal, function (v) { profile.goal = v; recompute(); })),
        field("Activity", ui.segmented([
          { value: "sedentary", label: "Low" },
          { value: "light", label: "Light" },
          { value: "moderate", label: "Moderate" },
          { value: "active", label: "Active" },
        ], profile.activity, function (v) { profile.activity = v; recompute(); })),
        h("div.calc-save", {}, [
          h("button.btn.btn-primary", {
            onClick: function () {
              Anchor.store.setProfile(profile);
              Anchor.util.toast("Saved — Today now uses these targets");
            },
          }, "Save to my profile"),
        ]),
      ]),
      resultEl,
    ]);

    recompute();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.calculator = { render: render, title: "Targets" };
})(window.Anchor = window.Anchor || {});
