import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

describe("minimatch security backport", () => {
  it("rejects a partial patch instead of certifying an absent security guard", () => {
    const fixture = mkdtempSync(resolve(tmpdir(), "minimatch-security-"));
    try {
      mkdirSync(resolve(fixture, "scripts"));
      mkdirSync(resolve(fixture, "node_modules/eslint"), { recursive: true });
      const pkg = "node_modules/minimatch";
      const dir = resolve(fixture, pkg);
      mkdirSync(dir, { recursive: true });
      writeFileSync(resolve(dir, "package.json"), JSON.stringify({ version: "10.2.6" }));
      writeFileSync(resolve(fixture, "package-lock.json"), JSON.stringify({ packages: { [pkg]: { version: "10.2.6" } } }));
      copyFileSync(resolve("scripts/patch-minimatch.mjs"), resolve(fixture, "scripts/patch-minimatch.mjs"));
      for (const format of ["commonjs", "esm"]) {
        const target = resolve(dir, `dist/${format}`);
        mkdirSync(target, { recursive: true });
        const source = readFileSync(resolve(`node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch/dist/${format}/index.js`), "utf8");
        writeFileSync(resolve(target, "index.js"), source);
      }
      const run = () => spawnSync(process.execPath, [resolve(fixture, "scripts/patch-minimatch.mjs")], { encoding: "utf8", timeout: 5000 });
      expect(run().status).toBe(0); // a complete patch is idempotent
      const target = resolve(dir, "dist/commonjs/index.js");
      const partial = readFileSync(target, "utf8").replace("p2 === '..' || globParts.length >= braceExpandMax)", "p2 === '..')");
      writeFileSync(target, partial);
      const result = run();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Unrecognized minimatch source");
      expect(readFileSync(target, "utf8")).toBe(partial);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
  for (const format of ["commonjs", "esm"]) {
    it(`bounds preprocessing in the installed ${format} entry point`, () => {
      const entry = resolve(`node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch/dist/${format}/index.js`);
      // A subprocess bounds the regression test itself if the vulnerable code returns.
      const result = spawnSync(process.execPath, ["--max-old-space-size=128", "--input-type=module", "-e", `
        import assert from 'node:assert/strict';
        import { pathToFileURL } from 'node:url';
        const { Minimatch } = await import(pathToFileURL(${JSON.stringify(entry)}));
        const small = new Minimatch(Array(8).fill('**/../a/b').join('/'), {
          optimizationLevel: 2, braceExpandMax: 8,
        });
        assert.equal(small.set.length, 8);
        const large = new Minimatch(Array(30).fill('**/../a/b').join('/'), {
          optimizationLevel: 2,
        });
        assert.equal(large.set.length, 1000);
        const matcher = new Minimatch('**/*.ts');
        matcher.partsMatch = () => { throw new Error('quadratic comparison was reached'); };
        const parts = Array.from({ length: 1001 }, (_, i) => [String(i)]);
        assert.equal(matcher.secondPhasePreProcess(parts), parts);
        assert.equal(new Minimatch('**/*.ts').match('src/example.ts'), true);
        assert.equal(new Minimatch('**/*.ts').match('src/example.js'), false);
      `], { timeout: 15000, encoding: "utf8" });
      expect(result.error).toBeUndefined();
      expect(result.stderr).toBe("");
      expect(result.status).toBe(0);
    });
  }
});
