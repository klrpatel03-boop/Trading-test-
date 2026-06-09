/* Shared test harness for Anchor. Boots the app inside jsdom and returns the
 * live window + Anchor namespace. Used by unit.test.js and interaction.test.js.
 * jsdom is a dev-only dependency (npm i jsdom). */
const fs = require("fs");
const path = require("path");

function resolveJSDOM() {
  try { return require("jsdom").JSDOM; }
  catch (e) {
    try { return require("/tmp/jsdomtest/node_modules/jsdom").JSDOM; }
    catch (e2) { return null; }
  }
}

// The script load order (mirrors index.html).
const ORDER = [
  "js/data.js", "js/library.js", "js/cookbooks.js", "js/library2.js", "js/library3.js",
  "js/foods.js", "js/library4.js", "js/library5.js", "js/library6.js", "js/library7.js",
  "js/library8.js", "js/library9.js", "js/library10.js", "js/library_garden.js", "js/garden.js",
  "js/util.js", "js/store.js", "js/calc.js", "js/charts.js", "js/ui.js", "js/notify.js",
  "js/views/today.js", "js/views/decide.js", "js/views/plan.js", "js/views/prep.js",
  "js/views/menu.js", "js/views/plate.js", "js/views/cookday.js", "js/views/garden.js",
  "js/views/pan.js", "js/views/cookbooks.js", "js/views/flavor.js", "js/views/groceries.js",
  "js/views/budget.js", "js/views/calculator.js", "js/views/wellness.js", "js/views/track.js",
  "js/views/insights.js", "js/views/pantry.js", "js/views/learn.js", "js/views/help.js",
  "js/views/settings.js", "js/app.js",
];

/* Create a fresh jsdom app instance. Returns {window, Anchor, JSDOM} or null if
 * jsdom isn't installed (caller should skip). Each call is an isolated app. */
function loadApp(opts) {
  opts = opts || {};
  const JSDOM = resolveJSDOM();
  if (!JSDOM) return null;

  const appDir = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true, url: "https://example.test/index.html" });
  const window = dom.window;

  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  window.matchMedia = window.matchMedia || function () {
    return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
  };
  // fresh in-memory localStorage per instance (so tests don't leak into each other)
  const ls = opts.localStorage || (function () {
    const m = {};
    return {
      getItem: (k) => (k in m ? m[k] : null),
      setItem: (k, v) => { m[k] = String(v); },
      removeItem: (k) => { delete m[k]; },
      clear: () => { Object.keys(m).forEach((k) => delete m[k]); },
      _map: m,
    };
  })();
  Object.defineProperty(window, "localStorage", { value: ls, configurable: true });
  window.confirm = () => true;
  window.alert = () => {};
  window.scrollTo = () => {};
  window.Notification = undefined;
  window.navigator.clipboard = { writeText() { return Promise.resolve(); } };
  window.URL.createObjectURL = () => "blob:stub";
  window.URL.revokeObjectURL = () => {};

  const vm = require("vm");
  const ctx = vm.createContext(window);
  window.global = window;
  for (const rel of ORDER) {
    const code = fs.readFileSync(path.join(appDir, rel), "utf8");
    vm.runInContext(code, ctx, { filename: rel });
  }
  return { window, Anchor: window.Anchor, JSDOM, localStorage: ls };
}

module.exports = { loadApp, ORDER };
