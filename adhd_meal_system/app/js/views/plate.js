/* ============================================================================
 * Anchor — views/plate.js
 * Build-a-Plate. Combine a protein + carb + veg + fat/sauce from the cheap-food
 * index and watch live macros + cost update. Teaches the "protein-first, then
 * fiber, then a dense booster" pattern by doing — and every plate is a real,
 * cheap meal you can assemble. Great for low-decision days: tap one of each.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  function pickList(group) {
    return Anchor.foods.filter(function (f) { return f.group === group; });
  }

  function render(root) {
    var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

    var slots = [
      { key: "protein", label: "Protein", emoji: "🍗", groups: ["protein"] },
      { key: "carb", label: "Carb", emoji: "🍚", groups: ["grain"] },
      { key: "veg", label: "Veg / fruit", emoji: "🥦", groups: ["veg", "fruit"] },
      { key: "fat", label: "Fat / sauce", emoji: "🥑", groups: ["fat", "dairy"] },
    ];
    var chosen = {
      protein: Anchor.foods.find(function (f) { return f.name === "Eggs"; }),
      carb: Anchor.foods.find(function (f) { return f.name === "Oats"; }),
      veg: Anchor.foods.find(function (f) { return f.name === "Frozen mixed veg"; }),
      fat: Anchor.foods.find(function (f) { return f.name === "Peanut butter"; }),
    };

    var totalsHost = h("div.plate-totals", {});
    var slotsHost = h("div.plate-slots", {});

    function totals() {
      var t = { protein: 0, fiber: 0, cal: 0, cost: 0 };
      Object.keys(chosen).forEach(function (k) {
        var f = chosen[k];
        if (!f) return;
        t.protein += f.protein; t.fiber += f.fiber; t.cal += f.cal; t.cost += f.cost;
      });
      return t;
    }

    function rebuildTotals() {
      var t = totals();
      var targets = Anchor.calc.targets(Anchor.store.get().profile);
      Anchor.util.clear(totalsHost);
      totalsHost.appendChild(h("div.plate-plate", {}, [
        h("div.plate-emoji-row", {}, slots.map(function (s) {
          return h("span.plate-slot-emoji", {}, chosen[s.key] ? chosen[s.key].emoji : "➕");
        })),
        h("div.plate-macro-row", {}, [
          ui.stat(t.protein + "g", "Protein", { accent: true }),
          ui.stat(t.fiber + "g", "Fiber"),
          ui.stat(t.cal, "Calories"),
          ui.stat(money(t.cost), "Cost"),
        ]),
        h("div.plate-eval", {}, evaluate(t, targets)),
      ]));
    }

    function evaluate(t, targets) {
      var perMeal = targets.protein / 4; // rough per-eating-occasion protein
      var notes = [];
      if (t.protein >= 25) notes.push({ ok: true, text: "Solid protein hit (" + t.protein + "g)." });
      else notes.push({ ok: false, text: "Light on protein — add an egg, beans, or a scoop of whey." });
      if (t.fiber >= 8) notes.push({ ok: true, text: "Good fiber (" + t.fiber + "g)." });
      else notes.push({ ok: false, text: "Add beans/veg/oats for fiber." });
      if (Anchor.store.get().profile.goal === "gain") {
        if (t.cal >= 450) notes.push({ ok: true, text: "Dense enough for a gaining meal." });
        else notes.push({ ok: false, text: "For gaining, add olive oil / nut butter / more carb." });
      }
      return notes.map(function (n) {
        return h("div.plate-note" + (n.ok ? ".ok" : ".todo"), {}, [
          h("span", {}, n.ok ? "✓" : "→"), h("span", {}, n.text),
        ]);
      });
    }

    function rebuildSlots() {
      Anchor.util.clear(slotsHost);
      slots.forEach(function (s) {
        var options = [];
        s.groups.forEach(function (g) { options = options.concat(pickList(g)); });
        var select = h("select.select", {
          onChange: function (e) {
            chosen[s.key] = Anchor.foods.find(function (f) { return f.name === e.target.value; });
            rebuildTotals();
          },
        }, options.map(function (f) {
          return h("option", { value: f.name, selected: chosen[s.key] && chosen[s.key].name === f.name },
            f.emoji + " " + f.name + "  (P" + f.protein + " · " + money(f.cost) + ")");
        }));
        slotsHost.appendChild(h("div.plate-slot", {}, [
          h("label.plate-slot-label", {}, s.emoji + " " + s.label),
          select,
        ]));
      });
    }

    function randomize() {
      slots.forEach(function (s) {
        var options = [];
        s.groups.forEach(function (g) { options = options.concat(pickList(g)); });
        chosen[s.key] = options[Math.floor(Math.random() * options.length)];
      });
      rebuildSlots();
      rebuildTotals();
    }

    var wrap = h("div.view.view-plate", {}, [
      ui.sectionHeader("Build a plate", "Pick one of each. Watch protein, fiber, calories, and cost update live. Every combo is a real cheap meal you can assemble."),
      totalsHost,
      ui.card([slotsHost, h("div.plate-actions", {}, [
        h("button.btn.btn-ghost", { onClick: randomize }, "🎲 Surprise me"),
      ])]),
      h("div.tip-banner", {}, [h("span.tip-emoji", {}, "💡"), h("span", {}, "The winning pattern: a cheap protein + a cheap carb + something with fiber + a dense fat for calories. Do that and you barely need recipes.")]),
    ]);

    rebuildSlots();
    rebuildTotals();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.plate = { render: render, title: "Build a plate" };
})(window.Anchor = window.Anchor || {});
