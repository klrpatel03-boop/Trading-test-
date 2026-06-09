/* ============================================================================
 * Anchor — store.js
 * State management + localStorage persistence. No DOM. A tiny pub/sub store so
 * views re-render when state changes. Attaches to window.Anchor.store.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var KEY = "anchor.state.v1";
  var STATE_VERSION = 2;     // bump when a migration is added
  var KEEP_DAYS = 400;       // cap unbounded date-keyed maps
  var quotaWarned = false;   // only nag about full storage once

  var DEFAULTS = {
    version: STATE_VERSION,
    profile: {
      name: "",
      weightLb: 160,
      goal: "gain", // gain | maintain | cut
      activity: "moderate", // sedentary | light | moderate | active
      onStimulants: true,
    },
    // bias the default rotation toward garden kale + the 6-qt pan
    preferGarden: true,
    // the one-and-only buy-it-for-life pan, tracked to the dollar
    pan: { name: "All-Clad Essential 5-ply 6-qt", cost: 250, manual: 0, log: {} },
    schedule: null, // filled from Anchor.defaultSchedule on first load
    theme: "dark", // dark | light | auto
    notificationsEnabled: false,
    // grocery: { itemName: true/false }
    grocery: {},
    // logs keyed by ISO date "YYYY-MM-DD"
    logs: {},
    // weight entries: [{date, lb}]
    weights: [],
    // pinned/favorite meal ids
    favorites: [],
    // per-day meal overrides: { "YYYY-MM-DD": { breakfast: mealId, ... } }
    overrides: {},
    // kit (equipment) + garden — seeded from defaults on first load, editable
    kit: null,
    garden: null,
    // hydration: { "YYYY-MM-DD": cups }  (stimulants dehydrate; thirst mimics hunger)
    water: {},
    waterGoal: 8,
    // meds: { "YYYY-MM-DD": { taken: bool, time: "HH:MM", ateFirst: bool } }
    meds: {},
    // floor-shelf inventory — seeded lazily by views/pantry.js if null
    pantry: null,
    // onboarding
    seenWelcome: false,
    streakSafe: true,
    createdAt: null,
  };

  var listeners = [];
  var state = null;

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function deepMerge(base, over) {
    var out = clone(base);
    if (!over) return out;
    Object.keys(over).forEach(function (k) {
      if (
        over[k] && typeof over[k] === "object" && !Array.isArray(over[k]) &&
        base[k] && typeof base[k] === "object" && !Array.isArray(base[k])
      ) {
        out[k] = deepMerge(base[k], over[k]);
      } else {
        out[k] = over[k];
      }
    });
    return out;
  }

  // Force the shape of known keys so a corrupted/edited blob can't crash later
  // code that assumes arrays/objects (e.g. weights.push, Object.keys(pan.log)).
  var ARRAY_KEYS = ["weights", "favorites", "kit", "garden", "pantry"];
  var OBJECT_KEYS = ["profile", "pan", "grocery", "logs", "overrides", "water", "meds"];
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function sanitizeTypes(s) {
    ARRAY_KEYS.forEach(function (k) {
      if (k === "kit" || k === "garden" || k === "pantry") return; // may be null, seeded later
      if (!Array.isArray(s[k])) s[k] = [];
    });
    OBJECT_KEYS.forEach(function (k) { if (!isObj(s[k])) s[k] = clone(DEFAULTS[k]); });
    if (!isObj(s.pan.log)) s.pan.log = {};
    s.pan.cost = Anchor.util.safeNum(s.pan.cost, { min: 0, max: 100000, fallback: 250 });
    s.pan.manual = Anchor.util.safeNum(s.pan.manual, { min: 0, fallback: 0, integer: true });
    s.waterGoal = Anchor.util.safeNum(s.waterGoal, { min: 1, max: 16, fallback: 8, integer: true });
    s.profile.weightLb = Anchor.util.safeNum(s.profile.weightLb, { min: 60, max: 1000, fallback: 160 });
    if (Array.isArray(s.schedule)) {
      s.schedule.forEach(function (row) {
        if (row && !Anchor.util.isValidTime(row.time)) row.time = "08:00";
      });
    }
    return s;
  }

  // Explicit schema migration (deepMerge fills new keys; this stamps the version
  // and is where future structural migrations go).
  function migrate(s) {
    s.version = STATE_VERSION;
    return s;
  }

  // Keep date-keyed maps from growing forever. pan.log entries fold into the
  // running pan.manual total so total cooks are never lost on prune.
  function dateKeyCutoff(keepDays) {
    return Anchor.util.todayKey(Anchor.util.addDays(new Date(), -(keepDays || KEEP_DAYS)));
  }
  function pruneOldDates(s, keepDays) {
    var cutoff = dateKeyCutoff(keepDays);
    ["logs", "water", "meds", "overrides"].forEach(function (mapKey) {
      var map = s[mapKey]; if (!isObj(map)) return;
      Object.keys(map).forEach(function (k) { if (k < cutoff) delete map[k]; });
    });
    if (isObj(s.pan && s.pan.log)) {
      Object.keys(s.pan.log).forEach(function (k) {
        var datePart = k.split(":")[0];
        if (datePart < cutoff) { s.pan.manual = (s.pan.manual || 0) + 1; delete s.pan.log[k]; }
      });
    }
    if (Array.isArray(s.weights) && s.weights.length > 520) {
      s.weights = s.weights.slice(-520); // ~10 years of weekly logs
    }
    return s;
  }

  function load() {
    var raw;
    try {
      raw = localStorage.getItem(KEY);
    } catch (e) {
      raw = null;
    }
    var parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = null;
        // don't silently wipe corrupted data — stash it so it's recoverable
        try { localStorage.setItem(KEY + ".corrupt." + Date.now(), raw); } catch (e2) {}
      }
    }
    if (!isObj(parsed)) parsed = {};
    state = deepMerge(DEFAULTS, parsed);
    state = migrate(state);
    state = sanitizeTypes(state);
    if (!state.schedule) state.schedule = clone(Anchor.defaultSchedule);
    if (!state.kit) state.kit = clone(Anchor.defaultKit || []);
    if (!state.garden) state.garden = clone(Anchor.defaultGarden || []);
    if (!state.createdAt) state.createdAt = new Date().toISOString();
    pruneOldDates(state);
    return state;
  }

  function persist() {
    pruneOldDates(state);
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // most likely QuotaExceededError — tell the user once instead of silently
      // dropping their data.
      if (!quotaWarned && Anchor.util && Anchor.util.toast) {
        quotaWarned = true;
        Anchor.util.toast("Storage full — export a backup in Settings");
      }
    }
  }

  function emit() {
    listeners.forEach(function (fn) {
      try { fn(state); } catch (e) { /* keep other listeners alive */ }
    });
  }

  var store = {
    init: function () {
      load();
      return state;
    },
    get: function () {
      if (!state) load();
      return state;
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function unsubscribe() {
        listeners = listeners.filter(function (l) { return l !== fn; });
      };
    },
    /* Apply a mutation function, persist, and notify. */
    update: function (mutator) {
      if (!state) load();
      mutator(state);
      persist();
      emit();
      return state;
    },

    /* ---- convenience mutators ---- */
    setProfile: function (patch) {
      return store.update(function (s) {
        Object.assign(s.profile, patch);
      });
    },
    setTheme: function (theme) {
      return store.update(function (s) { s.theme = theme; });
    },
    toggleGrocery: function (itemName) {
      return store.update(function (s) {
        s.grocery[itemName] = !s.grocery[itemName];
      });
    },
    clearGrocery: function () {
      return store.update(function (s) { s.grocery = {}; });
    },
    toggleFavorite: function (id) {
      return store.update(function (s) {
        var i = s.favorites.indexOf(id);
        if (i >= 0) s.favorites.splice(i, 1);
        else s.favorites.push(id);
      });
    },
    isFavorite: function (id) {
      return store.get().favorites.indexOf(id) >= 0;
    },
    setOverride: function (dateKey, category, mealId) {
      return store.update(function (s) {
        if (!s.overrides[dateKey]) s.overrides[dateKey] = {};
        s.overrides[dateKey][category] = mealId;
      });
    },
    clearOverride: function (dateKey, category) {
      return store.update(function (s) {
        if (s.overrides[dateKey]) delete s.overrides[dateKey][category];
      });
    },

    /* ---- daily check-in logs ---- */
    getLog: function (dateKey) {
      return store.get().logs[dateKey] || { meals: 0, protein: false, booster: false, marks: {} };
    },
    setLog: function (dateKey, patch) {
      return store.update(function (s) {
        s.logs[dateKey] = Object.assign(store.getLog(dateKey), patch);
      });
    },
    toggleMealMark: function (dateKey, mealSlot) {
      return store.update(function (s) {
        var log = s.logs[dateKey] || { meals: 0, protein: false, booster: false, marks: {} };
        log.marks = log.marks || {};
        log.marks[mealSlot] = !log.marks[mealSlot];
        log.meals = Object.keys(log.marks).filter(function (k) { return log.marks[k]; }).length;
        s.logs[dateKey] = log;
      });
    },

    /* ---- weight tracking ---- */
    addWeight: function (lb, dateKey) {
      return store.update(function (s) {
        dateKey = dateKey || Anchor.util.todayKey();
        var existing = s.weights.find(function (w) { return w.date === dateKey; });
        if (existing) existing.lb = lb;
        else s.weights.push({ date: dateKey, lb: lb });
        s.weights.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        // keep profile weight current
        s.profile.weightLb = lb;
      });
    },
    removeWeight: function (dateKey) {
      return store.update(function (s) {
        s.weights = s.weights.filter(function (w) { return w.date !== dateKey; });
      });
    },

    /* ---- the pan (cost-per-use, buy-it-for-life) ---- */
    panUses: function () {
      var p = store.get().pan || {};
      return (p.manual || 0) + Object.keys(p.log || {}).length;
    },
    panStats: function () {
      var p = store.get().pan || { cost: 250 };
      var uses = store.panUses();
      var cpu = uses > 0 ? p.cost / uses : p.cost;
      return { name: p.name, cost: p.cost, uses: uses, costPerUse: cpu };
    },
    addPanCook: function (n) {
      return store.update(function (s) { s.pan.manual = Math.max(0, (s.pan.manual || 0) + (n == null ? 1 : n)); });
    },
    // auto-log a cook from a Today cook-gear meal check (deduped by date:slot)
    logPanCook: function (dateKey, slot, mealId, on) {
      return store.update(function (s) {
        var key = dateKey + ":" + slot;
        if (on) s.pan.log[key] = mealId;
        else delete s.pan.log[key];
      });
    },
    setPan: function (patch) {
      return store.update(function (s) { Object.assign(s.pan, patch); });
    },
    resetPanUses: function () {
      return store.update(function (s) { s.pan.manual = 0; s.pan.log = {}; });
    },

    /* ---- hydration ---- */
    getWater: function (dateKey) {
      return store.get().water[dateKey || Anchor.util.todayKey()] || 0;
    },
    addWater: function (n, dateKey) {
      return store.update(function (s) {
        dateKey = dateKey || Anchor.util.todayKey();
        s.water[dateKey] = Math.max(0, (s.water[dateKey] || 0) + n);
      });
    },
    setWaterGoal: function (n) {
      return store.update(function (s) {
        s.waterGoal = Anchor.util.safeNum(n, { min: 1, max: 16, fallback: 8, integer: true });
      });
    },

    /* ---- medication log ---- */
    getMed: function (dateKey) {
      return store.get().meds[dateKey || Anchor.util.todayKey()] || { taken: false, time: "", ateFirst: false };
    },
    setMed: function (patch, dateKey) {
      return store.update(function (s) {
        dateKey = dateKey || Anchor.util.todayKey();
        s.meds[dateKey] = Object.assign(store.getMed(dateKey), patch);
      });
    },

    /* ---- danger zone ---- */
    reset: function () {
      state = deepMerge(DEFAULTS, {});
      state.schedule = clone(Anchor.defaultSchedule);
      state.kit = clone(Anchor.defaultKit || []);
      state.garden = clone(Anchor.defaultGarden || []);
      state.createdAt = new Date().toISOString();
      persist();
      emit();
    },
    exportJSON: function () {
      return JSON.stringify(store.get(), null, 2);
    },
    // Throws on invalid input (caller shows a toast). A backup that's valid JSON
    // but the wrong shape is merged onto DEFAULTS and type-sanitized so it can't
    // crash the app later.
    importJSON: function (text) {
      var parsed = JSON.parse(text); // throws on bad JSON -> caught by caller
      if (!isObj(parsed)) throw new Error("Backup is not an Anchor state object");
      state = sanitizeTypes(migrate(deepMerge(DEFAULTS, parsed)));
      if (!state.schedule) state.schedule = clone(Anchor.defaultSchedule);
      if (!state.kit) state.kit = clone(Anchor.defaultKit || []);
      if (!state.garden) state.garden = clone(Anchor.defaultGarden || []);
      pruneOldDates(state);
      persist();
      emit();
    },

    /* ---- internals exposed for tests ---- */
    _internal: {
      migrate: migrate, sanitizeTypes: sanitizeTypes, pruneOldDates: pruneOldDates,
      deepMerge: deepMerge, DEFAULTS: DEFAULTS, KEY: KEY, STATE_VERSION: STATE_VERSION,
    },
  };

  Anchor.store = store;
})(window.Anchor = window.Anchor || {});
