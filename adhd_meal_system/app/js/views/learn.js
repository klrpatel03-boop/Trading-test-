/* ============================================================================
 * Anchor — views/learn.js
 * The "why" + reference. Tabs: Principles (the 9), Schedule (anchors + alarms +
 * med timing), Depleted-day protocol. This is the part that makes you trust the
 * system when it's hard.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root, params) {
    var tab = (params && params.tab) || "principles";
    var bodyEl = h("div.learn-body", {});

    function setTab(t) {
      tab = t;
      Anchor.util.qsa(".learn-tab", tabsEl).forEach(function (el) {
        el.classList.toggle("active", el.dataset.tab === t);
      });
      Anchor.util.clear(bodyEl);
      bodyEl.appendChild(renderTab(t));
    }

    var tabsEl = h("div.learn-tabs", {}, [
      tabBtn("principles", "The 9 principles"),
      tabBtn("schedule", "Schedule & meds"),
      tabBtn("crash", "Depleted-day plan"),
    ]);
    function tabBtn(id, label) {
      return h("button.learn-tab", { dataset: { tab: id }, onClick: function () { setTab(id); } }, label);
    }

    var wrap = h("div.view.view-learn", {}, [
      ui.sectionHeader("The system", "Built around executive function — not willpower. Read once; trust it on hard days."),
      tabsEl,
      bodyEl,
    ]);

    Anchor.util.append(root, wrap);
    setTab(tab);
  }

  function renderTab(t) {
    if (t === "schedule") return scheduleTab();
    if (t === "crash") return crashTab();
    return principlesTab();
  }

  function principlesTab() {
    return h("div.principles", {}, [
      h("div.principle-intro", {}, [
        h("p", {}, "The bottleneck isn't knowledge or willpower — it's executive function: the brain's ability to initiate, decide, sequence, and follow through. Every principle below lowers the executive-function cost of eating to near zero."),
      ]),
      h("div.principle-list", {}, Anchor.principles.map(function (p) {
        return h("div.principle-card", {}, [
          h("div.principle-num", {}, p.n),
          h("div.principle-text", {}, [
            h("h3.principle-title", {}, p.title),
            h("p.principle-body", {}, p.body),
          ]),
        ]);
      })),
      h("div.principle-summary", {}, [
        h("strong", {}, "In one sentence: "),
        "Remove decisions, attach eating to alarms and habits, give every meal a cook-gear and a no-effort floor, batch-cook to coast on cheap leftovers, and lead with cheap protein + fiber — so eating still happens when executive function is gone, and it costs almost nothing.",
      ]),
    ]);
  }

  function scheduleTab() {
    var schedule = Anchor.store.get().schedule;
    return h("div.schedule-tab", {}, [
      ui.card([
        h("h3.detail-h", {}, "The medication reality"),
        h("p", {}, "Stimulants suppress appetite unpredictably. The practical rule isn't 'eat at window X' — it's:"),
        h("blockquote.callout", {}, "Hunger will not show up to remind you. For any meal, assume you won't feel like eating, and eat on the alarm anyway."),
        h("ul.rule-list", {}, [
          "Drink it — a shake goes down when a plate won't (works at any meal).",
          "Small and protein-first beats a big plate you'll abandon.",
          "Late-day rebound is real hunger from a low-intake day — plan a good dinner so it lands on real food.",
        ].map(function (x) { return h("li", {}, [h("span.rule-dot", {}, "→"), x]); })),
      ]),
      ui.card([
        h("h3.detail-h", {}, "Your anchor schedule"),
        h("p.muted", {}, "Attach each meal to a habit you already do. The habit is the trigger your brain already obeys."),
        h("div.schedule-rows", {}, schedule.map(function (s) {
          return h("div.schedule-row", {}, [
            h("span.schedule-time", {}, s.time),
            h("div.schedule-info", {}, [
              h("div.schedule-meal", {}, s.label),
              h("div.schedule-anchor.muted", {}, "⚓ After: " + (s.anchor || "—")),
            ]),
          ]);
        })),
        h("p.muted", {}, "Edit times and anchors in Settings. Set matching phone alarms labelled with the action, not the time."),
      ]),
      ui.card([
        h("h3.detail-h", {}, "Alarm labels to copy"),
        h("ul.copy-list", {}, [
          "🍳 EAT — reheat leftovers / oats / shake. No hunger needed.",
          "🥡 LUNCH — leftovers (or drink a shake). Eat anyway.",
          "🥜 Snack — grab protein.",
          "🍳 DINNER — cook the batch (the fun part). Make extra.",
          "🌙 Evening snack — optional, then kitchen closed.",
        ].map(function (x) {
          return h("li.copy-line", {}, [
            h("code", {}, x),
            h("button.linkbtn", {
              onClick: function () {
                navigator.clipboard && navigator.clipboard.writeText(x);
                Anchor.util.toast("Copied");
              },
            }, "copy"),
          ]);
        })),
      ]),
    ]);
  }

  function crashTab() {
    var c = Anchor.crash;
    return h("div.crash-tab", {}, [
      h("blockquote.callout.callout-warn", {}, c.rule),
      h("div.crash-cols", {}, [
        ui.card([
          h("h3.detail-h", {}, "🧊 Fridge zone"),
          h("ul.detail-list", {}, c.fridge.map(function (x) { return h("li", {}, x); })),
        ]),
        ui.card([
          h("h3.detail-h", {}, "🥫 Pantry shelf"),
          h("ul.detail-list", {}, c.pantry.map(function (x) { return h("li", {}, x); })),
        ]),
      ]),
      ui.sectionHeader("The 3 depleted-day meals", "Memorize these — that's the whole protocol."),
      h("div.crash-meals", {}, c.meals.map(function (m, i) {
        return h("div.crash-meal-card", {}, [
          h("div.crash-meal-num", {}, i + 1),
          h("div", {}, [h("h4", {}, m.name), h("p", {}, m.text)]),
        ]);
      })),
      ui.card([
        h("h3.detail-h", {}, "If even the shelf is too much"),
        h("ol.detail-steps", {}, c.tooMuch.map(function (x) { return h("li", {}, x); })),
      ]),
      h("div.crash-mantra", {}, [h("span", {}, "🔑 "), c.mantra]),
    ]);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.learn = { render: render, title: "System" };
})(window.Anchor = window.Anchor || {});
