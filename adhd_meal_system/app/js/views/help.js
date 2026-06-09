/* ============================================================================
 * Anchor — views/help.js
 * FAQ + glossary + how-to-start. The friendly "I'm overwhelmed, where do I
 * begin" screen.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root) {
    var wrap = h("div.view.view-help", {}, [
      ui.sectionHeader("Help", "Start tiny. The system is built to survive you doing it imperfectly."),

      ui.card([
        h("h3.detail-h", {}, "🚀 The 3-step start"),
        h("ol.detail-steps", {}, [
          "Set your 5 phone alarms (Settings → Anchor schedule has the labels to copy).",
          "Do one cheap grocery run (Cart tab → mostly dried beans, eggs, oats, chicken, frozen veg).",
          "Tonight, cook one big batch. Tomorrow's breakfast & lunch are then already done.",
        ].map(function (x) { return h("li", {}, x); })),
        h("div.modal-actions", {}, [
          h("button.btn.btn-primary", { onClick: function () { Anchor.router.go("today"); } }, "Go to Today"),
          h("a.btn.btn-ghost", { href: "cheatsheet.html", target: "_blank", rel: "noopener" }, "Printable cheat sheet"),
        ]),
      ]),

      ui.sectionHeader("FAQ", "The questions that actually come up."),
      h("div.faq-list", {}, Anchor.faq.map(function (item, i) {
        var open = i === 0;
        var ans = h("p.faq-answer", { style: { display: open ? "block" : "none" } }, item.a);
        var row = h("div.faq-item" + (open ? ".open" : ""), {}, [
          h("button.faq-q", {
            onClick: function () {
              var isOpen = row.classList.toggle("open");
              ans.style.display = isOpen ? "block" : "none";
            },
          }, [h("span", {}, item.q), h("span.faq-caret", {}, "⌄")]),
          ans,
        ]);
        return row;
      })),

      ui.sectionHeader("Glossary", "The words this app keeps using."),
      h("div.glossary-list", {}, Anchor.glossary.map(function (g) {
        return h("div.glossary-item", {}, [
          h("dt.glossary-term", {}, g.term),
          h("dd.glossary-def", {}, g.def),
        ]);
      })),

      h("div.app-footer", {}, [
        h("div.app-footer-name", {}, "⚓ " + Anchor.meta.name),
        h("div.muted", {}, "Built around executive function, not willpower."),
        h("div.muted", {}, "Educational tool — not medical advice."),
      ]),
    ]);

    Anchor.util.append(root, wrap);
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.help = { render: render, title: "Help" };
})(window.Anchor = window.Anchor || {});
