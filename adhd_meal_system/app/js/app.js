/* ============================================================================
 * Anchor — app.js
 * The shell: hash router, top bar, bottom nav, onboarding, theme application,
 * PWA registration, and boot. Loaded last. Attaches Anchor.router / Anchor.app.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h;

  /* ---- nav config ---- */
  var NAV = [
    { id: "today", label: "Today", icon: "🗓️" },
    { id: "decide", label: "Decide", icon: "🎲" },
    { id: "menu", label: "Menu", icon: "🍽️" },
    { id: "cookday", label: "Cook", icon: "🔥" },
    { id: "groceries", label: "Cart", icon: "🛒" },
  ];
  // secondary (reachable from the "More" sheet / top bar)
  var MORE = [
    { id: "plan", label: "Week plan", icon: "📆" },
    { id: "prep", label: "Prep planner", icon: "🧑‍🍳" },
    { id: "cookbooks", label: "Recipes", icon: "📖" },
    { id: "flavor", label: "Flavor lab", icon: "🌶️" },
    { id: "garden", label: "From your garden", icon: "🥬" },
    { id: "foods", label: "Cheap food index", icon: "🏷️" },
    { id: "plate", label: "Build a plate", icon: "🍽️" },
    { id: "wellness", label: "Hydration & meds", icon: "💧" },
    { id: "track", label: "Track", icon: "📈" },
    { id: "insights", label: "Insights", icon: "📊" },
    { id: "budget", label: "Budget", icon: "💵" },
    { id: "calculator", label: "Targets", icon: "🎯" },
    { id: "pantry", label: "Floor shelf", icon: "🥫" },
    { id: "learn", label: "The system", icon: "📚" },
    { id: "help", label: "Help & FAQ", icon: "❓" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  /* ---- router ---- */
  var current = { view: "today", params: {} };

  function parseHash() {
    var hash = (location.hash || "#today").slice(1);
    var parts = hash.split("?");
    var view = parts[0] || "today";
    var params = {};
    if (parts[1]) {
      parts[1].split("&").forEach(function (kv) {
        var p = kv.split("=");
        params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
      });
    }
    return { view: view, params: params };
  }

  function buildHash(view, params) {
    var q = "";
    if (params && Object.keys(params).length) {
      q = "?" + Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      }).join("&");
    }
    return "#" + view + q;
  }

  var router = {
    go: function (view, params) {
      location.hash = buildHash(view, params || {});
    },
    refresh: function () { renderCurrent(); },
    current: function () { return current; },
  };
  Anchor.router = router;

  function renderCurrent() {
    current = parseHash();
    var def = Anchor.views[current.view] || Anchor.views.today;
    if (!Anchor.views[current.view]) current.view = "today";

    var root = Anchor.util.qs("#view-root");
    Anchor.util.clear(root);
    Anchor.ui.closeModal();
    try {
      def.render(root, current.params);
    } catch (e) {
      root.appendChild(h("div.view", {}, [
        h("h2", {}, "Something broke rendering this screen."),
        h("pre.errbox", {}, String(e && e.stack || e)),
        h("button.btn.btn-primary", { onClick: function () { router.go("today"); } }, "Back to Today"),
      ]));
      if (window.console) console.error(e);
    }

    // sync nav highlight
    Anchor.util.qsa(".nav-item").forEach(function (el) {
      el.classList.toggle("active", el.dataset.view === current.view);
    });
    // scroll to top of content
    var main = Anchor.util.qs("#main");
    if (main) main.scrollTop = 0;
    // update title
    document.title = (def.title ? def.title + " · " : "") + "Anchor";
  }

  /* ---- top bar + nav ---- */
  function buildChrome() {
    var app = Anchor.util.qs("#app");
    Anchor.util.clear(app);

    var topbar = h("header.topbar", {}, [
      h("button.brand", { onClick: function () { router.go("today"); } }, [
        h("span.brand-mark", {}, "⚓"),
        h("span.brand-name", {}, "Anchor"),
      ]),
      h("div.topbar-actions", {}, [
        h("button.icon-btn", { title: "Recipes", onClick: function () { router.go("cookbooks"); } }, "📖"),
        h("button.icon-btn", { title: "Help", onClick: function () { router.go("help"); } }, "❓"),
        h("button.icon-btn", { title: "Settings", onClick: function () { router.go("settings"); } }, "⚙️"),
        h("button.icon-btn.theme-btn", { title: "Toggle theme", onClick: toggleTheme }, "🌗"),
      ]),
    ]);

    var main = h("main#main", {}, [h("div#view-root.view-root", {})]);

    var nav = h("nav.bottomnav", {}, NAV.map(function (n) {
      return h("button.nav-item", {
        dataset: { view: n.id },
        onClick: function () { router.go(n.id); },
      }, [
        h("span.nav-icon", {}, n.icon),
        h("span.nav-label", {}, n.label),
      ]);
    }).concat([
      h("button.nav-item.nav-more", {
        dataset: { view: "__more" },
        onClick: openMore,
      }, [h("span.nav-icon", {}, "⋯"), h("span.nav-label", {}, "More")]),
    ]));

    app.appendChild(topbar);
    app.appendChild(main);
    app.appendChild(nav);
  }

  function openMore() {
    var sheet = h("div", {}, [
      h("h2.modal-title", {}, "More"),
      h("div.more-grid", {}, MORE.map(function (m) {
        return h("button.more-item", {
          onClick: function () { Anchor.ui.closeModal(); router.go(m.id); },
        }, [h("span.more-icon", {}, m.icon), h("span", {}, m.label)]);
      })),
    ]);
    Anchor.ui.modal(sheet);
  }

  /* ---- theme ---- */
  Anchor.applyTheme = function () {
    var theme = Anchor.store.get().theme;
    var resolved = theme;
    if (theme === "auto") {
      resolved = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", resolved);
  };
  function toggleTheme() {
    var t = Anchor.store.get().theme;
    var next = t === "dark" ? "light" : "dark";
    Anchor.store.setTheme(next);
    Anchor.applyTheme();
    Anchor.util.toast(next === "dark" ? "Dark mode" : "Light mode");
  }

  /* ---- onboarding ---- */
  function maybeOnboard() {
    var s = Anchor.store.get();
    if (s.seenWelcome) return;
    var step = 0;
    var profile = Object.assign({}, s.profile);

    function show() {
      var content;
      if (step === 0) {
        content = h("div.onboard", {}, [
          h("div.onboard-mark", {}, "⚓"),
          h("h1.onboard-title", {}, "Anchor"),
          h("p.onboard-tag", {}, "Eat on autopilot."),
          h("p.onboard-body", {}, "A meal system built for an ADHD brain — appetite-killing meds, low executive function, and a tight budget. It decides what you eat so you don't have to."),
          h("button.btn.btn-primary.btn-block", { onClick: function () { step = 1; show(); } }, "Set me up (30 sec)"),
        ]);
      } else if (step === 1) {
        var w = h("input.input", { type: "number", value: profile.weightLb, step: "0.1" });
        content = h("div.onboard", {}, [
          h("h2.onboard-title", {}, "Your goal"),
          h("p.onboard-body", {}, "This tunes your calorie + protein targets."),
          h("label.setting-label", {}, "Bodyweight (lb)"), w,
          h("label.setting-label", {}, "Goal"),
          Anchor.ui.segmented([
            { value: "gain", label: "Gain" }, { value: "maintain", label: "Maintain" }, { value: "cut", label: "Cut" },
          ], profile.goal, function (v) { profile.goal = v; }),
          h("button.btn.btn-primary.btn-block", {
            onClick: function () { profile.weightLb = +w.value || profile.weightLb; step = 2; show(); },
          }, "Next"),
        ]);
      } else {
        content = h("div.onboard", {}, [
          h("h2.onboard-title", {}, "Two rules and you're set"),
          h("ul.onboard-rules", {}, [
            "Eat on the alarm, even with no appetite — it's the meds, not a signal to skip.",
            "Cook big batches when the spark hits; coast on cheap leftovers when it doesn't.",
            "There's no streak to break. Miss a meal? Just eat at the next alarm.",
          ].map(function (x) { return h("li", {}, x); })),
          h("button.btn.btn-primary.btn-block", {
            onClick: function () {
              Anchor.store.update(function (st) { Object.assign(st.profile, profile); st.seenWelcome = true; });
              Anchor.ui.closeModal();
              renderCurrent();
              Anchor.util.toast("You're set. Here's today.");
            },
          }, "Start"),
        ]);
      }
      Anchor.ui.modal(content);
    }
    show();
  }

  /* ---- PWA ---- */
  function registerSW() {
    if ("serviceWorker" in navigator) {
      // service worker only works over http(s), not file:// — guard it
      if (location.protocol === "http:" || location.protocol === "https:") {
        navigator.serviceWorker.register("sw.js").catch(function () { /* offline still works via localStorage */ });
      }
    }
  }

  /* ---- boot ---- */
  function boot() {
    Anchor.store.init();
    Anchor.applyTheme();
    buildChrome();
    window.addEventListener("hashchange", renderCurrent);
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: light)");
      if (mq.addEventListener) mq.addEventListener("change", Anchor.applyTheme);
    }
    if (!location.hash) location.hash = "#today";
    renderCurrent();
    maybeOnboard();
    Anchor.notify.init();
    registerSW();
  }

  Anchor.app = { boot: boot };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.Anchor = window.Anchor || {});
