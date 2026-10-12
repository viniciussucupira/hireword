import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import * as aiCost from "./ai-cost.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const allowance = {};
vm.runInNewContext(ts.transpileModule(readFileSync(join(root, "lib/allowance.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: allowance, require: () => aiCost, TextEncoder, Date, Math, Number });

function sources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|mdx?|txt|json)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}
const files = ["app", "components", "lib"].flatMap((dir) => sources(join(root, dir)));

test("no page, plan, FAQ or message calls Pro unlimited", () => {
  assert.ok(files.length > 40, "the scan found the site's files");
  const offenders = files.filter((path) => /unlimited/i.test(readFileSync(path, "utf8"))).map((path) => relative(root, path));
  assert.deepEqual(offenders, []);
});

test("every written monthly rewrite count matches the meter", () => {
  let seen = 0;
  for (const path of files) {
    for (const match of readFileSync(path, "utf8").matchAll(/(\d[\d,]*) rewrites (?:a month|per calendar month|for \$19)/g)) {
      seen++;
      assert.equal(Number(match[1].replace(/,/g, "")), allowance.PRO_MONTHLY_REWRITES, `${relative(root, path)}: ${match[0]}`);
    }
  }
  assert.ok(seen >= 8, `found ${seen} written counts`);
});
