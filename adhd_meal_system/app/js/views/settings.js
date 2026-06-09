/* ============================================================================
 * Anchor — views/settings.js
 * Profile, editable anchor schedule, theme, reminder notifications, the
 * printable cheat sheet link, and data export/import/reset.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";
  var h = Anchor.util.h, ui = Anchor.ui;

  function render(root) {
    var state = Anchor.store.get();

    var wrap = h("div.view.view-settings", {}, [
      ui.sectionHeader("Settings", "Make it yours. Everything saves to this device automatically."),

      /* profile */
      ui.card([
        h("h3.detail-h", {}, "Profile"),
        field("Name (optional)", textInput(state.profile.name, function (v) { Anchor.store.setProfile({ name: v }); })),
        field("Bodyweight (lb)", numInput(state.profile.weightLb, function (v) { Anchor.store.setProfile({ weightLb: v }); })),
        field("Goal", ui.segmented([
          { value: "gain", label: "Gain" }, { value: "maintain", label: "Maintain" }, { value: "cut", label: "Cut" },
        ], state.profile.goal, function (v) { Anchor.store.setProfile({ goal: v }); Anchor.util.toast("Goal saved"); })),
        field("Activity", ui.segmented([
          { value: "sedentary", label: "Low" }, { value: "light", label: "Light" },
          { value: "moderate", label: "Moderate" }, { value: "active", label: "Active" },
        ], state.profile.activity, function (v) { Anchor.store.setProfile({ activity: v }); })),
        ui.toggle("On appetite-suppressing stimulant meds", state.profile.onStimulants, function (v) {
          Anchor.store.setProfile({ onStimulants: v });
        }),
      ]),

      /* schedule editor */
      ui.card([
        h("h3.detail-h", {}, "Anchor schedule"),
        h("p.muted", {}, "Set your real meal times and the habit you'll attach each to. Then set matching phone alarms."),
        h("div.schedule-editor", {}, state.schedule.map(function (s, i) {
          return h("div.sched-edit-row", {}, [
            h("input.input.sched-time", {
              type: "time", value: s.time,
              onChange: function (e) { updateSchedule(i, { time: e.target.value }); },
            }),
            h("div.sched-edit-fields", {}, [
              h("input.input", {
                type: "text", value: s.label, placeholder: "What to do",
                onChange: function (e) { updateSchedule(i, { label: e.target.value }); },
              }),
              h("input.input.sched-anchor", {
                type: "text", value: s.anchor || "", placeholder: "Anchor habit (e.g. after coffee)",
                onChange: function (e) { updateSchedule(i, { anchor: e.target.value }); },
              }),
            ]),
          ]);
        })),
      ]),

      /* reminders */
      ui.card([
        h("h3.detail-h", {}, "Meal reminders"),
        h("p.muted", {}, "Browser notifications at your scheduled times (keep the app open / installed). On iPhone, install to the Home Screen first — see below."),
        ui.toggle("Enable reminder notifications", state.notificationsEnabled, function (v) {
          if (v) {
            Anchor.notify.enable(function (ok) {
              Anchor.store.update(function (s) { s.notificationsEnabled = ok; });
              Anchor.util.toast(ok ? "Reminders on" : "Permission denied");
              Anchor.router.refresh();
            });
          } else {
            Anchor.store.update(function (s) { s.notificationsEnabled = false; });
            Anchor.notify.disable();
          }
        }),
        h("button.btn.btn-ghost.btn-sm", {
          onClick: function () { Anchor.notify.test(); },
        }, "Send a test notification"),
      ]),

      /* appearance */
      ui.card([
        h("h3.detail-h", {}, "Appearance"),
        field("Theme", ui.segmented([
          { value: "dark", label: "Dark" }, { value: "light", label: "Light" }, { value: "auto", label: "Auto" },
        ], state.theme, function (v) { Anchor.store.setTheme(v); Anchor.applyTheme(); })),
      ]),

      /* cheat sheet + install */
      ui.card([
        h("h3.detail-h", {}, "Printable cheat sheet"),
        h("p.muted", {}, "A one-page summary — alarms, menu, groceries, boosters, depleted-day plan. Print it or screenshot it for your fridge or phone."),
        h("div.modal-actions", {}, [
          h("a.btn.btn-primary", { href: "cheatsheet.html", target: "_blank", rel: "noopener" }, "Open cheat sheet"),
          h("button.btn.btn-ghost", { onClick: function () { window.open("cheatsheet.html", "_blank"); } }, "Print / save as PDF"),
        ]),
      ]),

      ui.card([
        h("h3.detail-h", {}, "Install on your phone (iPhone)"),
        h("ol.detail-steps", {}, [
          "Open this page in Safari.",
          "Tap the Share button (the square with an arrow).",
          "Tap 'Add to Home Screen'.",
          "Now Anchor opens like a real app — offline, full-screen, reminders work.",
        ].map(function (x) { return h("li", {}, x); })),
      ]),

      /* data */
      ui.card([
        h("h3.detail-h", {}, "Your data"),
        h("p.muted", {}, "Everything lives on this device (localStorage). Nothing is uploaded anywhere."),
        h("div.modal-actions", {}, [
          h("button.btn.btn-ghost", {
            onClick: function () { Anchor.util.download("anchor-backup.json", Anchor.store.exportJSON(), "application/json"); },
          }, "Export backup"),
          h("button.btn.btn-ghost", {
            onClick: function () { importFlow(); },
          }, "Import backup"),
          h("button.btn.btn-danger", {
            onClick: function () {
              if (confirm("Reset ALL data? This can't be undone.")) {
                Anchor.store.reset();
                Anchor.applyTheme();
                Anchor.util.toast("Reset complete");
                Anchor.router.go("today");
              }
            },
          }, "Reset everything"),
        ]),
      ]),

      h("div.app-footer", {}, [
        h("div.app-footer-name", {}, "⚓ " + Anchor.meta.name + " v" + Anchor.meta.version),
        h("div.muted", {}, Anchor.meta.subtitle),
        h("div.muted", {}, "Educational tool — not medical advice."),
      ]),
    ]);

    function updateSchedule(i, patch) {
      Anchor.store.update(function (s) { Object.assign(s.schedule[i], patch); });
    }

    Anchor.util.append(root, wrap);
  }

  function importFlow() {
    var input = h("textarea.input.import-area", { placeholder: "Paste your anchor-backup.json contents here…", rows: "8" });
    Anchor.ui.modal(h("div", {}, [
      h("h2.modal-title", {}, "Import backup"),
      input,
      h("div.modal-actions", {}, [
        h("button.btn.btn-primary", {
          onClick: function () {
            try {
              Anchor.store.importJSON(input.value);
              Anchor.applyTheme();
              Anchor.ui.closeModal();
              Anchor.util.toast("Imported");
              Anchor.router.go("today");
            } catch (e) { Anchor.util.toast("Invalid backup file"); }
          },
        }, "Import"),
        h("button.btn.btn-ghost", { onClick: Anchor.ui.closeModal }, "Cancel"),
      ]),
    ]));
  }

  function field(label, control) {
    return h("div.setting-field", {}, [h("label.setting-label", {}, label), control]);
  }
  function textInput(val, onChange) {
    return h("input.input", { type: "text", value: val || "", onChange: function (e) { onChange(e.target.value); } });
  }
  function numInput(val, onChange) {
    return h("input.input", { type: "number", value: val || "", step: "0.1", onChange: function (e) { onChange(+e.target.value); } });
  }

  Anchor.views = Anchor.views || {};
  Anchor.views.settings = { render: render, title: "Settings" };
})(window.Anchor = window.Anchor || {});
