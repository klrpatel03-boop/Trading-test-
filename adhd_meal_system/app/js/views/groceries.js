/* ============================================================================
 * Anchor — views/groceries.js
 * The repeatable, store-section grocery list. Checkable + persisted. Shows
 * progress, tier-1 "never run out" items, and an export/copy button.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function allItems() {
    var items = [];
    Anchor.grocerySections.forEach(function (sec) {
      sec.items.forEach(function (it) { items.push(it.name); });
    });
    return items;
  }

  function render(root) {
    var state = Anchor.store.get();
    var total = allItems().length;

    var progressEl = h("div.grocery-progress", {});
    function updateProgress() {
      var g = Anchor.store.get().grocery;
      var done = allItems().filter(function (n) { return g[n]; }).length;
      Anchor.util.clear(progressEl);
      var pct = total ? Math.round((done / total) * 100) : 0;
      progressEl.appendChild(h("div.progress-bar", {}, [
        h("div.progress-fill", { style: { width: pct + "%" } }),
      ]));
      progressEl.appendChild(h("div.progress-text", {}, done + " / " + total + " in the cart"));
    }

    var sectionsEl = h("div.grocery-sections", {});
    function buildSections() {
      Anchor.util.clear(sectionsEl);
      var g = Anchor.store.get().grocery;
      Anchor.grocerySections.forEach(function (sec) {
        var secDone = sec.items.every(function (it) { return g[it.name]; });
        sectionsEl.appendChild(h("div.grocery-section" + (secDone ? ".section-done" : ""), {}, [
          h("h3.grocery-section-title", {}, [
            h("span", {}, sec.emoji + " " + sec.name),
            h("span.grocery-section-count.muted", {},
              sec.items.filter(function (it) { return g[it.name]; }).length + "/" + sec.items.length),
          ]),
          h("ul.grocery-list", {}, sec.items.map(function (it) {
            var checked = !!g[it.name];
            return h("li.grocery-item" + (checked ? ".checked" : ""), {
              onClick: function () {
                Anchor.store.toggleGrocery(it.name);
                buildSections();
                updateProgress();
              },
            }, [
              h("span.checkbox" + (checked ? ".on" : ""), {}, checked ? "✓" : ""),
              h("div.grocery-item-text", {}, [
                h("span.grocery-item-name", {}, it.name),
                it.note ? h("span.grocery-item-note", {}, it.note) : null,
              ]),
              it.tier1 ? h("span.tier1-badge", { title: "Never run out — buy every week" }, "★") : null,
            ]);
          })),
        ]));
      });
    }

    function exportText() {
      var lines = ["ANCHOR — GROCERY LIST", "Main store: " + Anchor.budget.stores[0].name, ""];
      var g = Anchor.store.get().grocery;
      Anchor.grocerySections.forEach(function (sec) {
        lines.push(sec.emoji + " " + sec.name.toUpperCase());
        sec.items.forEach(function (it) {
          lines.push("  [" + (g[it.name] ? "x" : " ") + "] " + it.name + (it.note ? "  — " + it.note : ""));
        });
        lines.push("");
      });
      lines.push("★ = tier-1, buy every week (the floor-shelf staples).");
      return lines.join("\n");
    }

    var wrap = h("div.view.view-groceries", {}, [
      ui.sectionHeader("Groceries", "Same cheap cart every week. ★ = buy every time — never run out.", [
        h("div.section-head-actions", {}, [
          h("button.btn.btn-ghost.btn-sm", {
            onClick: function () {
              navigator.clipboard && navigator.clipboard.writeText(exportText());
              Anchor.util.toast("List copied to clipboard");
            },
          }, "Copy"),
          h("button.btn.btn-ghost.btn-sm", {
            onClick: function () { Anchor.util.download("anchor-groceries.txt", exportText()); },
          }, "Export"),
          h("button.btn.btn-ghost.btn-sm", {
            onClick: function () {
              if (confirm("Uncheck everything?")) {
                Anchor.store.clearGrocery();
                buildSections(); updateProgress();
              }
            },
          }, "Reset"),
        ]),
      ]),

      ui.card([
        progressEl,
        h("p.muted.grocery-hint", {}, [
          "💡 Buy ", h("strong", {}, "dried"), " beans/lentils (≈⅓ the cost of canned), cheap protein cuts ",
          "(thighs, whole chicken, eggs, tuna), and bulk oats/rice. Reorder the same cart online to skip the in-store wander.",
        ]),
      ]),

      sectionsEl,
    ]);

    buildSections();
    updateProgress();
    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.groceries = { render: render, title: "Groceries" };
})(window.Anchor = window.Anchor || {});
