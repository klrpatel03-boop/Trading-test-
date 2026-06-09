/* ============================================================================
 * Anchor — store.js
 * State management + localStorage persistence. No DOM. A tiny pub/sub store so
 * views re-render when state changes. Attaches to window.Anchor.store.
 * ==========================================================================*/
(function (Anchor) {
  "use strict";

  var KEY = "anchor.state.v1";

  var DEFAULTS = {
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

  function load() {
    var raw;
    try {
      raw = localStorage.getItem(KEY);
    } catch (e) {
      raw = null;
    }
    var parsed = null;
    if (raw) {
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    }
    state = deepMerge(DEFAULTS, parsed || {});
    if (!state.schedule) {
      state.schedule = clone(Anchor.defaultSchedule);
    }
    if (!state.kit) state.kit = clone(Anchor.defaultKit || []);
    if (!state.garden) state.garden = clone(Anchor.defaultGarden || []);
    if (!state.createdAt) {
      state.createdAt = new Date().toISOString();
    }
    return state;
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage might be full or blocked; fail silently */
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
      return store.update(function (s) { s.waterGoal = Math.max(1, n); });
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
      state.createdAt = new Date().toISOString();
      persist();
      emit();
    },
    exportJSON: function () {
      return JSON.stringify(store.get(), null, 2);
    },
    importJSON: function (text) {
      var parsed = JSON.parse(text);
      state = deepMerge(DEFAULTS, parsed);
      persist();
      emit();
    },
  };

  Anchor.store = store;
})(window.Anchor = window.Anchor || {});
