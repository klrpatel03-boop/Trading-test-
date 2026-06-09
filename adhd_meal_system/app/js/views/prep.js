/* ============================================================================
 * Anchor — views/prep.js
 * The Prep Planner. Pick 1–3 batch recipes to cook this week; it computes total
 * servings / how many days of leftovers that covers, total cost, and builds a
 * CONSOLIDATED shopping list from the actual recipe ingredients (deduped). This
 * is the bridge between "I love cooking" and "every other meal is then free."
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui, money = Anchor.util.money;

  function batchMeals() {
    return Anchor.meals.filter(function (m) { return m.batch; });
  }

  function render(root) {
    var batches = batchMeals();
    // default selection: this week's distinct rotation dinners that are batch
    var selected = {};
    batches.slice(0, 2).forEach(function (m) { selected[m.id] = m.servings; });

    var summaryHost = h("div.prep-summary", {});
    var listHost = h("div.prep-shopping", {});

    function normalizeIngredient(s) {
      return s.replace(/^[\d.]+\s*/, "").replace(/\(.*?\)/g, "").trim().toLowerCase();
    }

    function rebuild() {
      var chosen = Object.keys(selected).map(function (id) { return Anchor.byId(id); }).filter(Boolean);
      var totalServings = 0, totalCost = 0, activeTime = 0;
      var bag = {};
      chosen.forEach(function (m) {
        var n = selected[m.id];
        totalServings += n;
        totalCost += m.cost * n;
        activeTime += m.prepMin;
        (m.ingredients || []).forEach(function (ing) {
          var key = normalizeIngredient(ing);
          if (!bag[key]) bag[key] = { label: ing.replace(/^[\d.]+\s*/, ""), from: [] };
          if (bag[key].from.indexOf(m.emoji) < 0) bag[key].from.push(m.emoji);
        });
      });
      var leftovers = Math.max(0, totalServings - chosen.length);
      var daysCovered = Math.ceil(leftovers / 2);

      Anchor.util.clear(summaryHost);
      if (chosen.length === 0) {
        summaryHost.appendChild(ui.empty("👩‍🍳", "Pick a recipe or two", "Tap the batch recipes below to plan your cook."));
      } else {
        summaryHost.appendChild(ui.card([
          h("div.cookday-yield", {}, [
            ui.stat(chosen.length, "Cook sessions"),
            ui.stat(totalServings, "Total servings", { accent: true }),
            ui.stat(daysCovered + " days", "Of meals covered"),
            ui.stat(money(totalCost), "Total cost"),
          ]),
          h("div.nudge.nudge-good", {}, [
            "🔥 ~" + activeTime + " min of cooking across the week buys you ",
            h("strong", {}, leftovers + " reheatable meals"),
            " — most of your breakfasts & lunches, hands-off.",
          ]),
        ]));
      }

      Anchor.util.clear(listHost);
      var keys = Object.keys(bag).sort();
      if (keys.length) {
        listHost.appendChild(ui.card([
          h("div.section-head", {}, [
            h("h3.detail-h", {}, "🛒 Consolidated shopping list"),
            h("button.btn.btn-ghost.btn-sm", { onClick: function () { exportList(chosen, bag); } }, "Copy"),
          ]),
          h("ul.prep-ing-list", {}, keys.map(function (k) {
            return h("li.prep-ing", {}, [
              h("span.prep-ing-from", {}, bag[k].from.join("")),
              h("span.prep-ing-name", {}, bag[k].label),
            ]);
          })),
          h("p.muted", {}, "Add your floor-shelf staples (Cart tab) and you're done for the week."),
        ]));
      }
    }

    function exportList(chosen, bag) {
      var lines = ["ANCHOR — COOK PLAN", "Cooking: " + chosen.map(function (m) { return m.name + " ×" + selected[m.id]; }).join(", "), "", "SHOPPING:"];
      Object.keys(bag).sort().forEach(function (k) { lines.push("  [ ] " + bag[k].label); });
      navigator.clipboard && navigator.clipboard.writeText(lines.join("\n"));
      Anchor.util.toast("Cook plan copied");
    }

    var pickerEl = h("div.prep-picker", {}, batches.map(function (m) {
      function card() {
        var on = selected[m.id] != null;
        return h("button.prep-pick" + (on ? ".on" : ""), {
          onClick: function () {
            if (selected[m.id] != null) delete selected[m.id];
            else selected[m.id] = m.servings;
            rebuildPicker();
            rebuild();
          },
        }, [
          h("span.prep-pick-emoji", {}, m.emoji),
          h("span.prep-pick-name", {}, m.name),
          h("span.prep-pick-meta.muted", {}, m.servings + " servings · " + money(m.cost) + "/srv"),
          on ? h("span.prep-pick-check", {}, "✓") : null,
        ]);
      }
      return card();
    }));
    function rebuildPicker() {
      Anchor.util.qsa(".prep-pick", pickerEl).forEach(function (el, i) {
        el.classList.toggle("on", selected[batches[i].id] != null);
        var existing = el.querySelector(".prep-pick-check");
        if (selected[batches[i].id] != null && !existing) el.appendChild(h("span.prep-pick-check", {}, "✓"));
        if (selected[batches[i].id] == null && existing) existing.remove();
      });
    }

    var wrap = h("div.view.view-prep", {}, [
      ui.sectionHeader("Prep planner", "Pick the batches you'll cook. It builds one shopping list and shows how many meals it buys you."),
      summaryHost,
      ui.sectionHeader("Choose your batches", "Aim for 2–3. Each one feeds you for days."),
      pickerEl,
      listHost,
    ]);

    rebuild();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.prep = { render: render, title: "Prep" };
})(window.Anchor = window.Anchor || {});
