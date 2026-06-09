/* Headless smoke test for the Anchor app.
 * Boots the SPA in jsdom, then renders every view + opens a meal modal +
 * exercises the decision engine, grocery toggles, weight logging, and the
 * cookbook search. Fails loudly on any thrown error. Run: node test/smoke.js
 */
const fs = require("fs");
const path = require("path");
// jsdom is a dev-only dependency. Try a normal resolve first; fall back to a
// scratch install path; skip gracefully if it isn't available anywhere.
let JSDOM;
try {
  JSDOM = require("jsdom").JSDOM;
} catch (e) {
  try {
    JSDOM = require("/tmp/jsdomtest/node_modules/jsdom").JSDOM;
  } catch (e2) {
    console.log("⚠ jsdom not installed — skipping headless smoke test.");
    console.log("  Install with:  npm install jsdom   (then re-run node test/smoke.js)");
    process.exit(0);
  }
}

const appDir = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");

const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "https://example.test/index.html",
});
const { window } = dom;

// polyfills jsdom lacks
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
};
if (!window.localStorage) {
  const store = {};
  window.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
}
window.confirm = () => true;
window.alert = () => {};
window.scrollTo = () => {};
window.Notification = undefined;
window.navigator.clipboard = { writeText() { return Promise.resolve(); } };
window.URL.createObjectURL = () => "blob:stub";
window.URL.revokeObjectURL = () => {};

// expose globals the IIFEs expect
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.location = window.location;
global.setTimeout = setTimeout;
global.requestAnimationFrame = window.requestAnimationFrame;
global.matchMedia = window.matchMedia;
global.Notification = undefined;
global.Blob = window.Blob;
global.confirm = window.confirm;

// load scripts in the order index.html lists them
const order = [
  "js/data.js", "js/library.js", "js/cookbooks.js", "js/library2.js", "js/library3.js", "js/foods.js", "js/library4.js", "js/library5.js", "js/library6.js", "js/library7.js", "js/library8.js", "js/library9.js", "js/library10.js", "js/library_garden.js", "js/garden.js", "js/util.js", "js/store.js",
  "js/calc.js", "js/charts.js", "js/ui.js", "js/notify.js",
  "js/views/today.js", "js/views/decide.js", "js/views/plan.js", "js/views/prep.js", "js/views/menu.js", "js/views/plate.js",
  "js/views/cookday.js", "js/views/garden.js", "js/views/cookbooks.js", "js/views/flavor.js", "js/views/groceries.js",
  "js/views/budget.js", "js/views/calculator.js", "js/views/wellness.js", "js/views/track.js", "js/views/insights.js",
  "js/views/pantry.js", "js/views/learn.js", "js/views/help.js", "js/views/settings.js",
  "js/app.js",
];

let failures = 0;
function ok(msg) { console.log("  ok  " + msg); }
function fail(msg, e) { failures++; console.error("FAIL  " + msg + "\n      " + (e && e.stack || e)); }

// evaluate each script in the window context
const vm = require("vm");
const ctx = vm.createContext(window);
window.global = window;
for (const rel of order) {
  const code = fs.readFileSync(path.join(appDir, rel), "utf8");
  try {
    vm.runInContext(code, ctx, { filename: rel });
    ok("loaded " + rel);
  } catch (e) {
    fail("loading " + rel, e);
  }
}

const A = window.Anchor;
if (!A) { console.error("Anchor global missing — aborting"); process.exit(1); }

// data integrity checks
(function checkData() {
  try {
    const ids = {};
    A.meals.forEach((m) => {
      if (ids[m.id]) throw new Error("duplicate meal id: " + m.id);
      ids[m.id] = 1;
      ["name", "category", "gear", "protein", "calories", "cost"].forEach((k) => {
        if (m[k] === undefined) throw new Error(m.id + " missing " + k);
      });
    });
    if (A.meals.length < 175) throw new Error("expected 50+ meals, got " + A.meals.length);
    ok("meal DB integrity (" + A.meals.length + " meals, unique ids)");
  } catch (e) { fail("meal DB integrity", e); }
})();

// boot the app
try {
  A.app.boot();
  ok("app.boot()");
} catch (e) { fail("app.boot()", e); }

// render every view
const views = Object.keys(A.views);
views.forEach((v) => {
  try {
    const root = window.document.createElement("div");
    A.views[v].render(root, {});
    if (!root.childNodes.length) throw new Error("rendered empty");
    ok("render view: " + v + " (" + A.views[v].title + ")");
  } catch (e) { fail("render view: " + v, e); }
});

// open a meal modal
try {
  A.ui.openMeal(A.meals[0]);
  if (!window.document.querySelector(".modal-overlay")) throw new Error("modal not in DOM");
  // recipe links present?
  if (!window.document.querySelector(".recipe-links")) throw new Error("recipe links missing in modal");
  A.ui.closeModal();
  ok("meal modal opens with trusted recipe links");
} catch (e) { fail("meal modal", e); }

// decision engine
try {
  const m1 = A.decide({ energy: "low", time: "5", crave: "any" });
  const m2 = A.decide({ energy: "high", time: "plenty", crave: "hot" });
  if (!m1 || !m2) throw new Error("decide returned nothing");
  if (m1.gear !== "floor") throw new Error("low energy should give a no-cook meal");
  ok("decision engine (low→floor, high→cook)");
} catch (e) { fail("decision engine", e); }

// cookbook search links
try {
  const links = A.searchAllCookbooks("lentil chili");
  if (!links.length || !/budgetbytes\.com\/\?s=/.test(links[0].url)) throw new Error("bad search url: " + (links[0] && links[0].url));
  const rl = A.recipeSearchLinks(A.byId("chili"));
  if (!rl.length) throw new Error("no per-meal recipe links");
  ok("cookbook search links build correctly");
} catch (e) { fail("cookbook search links", e); }

// store mutations
try {
  A.store.toggleGrocery("Eggs (2–3 dozen)");
  A.store.addWeight(165, "2026-06-01");
  A.store.addWeight(166, "2026-06-08");
  const t = A.calc.weightTrend(A.store.get().weights);
  if (!t) throw new Error("weight trend null");
  A.store.toggleFavorite(A.meals[0].id);
  if (!A.store.isFavorite(A.meals[0].id)) throw new Error("favorite not saved");
  ok("store: grocery + weight + trend + favorites persist");
} catch (e) { fail("store mutations", e); }

// targets calc
try {
  const tg = A.calc.targets({ weightLb: 150, goal: "gain", activity: "moderate" });
  if (tg.calories <= tg.maintenance) throw new Error("gain should exceed maintenance");
  if (tg.protein < 100) throw new Error("protein too low");
  ok("targets: gain surplus computed (" + tg.calories + " cal, " + tg.protein + "g protein)");
} catch (e) { fail("targets calc", e); }

// garden / kit personalization
try {
  if (typeof A.fitsBigPan !== "function" || typeof A.usesKale !== "function") throw new Error("garden helpers missing");
  const kale = A.kaleRecipes();
  if (kale.length < 8) throw new Error("expected kale recipes, got " + kale.length);
  if (!A.fitsBigPan(A.byId("chili"))) throw new Error("chili should fit the big pan");
  const st = A.store.get();
  if (!st.garden || !st.garden.some(g => /kale/i.test(g.crop))) throw new Error("garden not seeded with kale");
  ok("garden: kale recipes (" + kale.length + ") + 6-qt pan fit + seeded garden");
} catch (e) { fail("garden personalization", e); }

// navigate via hash to each view through the router
try {
  views.forEach((v) => { window.location.hash = "#" + v; A.router.refresh(); });
  window.location.hash = "#today";
  A.router.refresh();
  ok("router navigates all " + views.length + " views");
} catch (e) { fail("router navigation", e); }

console.log("\n" + (failures === 0
  ? "✅ ALL SMOKE TESTS PASSED (" + views.length + " views)"
  : "❌ " + failures + " FAILURE(S)"));
process.exit(failures === 0 ? 0 : 1);
