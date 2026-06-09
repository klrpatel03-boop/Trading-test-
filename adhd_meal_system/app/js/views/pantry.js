/* ============================================================================
 * Anchor — views/pantry.js
 * The "floor shelf" / crash-shelf inventory. Track what no-cook staples you
 * have on hand so depleted-you always has something good and closest. Low-stock
 * items flag for the next grocery run. Beats object-permanence ("forgot it
 * existed") which is the real ADHD-kitchen budget + nutrition leak.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  // Default floor-shelf items (the things depleted-you reaches for).
  var DEFAULT_PANTRY = [
    { name: "Ready-to-drink shakes", target: 6, zone: "fridge" },
    { name: "Greek yogurt / cottage cheese (tub)", target: 1, zone: "fridge" },
    { name: "Leftovers on hand", target: 4, zone: "fridge" },
    { name: "Hard-boiled eggs", target: 6, zone: "fridge" },
    { name: "Cheese", target: 1, zone: "fridge" },
    { name: "Bananas / apples", target: 6, zone: "fridge" },
    { name: "Canned tuna / chicken (pouches)", target: 4, zone: "pantry" },
    { name: "Microwave rice pouches", target: 4, zone: "pantry" },
    { name: "Canned beans", target: 4, zone: "pantry" },
    { name: "Peanut butter", target: 1, zone: "pantry" },
    { name: "Nuts / trail mix", target: 2, zone: "pantry" },
    { name: "Oats", target: 1, zone: "pantry" },
    { name: "Olive oil", target: 1, zone: "pantry" },
  ];

  function getPantry() {
    var s = Anchor.store.get();
    if (!s.pantry) {
      Anchor.store.update(function (st) {
        st.pantry = DEFAULT_PANTRY.map(function (p) { return { name: p.name, qty: 0, target: p.target, zone: p.zone }; });
      });
    }
    return Anchor.store.get().pantry;
  }

  function render(root) {
    var pantry = getPantry();

    var lowHost = h("div.pantry-low", {});
    var zonesHost = h("div.pantry-zones", {});

    function setQty(name, qty) {
      Anchor.store.update(function (s) {
        var it = s.pantry.find(function (p) { return p.name === name; });
        if (it) it.qty = Math.max(0, qty);
      });
      rebuild();
    }

    function rebuild() {
      pantry = Anchor.store.get().pantry;
      var low = pantry.filter(function (p) { return p.qty < Math.ceil(p.target / 2); });

      Anchor.util.clear(lowHost);
      if (low.length) {
        lowHost.appendChild(ui.card([
          h("h3.detail-h", {}, "⚠️ Restock on your next run (" + low.length + ")"),
          h("p.muted", {}, "Never let the floor shelf empty — it's your cheap insurance against a takeout spiral."),
          h("div.low-chips", {}, low.map(function (p) {
            return ui.chip(p.name + " (" + p.qty + "/" + p.target + ")", { kind: "warn" });
          })),
          h("button.btn.btn-ghost.btn-sm", {
            onClick: function () {
              Anchor.store.update(function (s) {
                low.forEach(function (lp) { s.grocery[lp.name] = false; });
              });
              Anchor.util.toast("Low items flagged — check Groceries");
              Anchor.router.go("groceries");
            },
          }, "Add low items to grocery list"),
        ], { class: "card-warn" }));
      } else {
        lowHost.appendChild(h("div.nudge.nudge-good", {}, "✓ Floor shelf is well stocked. Depleted-you is covered."));
      }

      Anchor.util.clear(zonesHost);
      [{ id: "fridge", label: "🧊 Fridge zone" }, { id: "pantry", label: "🥫 Pantry shelf" }].forEach(function (zone) {
        var items = pantry.filter(function (p) { return p.zone === zone.id; });
        zonesHost.appendChild(ui.card([
          h("h3.detail-h", {}, zone.label),
          h("div.pantry-list", {}, items.map(function (p) {
            var ratio = p.target ? p.qty / p.target : 1;
            var status = ratio >= 1 ? "ok" : ratio >= 0.5 ? "mid" : "low";
            return h("div.pantry-item.stock-" + status, {}, [
              h("div.pantry-item-main", {}, [
                h("span.pantry-name", {}, p.name),
                h("span.pantry-target.muted", {}, "keep " + p.target),
              ]),
              h("div.stepper.stepper-sm", {}, [
                h("button.stepper-btn", { onClick: function () { setQty(p.name, p.qty - 1); } }, "−"),
                h("span.stepper-val", {}, p.qty),
                h("button.stepper-btn", { onClick: function () { setQty(p.name, p.qty + 1); } }, "+"),
              ]),
            ]);
          })),
        ]));
      });
    }

    var wrap = h("div.view.view-pantry", {}, [
      ui.sectionHeader("Floor shelf", "Track your no-cook staples. When executive function is gone, you eat what's closest — so keep the good cheap food stocked and in reach."),
      lowHost,
      zonesHost,
      h("p.disclaimer", {}, "The biggest ADHD-kitchen budget leak is food that rots forgotten. Tracking the shelf beats couponing."),
    ]);

    rebuild();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.pantry = { render: render, title: "Shelf" };
})(window.Anchor = window.Anchor || {});
