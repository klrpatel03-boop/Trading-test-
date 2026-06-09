/* ============================================================================
 * Anchor — views/flavor.js
 * The Flavor Lab — for the cook. Spice blends, sauces, rescue moves, and core
 * techniques. "Spend your novelty budget on flavor and technique, not on
 * re-deciding the meal." Same cheap base ingredients, infinite variety.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;
  var F = Anchor.flavor;

  function render(root) {
    var wrap = h("div.view.view-flavor", {}, [
      ui.sectionHeader("Flavor lab", "You love cooking — so this is where the variety lives. Same cheap staples, new flavor every time, zero new decisions about what to make."),

      ui.card([
        h("p", {}, [
          "The trap for an ADHD cook is chasing novelty by re-deciding the whole meal (→ a new shopping list → overwhelm → takeout). The fix: keep the ",
          h("strong", {}, "base"), " boring and constant, and get all your novelty from ",
          h("strong", {}, "spices, sauces, and technique"), ". A pot of lentils becomes ten different dinners.",
        ]),
      ]),

      ui.sectionHeader("Spice blends", "Mix a jar of each (ratios shown). Sprinkle to transform a base."),
      h("div.flavor-grid", {}, F.blends.map(function (b) {
        return h("div.flavor-card", {}, [
          h("div.flavor-head", {}, [h("span.flavor-emoji", {}, b.emoji), h("h4", {}, b.name)]),
          h("div.flavor-mix", {}, b.mix),
          h("div.flavor-on", {}, "On: " + b.on),
        ]);
      })),

      ui.sectionHeader("5-minute sauces", "A sauce turns plain protein + carb into a meal. These are pantry-cheap."),
      h("div.flavor-grid", {}, F.sauces.map(function (s) {
        return h("div.flavor-card", {}, [
          h("div.flavor-head", {}, [h("span.flavor-emoji", {}, s.emoji), h("h4", {}, s.name)]),
          h("div.flavor-mix", {}, s.mix),
          h("div.flavor-on", {}, "On: " + s.on),
        ]);
      })),

      ui.sectionHeader("Rescue a meh meal", "When something's off, it's almost always one of these."),
      ui.card([
        h("div.rescue-list", {}, F.rescue.map(function (r) {
          return h("div.rescue-row", {}, [
            h("span.rescue-problem", {}, r.problem),
            h("span.rescue-fix", {}, r.fix),
          ]);
        })),
      ]),

      ui.sectionHeader("Core techniques worth knowing", "Small habits that punch way above their effort."),
      h("div.technique-list", {}, F.techniques.map(function (t) {
        return h("div.technique-card", {}, [
          h("h4.technique-name", {}, t.name),
          h("p.technique-why", {}, t.why),
        ]);
      })),

      h("div.nudge.nudge-good", {}, "💡 Want to go deeper on a technique? The Recipes tab links Serious Eats — they explain the 'why' behind every method."),
    ]);

    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.flavor = { render: render, title: "Flavor" };
})(window.Anchor = window.Anchor || {});
