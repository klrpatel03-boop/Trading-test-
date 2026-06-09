/* Tiny zero-dependency assertion + test-runner helper. */
let pass = 0, fail = 0;
const failures = [];

function ok(cond, msg) {
  if (cond) { pass++; console.log("  ok  " + msg); }
  else { fail++; failures.push(msg); console.error("FAIL  " + msg); }
}
function eq(a, b, msg) {
  ok(a === b, msg + "  (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")");
}
function approx(a, b, tol, msg) {
  ok(typeof a === "number" && Math.abs(a - b) <= (tol == null ? 0.001 : tol),
     msg + "  (got " + a + ", want ~" + b + ")");
}
function throws(fn, msg) {
  let threw = false;
  try { fn(); } catch (e) { threw = true; }
  ok(threw, msg + "  (expected throw)");
}
function notThrows(fn, msg) {
  let threw = null;
  try { fn(); } catch (e) { threw = e; }
  ok(!threw, msg + (threw ? "  (threw " + threw.message + ")" : ""));
}
function section(name) { console.log("\n— " + name + " —"); }
function summary(label) {
  console.log("\n" + (fail === 0
    ? "✅ " + label + ": " + pass + " passed"
    : "❌ " + label + ": " + fail + " FAILED, " + pass + " passed"));
  return fail === 0;
}

module.exports = { ok, eq, approx, throws, notThrows, section, summary };
