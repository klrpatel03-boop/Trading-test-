/* ============================================================================
 * Anchor — ui.js
 * Reusable UI components built on the `h` helper. Attaches to window.Anchor.ui.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h;
  var money = Anchor.util.money;

  var ui = {};

  /* ---- section header ---- */
  ui.sectionHeader = function (title, subtitle, actions) {
    return h("div.section-head", {}, [
      h("div.section-head-text", {}, [
        h("h2.section-title", {}, title),
        subtitle ? h("p.section-sub", {}, subtitle) : null,
      ]),
      actions ? h("div.section-head-actions", {}, actions) : null,
    ]);
  };

  /* ---- stat tile ---- */
  ui.stat = function (value, label, opts) {
    opts = opts || {};
    return h("div.stat" + (opts.accent ? ".stat-accent" : ""), {}, [
      h("div.stat-value", {}, value),
      h("div.stat-label", {}, label),
      opts.sub ? h("div.stat-sub", {}, opts.sub) : null,
    ]);
  };

  /* ---- pill / chip ---- */
  ui.chip = function (text, opts) {
    opts = opts || {};
    return h("span.chip" + (opts.kind ? ".chip-" + opts.kind : ""), {
      onClick: opts.onClick || null,
      role: opts.onClick ? "button" : null,
      tabindex: opts.onClick ? "0" : null,
    }, text);
  };

  /* ---- gear badge ---- */
  ui.gearBadge = function (gearId) {
    var g = Anchor.gears[gearId] || Anchor.gears.floor;
    return h("span.gear-badge.gear-" + g.id, { title: g.hint }, [g.emoji + " " + g.label]);
  };

  /* ---- macro mini row ---- */
  ui.macroRow = function (m) {
    return h("div.macro-row", {}, [
      h("span.macro-pill.p", {}, "P " + (m.protein || 0) + "g"),
      h("span.macro-pill.f", {}, "Fib " + (m.fiber || 0) + "g"),
      h("span.macro-pill.c", {}, (m.calories || 0) + " cal"),
      h("span.macro-pill.cost", {}, money(m.cost || 0)),
    ]);
  };

  /* ---- meal card ---- */
  ui.mealCard = function (meal, opts) {
    opts = opts || {};
    var fav = Anchor.store.isFavorite(meal.id);
    var card = h("article.meal-card", {
      tabindex: "0",
      role: "button",
      onClick: function () { ui.openMeal(meal); },
      onKeydown: function (e) { if (e.key === "Enter") ui.openMeal(meal); },
    }, [
      h("div.meal-card-top", {}, [
        h("span.meal-emoji", {}, meal.emoji || "🍽️"),
        h("button.fav-btn" + (fav ? ".on" : ""), {
          title: fav ? "Unpin" : "Pin to favorites",
          onClick: function (e) {
            e.stopPropagation();
            Anchor.store.toggleFavorite(meal.id);
            card.querySelector(".fav-btn").classList.toggle("on");
          },
        }, fav ? "★" : "☆"),
      ]),
      h("h3.meal-name", {}, meal.name),
      ui.gearBadge(meal.gear),
      ui.macroRow(meal),
      meal.note ? h("p.meal-note", {}, meal.note) : null,
      opts.slotLabel ? h("div.meal-slot-label", {}, opts.slotLabel) : null,
    ]);
    if (opts.tagThumb) card.classList.add("compact");
    return card;
  };

  /* ---- meal detail modal ---- */
  ui.openMeal = function (meal) {
    var booster = meal.booster ? Anchor.boosters.find(function (b) { return b.id === meal.booster; }) : null;
    var fav = Anchor.store.isFavorite(meal.id);

    var body = h("div.meal-detail", {}, [
      h("div.meal-detail-head", {}, [
        h("span.meal-detail-emoji", {}, meal.emoji || "🍽️"),
        h("div", {}, [
          h("h2.modal-title", {}, meal.name),
          h("div.meal-detail-badges", {}, [
            ui.gearBadge(meal.gear),
            h("span.chip", {}, meal.prepMin + " min"),
            h("span.chip", {}, meal.servings + " serving" + (meal.servings > 1 ? "s" : "")),
            meal.batch ? h("span.chip.chip-accent", {}, "batch") : null,
          ]),
        ]),
      ]),

      h("div.macro-grid", {}, [
        ui.stat(meal.protein + "g", "Protein"),
        ui.stat(meal.fiber + "g", "Fiber"),
        ui.stat(meal.calories, "Calories"),
        ui.stat(meal.carbs + "g", "Carbs"),
        ui.stat(meal.fat + "g", "Fat"),
        ui.stat(money(meal.cost), "Per serving", { accent: true }),
      ]),

      meal.tags && meal.tags.length ? h("div.tag-row", {},
        meal.tags.map(function (t) { return ui.chip(t, { kind: "soft" }); })
      ) : null,

      h("div.detail-cols", {}, [
        h("div.detail-col", {}, [
          h("h4.detail-h", {}, "Ingredients"),
          h("ul.detail-list", {}, (meal.ingredients || []).map(function (i) {
            return h("li", {}, i);
          })),
        ]),
        h("div.detail-col", {}, [
          h("h4.detail-h", {}, "Steps"),
          h("ol.detail-steps", {}, (meal.steps || []).map(function (s) {
            return h("li", {}, s);
          })),
        ]),
      ]),

      booster ? h("div.booster-callout", {}, [
        h("strong", {}, "💪 Gain booster: "),
        booster.text + " (+" + booster.kcal + " cal, " + money(booster.cost) + "). " + booster.note,
      ]) : null,

      ui.recipeLinks(meal),

      h("div.modal-actions", {}, [
        h("button.btn" + (fav ? ".btn-ghost" : ".btn-primary"), {
          onClick: function (e) {
            Anchor.store.toggleFavorite(meal.id);
            Anchor.util.toast(Anchor.store.isFavorite(meal.id) ? "Pinned ★" : "Unpinned");
            ui.closeModal();
          },
        }, fav ? "Unpin from favorites" : "★ Pin to favorites"),
        h("button.btn.btn-ghost", { onClick: ui.closeModal }, "Close"),
      ]),
    ]);

    ui.modal(body);
  };

  /* ---- trusted-cookbook recipe links for a meal ---- */
  ui.recipeLinks = function (meal) {
    if (!Anchor.cookbooks) return null;
    var deep = (Anchor.recipeLinks && Anchor.recipeLinks[meal.id]) || [];
    var search = Anchor.recipeSearchLinks(meal);
    var primary = search.filter(function (s) { return s.primary; })[0];
    var others = search.filter(function (s) { return !s.primary; });

    return h("div.recipe-links", {}, [
      h("h4.detail-h", {}, "📖 Cook it from a tested recipe"),
      deep.length ? h("div.recipe-deep", {}, deep.map(function (r) {
        return h("a.recipe-deep-link", { href: r.url, target: "_blank", rel: "noopener" }, [
          h("span.recipe-deep-source", {}, r.source),
          h("span.recipe-deep-title", {}, r.title),
          h("span.recipe-go", {}, "↗"),
        ]);
      })) : h("p.muted.recipe-hint", {}, "No exact match saved — search trusted cookbooks for this dish:"),
      h("div.recipe-search-row", {}, [
        primary ? h("a.btn.btn-primary.btn-sm", { href: primary.url, target: "_blank", rel: "noopener" },
          primary.emoji + " Search " + primary.source) : null,
      ].concat(others.slice(0, 4).map(function (s) {
        return h("a.recipe-chip", { href: s.url, target: "_blank", rel: "noopener" }, s.emoji + " " + s.source);
      }))),
    ]);
  };

  /* ---- generic modal ---- */
  ui.modal = function (content) {
    ui.closeModal();
    var overlay = h("div.modal-overlay", {
      onClick: function (e) { if (e.target === overlay) ui.closeModal(); },
    }, [
      h("div.modal", { role: "dialog", "aria-modal": "true" }, [
        h("button.modal-close", { onClick: ui.closeModal, "aria-label": "Close" }, "✕"),
        content,
      ]),
    ]);
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");
    requestAnimationFrame(function () { overlay.classList.add("show"); });
    ui._escHandler = function (e) { if (e.key === "Escape") ui.closeModal(); };
    document.addEventListener("keydown", ui._escHandler);
  };

  ui.closeModal = function () {
    var ov = Anchor.util.qs(".modal-overlay");
    if (ov) {
      ov.classList.remove("show");
      setTimeout(function () { if (ov.parentNode) ov.remove(); }, 220);
    }
    document.body.classList.remove("modal-open");
    if (ui._escHandler) {
      document.removeEventListener("keydown", ui._escHandler);
      ui._escHandler = null;
    }
  };

  /* ---- card wrapper ---- */
  ui.card = function (children, opts) {
    opts = opts || {};
    return h("section.card" + (opts.pad === false ? ".card-flush" : "") + (opts.class ? "." + opts.class : ""), {}, children);
  };

  /* ---- toggle switch ---- */
  ui.toggle = function (label, checked, onChange) {
    var input = h("input", { type: "checkbox", checked: checked, onChange: function (e) { onChange(e.target.checked); } });
    return h("label.switch", {}, [
      h("span.switch-label", {}, label),
      h("span.switch-control", {}, [input, h("span.switch-slider", {})]),
    ]);
  };

  /* ---- segmented control ---- */
  ui.segmented = function (options, value, onChange) {
    return h("div.segmented", {}, options.map(function (o) {
      return h("button.seg" + (o.value === value ? ".active" : ""), {
        onClick: function () { onChange(o.value); },
      }, o.label);
    }));
  };

  /* ---- empty state ---- */
  ui.empty = function (emoji, title, text) {
    return h("div.empty-state", {}, [
      h("div.empty-emoji", {}, emoji),
      h("h3", {}, title),
      text ? h("p", {}, text) : null,
    ]);
  };

  Anchor.ui = ui;
})(window.Anchor = window.Anchor || {});
