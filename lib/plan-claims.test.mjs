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

test("every monthly rewrite count written anywhere matches the meter", () => {
  for (const path of files) {
    for (const match of readFileSync(path, "utf8").matchAll(/(\d[\d,]*) rewrites (?:a month|per calendar month|for \$19)/g)) {
      assert.equal(Number(match[1].replace(/,/g, "")), allowance.PRO_MONTHLY_REWRITES, `${relative(root, path)}: ${match[0]}`);
    }
  }
});

test("the FAQ and the Terms state the allowance", () => {
  const faq = readFileSync(join(root, "lib/faq.ts"), "utf8");
  assert.ok(faq.includes(`Pro includes ${allowance.PRO_MONTHLY_REWRITES} rewrites a month`), "FAQ states the monthly figure");
  const perDay = faq.match(/about (\d+) a day/);
  assert.ok(perDay, "FAQ gives the daily equivalent");
  assert.equal(Number(perDay[1]), allowance.PRO_MONTHLY_REWRITES / 30);
  const terms = readFileSync(join(root, "app/terms/page.tsx"), "utf8");
  assert.ok(terms.includes("Pro includes {PRO_MONTHLY_REWRITES} rewrites per calendar month (UTC)"), "Terms state the allowance from the constant");
  assert.match(terms, /import \{ PRO_MONTHLY_REWRITES \} from "@\/lib\/allowance"/);
});

test("marketing pages do not lead with the count's caveat", () => {
  const offenders = files.filter((path) => !path.includes(join("app", "terms")) && /long texts can count as more than one/i.test(readFileSync(path, "utf8")))
    .map((path) => relative(root, path));
  assert.deepEqual(offenders, []);
});
