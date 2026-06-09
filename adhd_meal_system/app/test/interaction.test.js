/* Interaction tests — boot the app, drive real user flows, and assert state
 * persists across a simulated reload (re-loading from the same localStorage). */
const { loadApp } = require("./harness");
const A = require("./assert");

const app = loadApp();
if (!app) {
  console.log("⚠ jsdom not installed — skipping interaction tests. Run: npm i jsdom");
  process.exit(0);
}
const { Anchor, window, localStorage } = app;
const doc = window.document;
const reload = () => loadApp({ localStorage: localStorage }).Anchor; // same storage = a "refresh"

function renderView(Anc, name) {
  const root = doc.createElement("div");
  Anc.views[name].render(root, {});
  return root;
}

/* ---- every view still renders on a booted instance ---- */
A.section("render all views (booted)");
let blank = 0;
Object.keys(Anchor.views).forEach((v) => {
  try {
    const root = renderView(Anchor, v);
    if (!root.childNodes.length) { blank++; A.ok(false, "view " + v + " rendered empty"); }
  } catch (e) { A.ok(false, "view " + v + " threw: " + e.message); }
});
A.ok(blank === 0, "no view rendered blank");

/* ---- grocery toggle persists across reload ---- */
A.section("grocery persistence");
const item = Anchor.grocerySections[0].items[0].name;
Anchor.store.toggleGrocery(item);
A.ok(Anchor.store.get().grocery[item] === true, "grocery item checked");
A.eq(reload().store.get().grocery[item], true, "grocery survives reload");

/* ---- weight log -> trend + persistence ---- */
A.section("weight logging");
Anchor.store.addWeight(160, "2026-06-01");
Anchor.store.addWeight(161, "2026-06-08");
A.ok(Anchor.calc.weightTrend(Anchor.store.get().weights), "trend computes after 2 logs");
A.eq(reload().store.get().weights.length, 2, "weights survive reload");
A.notThrows(() => renderView(reload(), "insights"), "insights renders with weight data");
A.notThrows(() => renderView(reload(), "track"), "track renders with weight data");

/* ---- meal override (swap) persists ---- */
A.section("meal swap override");
const today = Anchor.util.todayKey();
const someDinner = Anchor.byCategory("dinner")[0].id;
Anchor.store.setOverride(today, "dinner", someDinner);
A.eq(reload().store.get().overrides[today].dinner, someDinner, "override survives reload");

/* ---- pan: cooking drops cost-per-use ---- */
A.section("pan cost-per-use");
Anchor.store.addPanCook(1);                       // 1 cook -> $250/use
const cpu1 = Anchor.store.panStats().costPerUse;
Anchor.store.addPanCook(1);                       // 2 cooks -> $125/use
const after = Anchor.store.panStats();
A.ok(after.uses >= 2, "pan uses incremented");
A.ok(after.costPerUse < cpu1, "cost-per-use dropped with more cooks");
A.ok(reload().store.panUses() >= 1, "pan uses survive reload");
// auto-log from a cooked dinner check (deduped by date:slot)
Anchor.store.logPanCook(today, "dinner", someDinner, true);
const usesA = Anchor.store.panUses();
Anchor.store.logPanCook(today, "dinner", someDinner, true); // same slot again
A.eq(Anchor.store.panUses(), usesA, "logging same date:slot twice doesn't double-count");

/* ---- settings edits persist + validate ---- */
A.section("settings edits");
Anchor.store.setProfile({ weightLb: 175 });
A.eq(reload().store.get().profile.weightLb, 175, "weight edit persists");
Anchor.store.setWaterGoal(999);
A.eq(reload().store.get().waterGoal, 16, "water goal clamps to 16 on persist");
Anchor.store.setPan({ cost: -50 });
// setPan stores raw; sanitize runs on load -> reload clamps to >=0
A.ok(reload().store.get().pan.cost >= 0, "negative pan cost sanitized on reload");

/* ---- export -> mutate -> import round-trips ---- */
A.section("export / import");
const backup = Anchor.store.exportJSON();
Anchor.store.setProfile({ weightLb: 200 });
A.eq(Anchor.store.get().profile.weightLb, 200, "weight changed before import");
Anchor.store.importJSON(backup);
A.eq(Anchor.store.get().profile.weightLb, 175, "import restored prior weight");
A.throws(() => Anchor.store.importJSON("{not valid json"), "import rejects bad JSON");
A.throws(() => Anchor.store.importJSON("42"), "import rejects non-object JSON");

/* ---- corrupted storage recovers, keeps a backup ---- */
A.section("corruption recovery");
const badLS = (function () {
  const m = { "anchor.state.v1": "{not valid json" };
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; }, clear: () => {}, _map: m,
  };
})();
const recovered = loadApp({ localStorage: badLS }).Anchor;
A.eq(recovered.store.get().profile.weightLb, 160, "corrupt state recovers to defaults");
A.ok(Object.keys(badLS._map).some((k) => k.indexOf(".corrupt.") >= 0), "corrupt blob stashed for recovery");

/* ---- reset wipes user data ---- */
A.section("reset");
Anchor.store.toggleFavorite(Anchor.meals[0].id);
Anchor.store.reset();
A.eq(Anchor.store.get().favorites.length, 0, "favorites cleared after reset");
A.eq(Anchor.store.get().weights.length, 0, "weights cleared after reset");
A.ok(Array.isArray(Anchor.store.get().garden), "garden re-seeded after reset");

process.exit(A.summary("interaction") ? 0 : 1);
