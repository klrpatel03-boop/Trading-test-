# Anchor tests

No build step. Tests run in Node with [jsdom](https://github.com/jsdom/jsdom) as the
only dev dependency.

```bash
cd adhd_meal_system/app
npm install jsdom      # one-time
node test/run.js       # runs unit + interaction + smoke
```

Exit code is non-zero if anything fails (CI-friendly).

## What's covered
- **`unit.test.js`** — pure functions + store internals against the inputs the app
  must survive: `safeNum` bounds, malformed/overflow date keys, `calc.targets` with
  garbage/negative/huge weight (the NaN bug), `weightTrend` with 0/1/2+ points and bad
  rows, `charts` with NaN / empty / single / identical data, and `store` corruption
  recovery (`sanitizeTypes`), `migrate`, and bounded-growth `pruneOldDates`.
- **`interaction.test.js`** — boots the app in jsdom and drives real flows, asserting
  state **persists across a simulated reload**: grocery toggle, weight log → trend,
  meal swap override, pan cooking → cost-per-use drop (+ dedup), settings edits with
  validation/clamping, export→import round-trip (and rejecting bad imports), and reset.
  Also re-renders every view on a booted instance.
- **`smoke.js`** — the original "does it boot and render all views" check.

## Helpers
- `harness.js` — boots the app inside jsdom (fresh in-memory localStorage per instance)
  and returns the live `Anchor` namespace. Pass `{localStorage}` to reuse storage and
  simulate a page reload.
- `assert.js` — tiny zero-dep assertion + summary runner (`ok/eq/approx/throws/notThrows`).
