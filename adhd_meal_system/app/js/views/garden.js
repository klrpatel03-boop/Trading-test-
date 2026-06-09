/* ============================================================================
 * Anchor — views/garden.js
 * "From your garden + kit." Turns your kale surplus into a plan and points you
 * at the recipes that suit your big 6-qt pan. Personalized to what you grow.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root) {
    var state = Anchor.store.get();
    var garden = state.garden || [];
    var kit = state.kit || [];
    var kaleRecipes = Anchor.kaleRecipes();
    var bigPan = Anchor.meals.filter(Anchor.fitsBigPan);

    var wrap = h("div.view.view-garden", {}, [
      ui.sectionHeader("From your garden", "You cook, and you grow — so the system uses what you've got. Free greens are free fiber."),

      /* KIT */
      kit.length ? ui.card([
        h("h3.detail-h", {}, "🍳 Your kit"),
        kit.map(function (k) {
          return h("div.kit-row", {}, [
            h("div.kit-name", {}, k.name),
            k.note ? h("p.muted", {}, k.note) : null,
          ]);
        }),
        h("button.btn.btn-ghost.btn-sm", {
          onClick: function () { Anchor.router.go("menu", { tag: "one-pot" }); },
        }, "Show one-pan recipes for it (" + bigPan.length + ")"),
      ]) : null,

      /* GARDEN crops */
      h("div.garden-crops", {}, garden.map(function (g) {
        var abundant = g.supply === "abundant";
        return ui.card([
          h("div.crop-head", {}, [
            h("span.crop-emoji", {}, g.emoji || "🌱"),
            h("div", {}, [
              h("h3.crop-name", {}, g.crop + (g.plants ? "  ·  " + g.plants + " plant" + (g.plants > 1 ? "s" : "") : "")),
              h("span.crop-supply" + (abundant ? ".abundant" : ".trickle"), {}, abundant ? "abundant" : "trickle — garnish only"),
            ]),
          ]),
          g.note ? h("p.crop-note", {}, g.note) : null,
        ], { class: "crop-card" });
      })),

      /* KALE PLAN (only if you grow kale) */
      garden.some(function (g) { return /kale/i.test(g.crop); }) ? h("div", {}, [
        ui.sectionHeader("Your kale plan", "7 plants is a steady surplus — here's how to keep up with it."),
        h("div.garden-tips", {}, [
          tipCard("✂️ Harvest", Anchor.gardenTips.harvest),
          tipCard("❄️ Preserve a surplus", Anchor.gardenTips.preserve),
          tipCard("🍲 Use a big bunch", Anchor.gardenTips.useBig),
        ]),

        ui.sectionHeader("Recipes that eat your kale", kaleRecipes.length + " in your menu use kale or greens you can swap kale into."),
        h("div.menu-grid", {}, kaleRecipes.map(function (m) { return ui.mealCard(m); })),
      ]) : null,

      h("div.tip-banner", {}, [
        h("span.tip-emoji", {}, "🌿"),
        h("span", {}, "Perpetual spinach is a trickle at 1–2 leaves/week — don't plan a meal around it. Tear a leaf into an omelette or drop it on top of a finished bowl."),
      ]),
    ]);

    Anchor.util.append(root, wrap);
  }

  function tipCard(title, items) {
    return h("div.garden-tip-card", {}, [
      h("h4.garden-tip-title", {}, title),
      h("ul.detail-list", {}, items.map(function (t) { return h("li", {}, t); })),
    ]);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.garden = { render: render, title: "Garden" };
})(window.Anchor = window.Anchor || {});
