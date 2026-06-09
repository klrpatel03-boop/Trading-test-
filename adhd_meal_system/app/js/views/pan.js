/* ============================================================================
 * Anchor — views/pan.js
 * Your one-and-only, buy-it-for-life 6-qt pan, tracked to the dollar. Every
 * cook drops its cost-per-use. Milestones march from $5 → $1 → $0.20. This
 * turns "I spent $250" into a motivating number that only ever goes down.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  // Your stated rhythm: "a few big batches a week."
  var COOKS_PER_WEEK = 2.5;
  var SERVINGS_PER_COOK = 5; // a big 6-qt batch ≈ 5 servings

  var MILESTONES = [
    { cpu: 5.00, label: "$5 / use" },
    { cpu: 2.00, label: "$2 / use" },
    { cpu: 1.00, label: "$1 / use", flag: "the dollar" },
    { cpu: 0.50, label: "50¢ / use" },
    { cpu: 0.20, label: "20¢ / use", flag: "5× under a dollar" },
  ];

  function usesFor(cost, cpu) { return Math.ceil(cost / cpu); }

  function etaWeeks(usesNeeded, current) {
    return Math.max(0, (usesNeeded - current) / COOKS_PER_WEEK);
  }
  function etaLabel(weeks) {
    if (weeks <= 0) return "done";
    if (weeks < 8) return "~" + Math.ceil(weeks) + " weeks";
    if (weeks < 78) return "~" + Math.round(weeks / 4.33) + " months";
    return "~" + (Math.round((weeks / 52) * 10) / 10) + " years";
  }

  function render(root) {
    var st = Anchor.store.panStats();
    var uses = st.uses;
    var cost = st.cost;
    var cpu = st.costPerUse;

    var nextMs = MILESTONES.find(function (m) { return cpu > m.cpu; });
    var lastHit = MILESTONES.filter(function (m) { return cpu <= m.cpu; }).pop();

    var heroHost = h("div.pan-hero-host", {});
    function buildHero() {
      var s2 = Anchor.store.panStats();
      Anchor.util.clear(heroHost);
      heroHost.appendChild(h("div.pan-hero", {}, [
        h("div.pan-cpu", {}, [
          h("span.pan-cpu-num", {}, s2.uses > 0 ? money(s2.costPerUse) : money(s2.cost)),
          h("span.pan-cpu-unit", {}, s2.uses > 0 ? "/ use" : "so far"),
        ]),
        h("div.pan-hero-sub", {}, s2.name),
        h("div.pan-hero-stats", {}, [
          ui.stat(s2.uses, "Cooks logged"),
          ui.stat(money(s2.cost), "Invested"),
          ui.stat("~" + s2.uses * SERVINGS_PER_COOK, "Meals served"),
        ]),
        h("button.btn.btn-primary.btn-block.pan-cook-btn", {
          onClick: function () {
            Anchor.store.addPanCook(1);
            Anchor.util.toast("Cook #" + Anchor.store.panUses() + " logged — price just dropped");
            Anchor.router.refresh();
          },
        }, "🍳 I cooked in it (+1)"),
      ]));
    }

    var wrap = h("div.view.view-pan", {}, [
      ui.sectionHeader("My pan", "Your one-and-only, buy-it-for-life pan — tracked to the dollar. Every cook makes it cheaper."),

      heroHost,

      /* milestones ladder */
      ui.card([
        h("h3.detail-h", {}, "The road down"),
        h("div.pan-ladder", {}, MILESTONES.map(function (m) {
          var need = usesFor(cost, m.cpu);
          var hit = cpu <= m.cpu;
          var weeks = etaWeeks(need, uses);
          return h("div.pan-rung" + (hit ? ".hit" : ""), {}, [
            h("span.pan-rung-dot", {}, hit ? "✓" : ""),
            h("div.pan-rung-main", {}, [
              h("span.pan-rung-label", {}, m.label + (m.flag ? "  ·  " + m.flag : "")),
              h("span.pan-rung-need", {}, hit ? "reached" : need + " cooks  ·  " + etaLabel(weeks)),
            ]),
          ]);
        })),
        nextMs ? h("div.nudge", {}, [
          "Next: ", h("strong", {}, nextMs.label),
          " at " + usesFor(cost, nextMs.cpu) + " cooks — that's ",
          h("strong", {}, (usesFor(cost, nextMs.cpu) - uses) + " more"),
          " (" + etaLabel(etaWeeks(usesFor(cost, nextMs.cpu), uses)) + " at a few batches/week).",
        ]) : h("div.nudge.nudge-good", {}, "You've driven it under 20¢ a use. This pan has paid for itself many times over."),
        h("p.muted", {}, "Logged automatically when you check off a cooked dinner on Today, or tap the button above. A big 6-qt batch ≈ 5 servings, so each cook is really ~5 cheap meals."),
      ]),

      /* what to cook in it */
      ui.card([
        h("div.section-head", {}, [
          h("h3.detail-h", {}, "🍳 Cook something in it"),
          h("button.linkbtn", { onClick: function () { Anchor.router.go("menu", { tag: "one-pot" }); } }, "see all"),
        ]),
        h("p.muted", {}, "Big one-pan batches that suit it — and rack up your cooks fastest:"),
        h("div.pan-recipe-row", {}, Anchor.meals.filter(Anchor.fitsBigPan).slice(0, 6).map(function (m) {
          return h("button.pan-recipe-chip", { onClick: function () { ui.openMeal(m); } }, [
            h("span", {}, m.emoji + " " + m.name),
          ]);
        })),
      ]),

      /* the philosophy */
      h("div.pan-philosophy", {}, [
        h("strong", {}, "Buy it for life: "),
        "you bought one great pan instead of replacing cheap ones every couple years. " +
        "Cook in it ~2–3× a week and within a couple years it's under $1 a use — and it keeps " +
        "dropping forever. The cheapest cookware is the one you use a thousand times.",
      ]),

      h("p.disclaimer", {}, "Adjust the pan's name, price, or reset the counter in Settings → Kitchen & garden."),
    ]);

    buildHero();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.pan = { render: render, title: "My pan" };
})(window.Anchor = window.Anchor || {});
