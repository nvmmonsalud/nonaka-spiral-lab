// Backport https://github.com/isaacs/minimatch/commit/77a0f5c
// Keep the v10 API required by typescript-eslint. Remove when consumers support v11.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
// Production-only installs have no lint dependencies to patch.
if (!existsSync(new URL("node_modules/eslint", root)) &&
    !existsSync(new URL("node_modules/@typescript-eslint/typescript-estree", root))) {
  console.log("No lint toolchain installed; minimatch backport is not needed.");
  process.exit(0);
}
const lock = JSON.parse(readFileSync(new URL("package-lock.json", root), "utf8"));
const changes = [
  ["firstPhasePreProcess(globParts) {", "firstPhasePreProcess(globParts) {\n        const { braceExpandMax = 1000 } = this.options;"],
  ["p2 === '..') {", "p2 === '..' || globParts.length >= braceExpandMax) {"],
  ["secondPhasePreProcess(globParts) {", "secondPhasePreProcess(globParts) {\n        if (globParts.length > 1000) return globParts;"],
];
const hashes = {
  commonjs: "d224f71f20d7c206fcc5b7e9f747324c7698345a0b2c28d717dd9cf698306783",
  esm: "59821ec2ce0d3df968292036e5c831ad322b33e9c33a949ecbc9dfe125d165be",
};
const patchedHashes = {
  commonjs: "69dc715dc0cfe8dfcb5337ca03b7dd13813f4db9a5ceb5623de20298e719c0b3",
  esm: "e94c1feb231e5899434e149c38897496fa8276375c02dee5f736d5ac7928ccb5",
};
const hash = (text) => createHash("sha256").update(text).digest("hex");
const writes = [];
let patched = 0;
for (const [path, pkg] of Object.entries(lock.packages)) {
  if (!path.endsWith("node_modules/minimatch")) continue;
  const installed = JSON.parse(readFileSync(new URL(`${path}/package.json`, root), "utf8"));
  if (installed.version !== pkg.version) throw new Error(`Lock/install mismatch: ${path}`);
  // v3 has no firstPhasePreProcess/optimizationLevel implementation. The advisory
  // range includes it, but the vulnerable code was introduced in later majors.
  if (pkg.version === "3.1.5") continue;
  if (pkg.version !== "10.2.6") throw new Error(`Reassess minimatch backport for ${path}@${pkg.version}`);
  for (const [format, expected] of Object.entries(hashes)) {
    const file = new URL(`${path}/dist/${format}/index.js`, root);
    const source = readFileSync(file, "utf8");
    if (hash(source) === expected) {
      let result = source;
      for (const [before, after] of changes) {
        if (result.split(before).length !== 2) throw new Error(`Unexpected source: ${file}`);
        result = result.replace(before, after);
      }
      if (hash(result) !== patchedHashes[format]) throw new Error(`Unexpected backport output: ${file}`);
      writes.push([file, result]);
    } else if (hash(source) !== patchedHashes[format]) {
      throw new Error(`Unrecognized minimatch source: ${fileURLToPath(file)}`);
    }
    patched++;
  }
}
if (!patched) throw new Error("Expected minimatch v10 not found; reassess the backport");
// Validate every entry before changing any of them. Re-running is idempotent.
for (const [file, source] of writes) writeFileSync(file, source);
console.log(`Verified minimatch security backport (${patched} entry points).`);
