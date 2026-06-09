/* Unit tests — pure functions + store internals, hammered with the bad inputs
 * the smoke test never exercised (NaN, negative, empty, malformed dates, etc). */
const { loadApp } = require("./harness");
const A = require("./assert");

const app = loadApp();
if (!app) {
  console.log("⚠ jsdom not installed — skipping unit tests. Run: npm i jsdom");
  process.exit(0);
}
const Anchor = app.Anchor;
const { util, calc, charts, store } = Anchor;
const intl = store._internal;
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ---------------- util.safeNum ---------------- */
A.section("util.safeNum");
A.eq(util.safeNum("abc", { fallback: 160 }), 160, "non-numeric -> fallback");
A.eq(util.safeNum("", { fallback: 8 }), 8, "empty -> fallback");
A.eq(util.safeNum(Infinity, { fallback: 8 }), 8, "Infinity -> fallback");
A.eq(util.safeNum(NaN, { fallback: 5 }), 5, "NaN -> fallback");
A.eq(util.safeNum(-5, { min: 0 }), 0, "below min clamps");
A.eq(util.safeNum(999, { max: 16 }), 16, "above max clamps");
A.eq(util.safeNum(3.7, { integer: true }), 4, "integer rounds");
A.eq(util.safeNum("180", {}), 180, "numeric string coerces");

/* ---------------- util dates ---------------- */
A.section("util dates");
A.ok((function () { var d = util.keyToDate("2026-06-09"); return d && typeof d.getTime === "function"; })(), "valid key -> Date");
A.eq(util.keyToDate("2026-6-9"), null, "non-padded -> null");
A.eq(util.keyToDate("2026-13-01"), null, "month 13 -> null");
A.eq(util.keyToDate("2026-02-31"), null, "overflow day -> null");
A.eq(util.keyToDate("garbage"), null, "garbage -> null");
A.eq(util.keyToDate(null), null, "null -> null");
A.eq(util.todayKey().length, 10, "todayKey is YYYY-MM-DD");
A.ok(/^\d{4}-\d{2}-\d{2}$/.test(util.todayKey()), "todayKey format");
A.ok(util.isValidTime("08:00"), "08:00 valid");
A.ok(!util.isValidTime("25:90"), "25:90 invalid");
A.ok(!util.isValidTime("xyz"), "xyz invalid");

/* ---------------- calc.targets (the NaN bug) ---------------- */
A.section("calc.targets");
let t = calc.targets({ weightLb: "abc", goal: "gain" });
A.ok(isFinite(t.calories) && t.calories > 0, "garbage weight -> finite calories (not NaN)");
A.ok(isFinite(t.protein) && t.protein > 0, "garbage weight -> finite protein");
A.eq(calc.targets({ weightLb: -5 }).weightLb, 60, "negative weight clamps to 60");
A.eq(calc.targets({ weightLb: 99999 }).weightLb, 1000, "huge weight clamps to 1000");
t = calc.targets({ weightLb: 160, goal: "gain", activity: "moderate" });
A.eq(t.calories, 2720, "160lb gain -> 2720 cal");
A.eq(t.protein, 160, "160lb gain -> 160g protein");
A.ok(calc.targets({ weightLb: 160, goal: "cut" }).calories < t.calories, "cut < gain");

/* ---------------- calc.weightTrend ---------------- */
A.section("calc.weightTrend");
A.eq(calc.weightTrend([]), null, "empty -> null");
A.eq(calc.weightTrend([{ date: "2026-06-01", lb: 160 }]), null, "one point -> null");
let tr = calc.weightTrend([{ date: "2026-06-01", lb: 160 }, { date: "2026-06-08", lb: 161 }]);
A.ok(tr && isFinite(tr.perWeek), "two points -> finite trend");
A.approx(calc.weightTrend([{ date: "2026-06-01", lb: 160 }, { date: "2026-06-08", lb: 160 }]).perWeek, 0, 0.001, "identical -> ~0/wk");
A.eq(calc.weightTrend([{ date: "bad", lb: 160 }, { date: "2026-06-08", lb: 161 }]), null, "malformed date filtered -> 1 valid -> null");
A.notThrows(() => calc.weightTrend([{ date: "x", lb: "y" }, { date: "z", lb: NaN }]), "all-bad doesn't throw");

/* ---------------- charts edge cases ---------------- */
A.section("charts");
A.eq(charts.ring({ value: NaN }).querySelector(".ring-value").textContent, "0%", "ring(NaN) -> 0%");
A.eq(charts.ring({ value: 0.5 }).querySelector(".ring-value").textContent, "50%", "ring(0.5) -> 50%");
A.ok(charts.line([]).querySelector(".chart-empty"), "line([]) -> empty label");
A.notThrows(() => charts.line([{ x: 1, y: 5 }]), "line(1 point) no throw");
A.notThrows(() => charts.line([{ x: 1, y: 5 }, { x: 2, y: 5 }]), "line(identical y) no throw");

/* ---------------- store.sanitizeTypes (corruption) ---------------- */
A.section("store.sanitizeTypes");
let bad = intl.deepMerge(intl.DEFAULTS, {
  weights: "not-an-array", favorites: null, grocery: 5,
  pan: { cost: "-5", manual: "NaN", log: null }, waterGoal: 999,
  profile: { weightLb: "abc" },
});
intl.sanitizeTypes(bad);
A.ok(Array.isArray(bad.weights), "weights coerced to array");
A.ok(bad.grocery && typeof bad.grocery === "object" && !Array.isArray(bad.grocery), "grocery coerced to object");
A.ok(bad.pan.log && typeof bad.pan.log === "object", "pan.log coerced to object");
A.eq(bad.pan.cost, 0, "negative pan cost clamped to 0");
A.eq(bad.pan.manual, 0, "NaN pan manual -> 0");
A.eq(bad.waterGoal, 16, "waterGoal 999 clamped to 16");
A.eq(bad.profile.weightLb, 160, "garbage weight -> 160");
A.notThrows(() => bad.weights.push({ date: "2026-06-09", lb: 160 }), "weights.push works after sanitize");

/* ---------------- store.migrate ---------------- */
A.section("store.migrate");
A.eq(intl.migrate({}).version, intl.STATE_VERSION, "migrate stamps version");

/* ---------------- store.pruneOldDates (bounded growth) ---------------- */
A.section("store.pruneOldDates");
let s = intl.deepMerge(intl.DEFAULTS, {});
let old = util.todayKey(util.addDays(new Date(), -500));
let today = util.todayKey();
s.logs[old] = { meals: 1 }; s.logs[today] = { meals: 3 };
s.water[old] = 5; s.water[today] = 2;
s.pan = { cost: 250, manual: 2, log: {} };
s.pan.log[old + ":dinner"] = "chili"; s.pan.log[today + ":dinner"] = "dal";
intl.pruneOldDates(s);
A.eq(s.logs[old], undefined, "old log pruned");
A.ok(s.logs[today], "today log kept");
A.eq(s.water[old], undefined, "old water pruned");
A.eq(s.pan.manual, 3, "pruned pan.log folded into manual (2 -> 3)");
A.ok(s.pan.log[today + ":dinner"], "today pan cook kept");
// weights cap
let many = []; for (let i = 0; i < 600; i++) many.push({ date: "2020-01-01", lb: 160 });
let s2 = intl.deepMerge(intl.DEFAULTS, { weights: many });
intl.pruneOldDates(s2);
A.eq(s2.weights.length, 520, "weights capped at 520");

process.exit(A.summary("unit") ? 0 : 1);
