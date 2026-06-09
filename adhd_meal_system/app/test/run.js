/* Runs the whole Anchor test suite: unit -> interaction -> smoke.
 * Each test file is a standalone node script that exits 0 (pass) / 1 (fail).
 * Usage:  npm i jsdom  &&  node test/run.js  */
const { spawnSync } = require("child_process");
const path = require("path");

const files = ["unit.test.js", "interaction.test.js", "smoke.js"];
let failed = 0;

for (const f of files) {
  console.log("\n══════════ " + f + " ══════════");
  const res = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: "inherit" });
  if (res.status !== 0) failed++;
}

console.log("\n══════════ SUMMARY ══════════");
if (failed === 0) {
  console.log("✅ ALL TEST FILES PASSED (" + files.length + ")");
  process.exit(0);
} else {
  console.log("❌ " + failed + " of " + files.length + " test files FAILED");
  process.exit(1);
}
