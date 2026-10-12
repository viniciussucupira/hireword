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

const read = (path) => readFileSync(path, "utf8");
const offenders = (pattern) => files.filter((path) => pattern.test(read(path))).map((path) => relative(root, path));

test("no page, plan, FAQ or message calls Pro unlimited", () => {
  assert.ok(files.length > 40, "the scan found the site's files");
  assert.deepEqual(offenders(/unlimited/i), []);
});

test("the retired monthly count, its caveat and the old request length appear nowhere", () => {
  assert.deepEqual(offenders(/\b600 rewrites/i), []);
  assert.deepEqual(offenders(/long texts? can count as more than one/i), []);
  assert.deepEqual(offenders(/6,000 characters/i), []);
});

test("every daily figure written anywhere is the daily limit", () => {
  let seen = 0;
  for (const path of files) {
    for (const match of read(path).matchAll(/(\d+) (?:polished )?(?:rewrites|cover letters|applications) (?:a|per) day/gi)) {
      seen++;
      assert.equal(Number(match[1]), allowance.PRO_DAILY_REWRITES, `${relative(root, path)}: ${match[0]}`);
    }
  }
  assert.ok(seen >= 3, `found ${seen} daily figures`);
});

test("every request length written anywhere is the editor's limit", () => {
  const limit = readFileSync(join(root, "lib/constants.ts"), "utf8").match(/MAX_INPUT_CHARS = (\d+)/)[1];
  const written = Number(limit).toLocaleString("en-US");
  for (const path of files) {
    for (const match of read(path).matchAll(/(\d{1,2},\d{3}) characters/g)) {
      assert.equal(match[1], written, `${relative(root, path)}: ${match[0]}`);
    }
  }
});

test("the FAQ and the Terms state the daily limit", () => {
  const faq = read(join(root, "lib/faq.ts"));
  assert.ok(faq.includes(`Up to ${allowance.PRO_DAILY_REWRITES} rewrites a day`), "FAQ states the daily figure");
  assert.ok(faq.includes(`Your ${allowance.PRO_DAILY_REWRITES} reset every day at 00:00 UTC`));
  const terms = read(join(root, "app/terms/page.tsx"));
  assert.ok(terms.includes("Pro includes up to {PRO_DAILY_REWRITES} rewrites per day for each Pro account"), "Terms state the limit from the constant");
  assert.match(terms, /import \{ PRO_DAILY_REWRITES \} from "@\/lib\/allowance"/);
  assert.match(terms, /monthly safeguard against automated use/);
});
