/* ============================================================================
 * Anchor — notify.js
 * Meal-reminder notifications. Uses the Notification API + setTimeout while the
 * app is open/installed. Schedules the next occurrence of each anchor time.
 * Attaches to window.Anchor.notify.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var timers = [];

  function supported() {
    return typeof Notification !== "undefined";
  }

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function nextOccurrence(hhmm) {
    var parts = (hhmm || "08:00").split(":");
    var now = new Date();
    var target = new Date();
    target.setHours(+parts[0] || 0, +parts[1] || 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  }

  function fire(label) {
    if (!supported() || Notification.permission !== "granted") return;
    try {
      new Notification("⚓ Anchor — meal time", {
        body: label + "\nNo hunger needed. Eat on the alarm.",
        tag: "anchor-meal",
        renotify: true,
      });
    } catch (e) { /* some browsers require ServiceWorkerRegistration.showNotification */ }
  }

  var notify = {
    enable: function (cb) {
      if (!supported()) { cb && cb(false); return; }
      Notification.requestPermission().then(function (perm) {
        var ok = perm === "granted";
        if (ok) notify.schedule();
        cb && cb(ok);
      });
    },
    disable: function () { clearTimers(); },
    schedule: function () {
      clearTimers();
      if (!supported() || Notification.permission !== "granted") return;
      var state = Anchor.store.get();
      if (!state.notificationsEnabled) return;
      state.schedule.forEach(function (s) {
        var ms = nextOccurrence(s.time);
        var t = setTimeout(function () {
          fire(s.label);
          // reschedule for the next day
          notify.schedule();
        }, ms);
        timers.push(t);
      });
    },
    test: function () {
      if (!supported()) { Anchor.util.toast("Notifications not supported here"); return; }
      if (Notification.permission === "granted") {
        fire("This is a test reminder. Tap an alarm time to see real ones.");
        Anchor.util.toast("Test sent");
      } else {
        notify.enable(function (ok) {
          if (ok) { fire("Reminders enabled ✓"); Anchor.util.toast("Enabled + test sent"); }
          else Anchor.util.toast("Permission denied");
        });
      }
    },
    init: function () {
      if (supported() && Notification.permission === "granted") {
        var state = Anchor.store.get();
        if (state.notificationsEnabled) notify.schedule();
      }
    },
  };

  Anchor.notify = notify;
})(window.Anchor = window.Anchor || {});
