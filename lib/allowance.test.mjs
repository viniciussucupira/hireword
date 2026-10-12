import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import vm from "node:vm";
import ts from "typescript";
import * as aiCost from "./ai-cost.ts";
import { protectCompanyNames } from "./rewrite-names.ts";
import { MAX_INPUT_CHARS, SUPPORT_EMAIL } from "./constants.ts";

const source = ts.transpileModule(readFileSync(new URL("./allowance.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const a = {};
vm.runInNewContext(source, { exports: a, require: (name) => { if (name !== "./ai-cost") throw Error(name); return aiCost; }, TextEncoder, Date, Math, Number });

test("the limits are the ones sold and costed", () => {
  assert.equal(a.PRO_DAILY_REWRITES, 10);
  assert.equal(MAX_INPUT_CHARS, 3500);
  assert.equal(a.PRO_MONTHLY_BUDGET_MICRO_USD, 6_000_000);
  assert.equal(a.PRO_OVERDRAFT_MICRO_USD, 250_000);
  assert.equal(a.MIN_HEADROOM_MICRO_USD, 10_000);
  assert.equal(a.FREE_DAILY_POOL_MICRO_USD, 1_000_000);
  assert.ok(a.PRO_DAY_TTL_SECONDS >= 86400 && a.PRO_DAY_TTL_SECONDS <= 3 * 86400);
});

test("a full month of the daily limit in English stays under the backstop", () => {
  // About 4.2 characters a token for English: a 4,000-character system prompt,
  // a full 3,500-character draft and an answer of the same length.
  const perRewrite = aiCost.estimateRewriteCost({ input_tokens: Math.ceil((4000 + MAX_INPUT_CHARS) / 4.2) + 64, output_tokens: Math.ceil(MAX_INPUT_CHARS / 4.2) }).costMicroUsd;
  assert.ok(perRewrite * a.PRO_DAILY_REWRITES * 31 < a.PRO_MONTHLY_BUDGET_MICRO_USD, `${perRewrite * 310} micro-USD`);
});

test("the worst case counts one token per UTF-8 byte at the input rate plus max_tokens at the output rate", () => {
  assert.equal(a.worstCaseMicroUsd("s".repeat(3000), "u".repeat(6000), 4096), (3000 + 6000 + 64) * 3 + 4096 * 15);
  assert.equal(a.worstCaseMicroUsd("", "", 0), 64 * 3);
  // A character outside ASCII is several bytes, and so possibly several tokens.
  assert.equal(a.worstCaseMicroUsd("", "é", 0), (2 + 64) * 3);
  assert.equal(a.worstCaseMicroUsd("", "😀", 0), (4 + 64) * 3);
  assert.equal(a.worstCaseMicroUsd("", "x"), (1 + 64) * 3 + a.MAX_OUTPUT_TOKENS * 15);
});

test("the worst case is never below what the provider can bill for the same request", () => {
  const system = "s".repeat(4000), user = "u".repeat(6000);
  const billedAtMost = aiCost.estimateRewriteCost({ input_tokens: 4000 + 6000 + 64, output_tokens: 4096 }).costMicroUsd;
  assert.ok(a.worstCaseMicroUsd(system, user, 4096) >= billedAtMost);
});

test("the largest request that can be sent fits inside the overdraft", () => {
  // Company-name protection lengthens a draft; this is the most it can.
  const draft = "A Ltd\n".repeat(Math.floor(MAX_INPUT_CHARS / 6));
  assert.ok(draft.length <= MAX_INPUT_CHARS);
  const sent = protectCompanyNames(draft, "f".repeat(24)).text;
  assert.ok(sent.length > 25000);
  assert.ok(a.worstCaseMicroUsd("s".repeat(5000), sent) < a.PRO_OVERDRAFT_MICRO_USD);
});

test("a cost meter is charged the real cost, rounded up to a whole micro-dollar", () => {
  assert.equal(a.chargeFor(7_812), 7_812);
  assert.equal(a.chargeFor(7_812.4), 7_813);
  assert.equal(a.chargeFor(-1), 0);
  assert.equal(a.chargeFor(NaN), 0);
  // Nothing billed: the whole reservation is released.
  assert.equal(a.chargeFor(null), 0);
});

test("the day admits ten rewrites and refuses the eleventh", () => {
  for (let n = 0; n < 10; n++) assert.equal(a.dayAdmits(n), true, `${n} started`);
  assert.equal(a.dayAdmits(10), false);
  assert.equal(a.dayAdmits(11), false);
  assert.equal(a.remainingToday(0), 10);
  assert.equal(a.remainingToday(8), 2);
  assert.equal(a.remainingToday(10), 0);
  assert.equal(a.remainingToday(12), 0);
  assert.equal(a.remainingToday(NaN), 10);
});

test("settling never takes the counter below zero", () => {
  assert.equal(a.settledTotal(88_632, 88_632, 10_000), 10_000);
  assert.equal(a.settledTotal(88_632, 88_632, 0), 0);
  assert.equal(a.settledTotal(10_000, 88_632, 0), 0);
  assert.equal(a.settledTotal(0, 50_000, 10_000), 0);
  assert.equal(a.settledTotal(100_000, 20_000, 30_000), 110_000);
});

test("the Pro backstop admits while $0.01 is left and never past the overdraft", () => {
  const pro = (amount) => a.meterLimits("pro", amount);
  assert.equal(a.admits(0, 88_632, pro(88_632)), true);
  assert.equal(a.admits(5_990_000, 88_632, pro(88_632)), true, "$0.01 left: admitted");
  assert.equal(a.admits(5_990_001, 88_632, pro(88_632)), false, "less than $0.01 left: refused");
  assert.equal(a.admits(6_000_000, 10_000, pro(10_000)), false);
  assert.equal(a.admits(5_990_000, 260_001, pro(260_001)), false, "never past budget + overdraft");
  assert.equal(a.admits(0, 0, pro(0)), false);
});

test("the free pool refuses a reservation that would exceed the day", () => {
  const free = (amount) => a.meterLimits("free", amount);
  assert.equal(a.admits(0, 88_632, free(88_632)), true);
  assert.equal(a.admits(911_368, 88_632, free(88_632)), true, "exactly fills the day");
  assert.equal(a.admits(911_369, 88_632, free(88_632)), false);
  assert.equal(a.admits(1_000_000, 1, free(1)), false);
});

test("the renewal date is the first of the next month in UTC", () => {
  assert.equal(a.renewalLabel(new Date("2026-10-12T15:00:00Z")), "November 1");
  assert.equal(a.renewalLabel(new Date("2026-10-31T23:59:59Z")), "November 1");
  assert.equal(a.renewalLabel(new Date("2026-11-01T00:00:00Z")), "December 1");
  assert.equal(a.renewalLabel(new Date("2026-12-31T12:00:00Z")), "January 1");
  assert.equal(a.renewalLabel(new Date("2027-01-31T12:00:00Z")), "February 1");
  // 31 Oct at 23:30 in New York is already 1 Nov in UTC.
  assert.equal(a.renewalLabel(new Date("2026-10-31T23:30:00-05:00")), "December 1");
  assert.equal(a.meterMonth(new Date("2026-10-31T23:30:00-05:00")), "2026-11");
  assert.equal(a.meterDay(new Date("2026-10-12T23:59:59Z")), "2026-10-12");
});

test("the daily refusal says when the rewrites reset", () => {
  assert.equal(a.resetHint(new Date("2026-10-12T15:00:00Z")), "in about 9 hours");
  assert.equal(a.resetHint(new Date("2026-10-12T00:00:00Z")), "in about 24 hours");
  assert.equal(a.resetHint(new Date("2026-10-12T22:40:00Z")), "in about 1 hour");
  assert.equal(a.resetHint(new Date("2026-10-12T23:01:00Z")), "in less than an hour");
  assert.equal(a.resetHint(new Date("2026-10-31T23:30:00-05:00")), "in about 20 hours");
  assert.equal(a.dailyLimitMessage(new Date("2026-10-12T15:00:00Z")),
    "You've used today's 10 Pro rewrites. They reset at 00:00 UTC (in about 9 hours). Your draft is still here.");
});

test("the monthly safeguard says when it resets and where to write", () => {
  const message = a.monthlySafeguardMessage(new Date("2026-10-12T15:00:00Z"));
  assert.equal(message, "This account has reached its monthly safeguard against automated use. It resets on November 1 at 00:00 UTC. If you think this is a mistake, write to support@hireword.com.");
  assert.ok(message.includes(SUPPORT_EMAIL));
});

// The Lua runs against a real Redis when one is installed; otherwise it is skipped.
function hasRedis() {
  try { execFileSync("redis-server", ["--version"], { stdio: "ignore" }); execFileSync("redis-cli", ["--version"], { stdio: "ignore" }); return true; } catch { return false; }
}
async function freePort() {
  return await new Promise((resolve) => { const s = createServer().listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)); }); });
}

test("the reserve and settle scripts do in Redis what the pure functions say", { skip: !hasRedis() && "redis-server not installed" }, async () => {
  const port = await freePort();
  const server = spawn("redis-server", ["--port", String(port), "--save", "", "--appendonly", "no"], { stdio: "ignore" });
  try {
    const cli = (...args) => execFileSync("redis-cli", ["-p", String(port), ...args.map(String)], { encoding: "utf8" }).trim();
    const ping = () => { try { return cli("PING"); } catch { return ""; } };
    for (let i = 0; i < 100 && ping() !== "PONG"; i++) await new Promise((r) => setTimeout(r, 50));
    const reserve = (key, kind, amount) => {
      const l = a.meterLimits(kind, amount);
      return cli("EVAL", a.RESERVE_METER_SCRIPT, 1, key, amount, l.budget, l.floorUnit, l.ceiling, 3600).split("\n").map(Number);
    };
    const settle = (key, delta) => Number(cli("EVAL", a.SETTLE_METER_SCRIPT, 1, key, delta, 3600));

    const pro = "na:allowance:pro:2026-10:test";
    assert.deepEqual(reserve(pro, "pro", 88_632), [1, 88_632]);
    assert.ok(Number(cli("TTL", pro)) > 3500, "TTL set on the first write");
    assert.equal(settle(pro, 10_000 - 88_632), 10_000);
    cli("SET", pro, 5_990_000, "KEEPTTL");
    assert.deepEqual(reserve(pro, "pro", 88_632), [1, 6_078_632], "$0.01 left: admitted past the line");
    assert.deepEqual(reserve(pro, "pro", 10_000), [0, 6_078_632], "then refused");
    assert.equal(settle(pro, 20_000 - 88_632), 6_010_000);

    // A counter can never be settled below zero, and keeps its expiry.
    const fresh = "na:allowance:pro:2026-10:other";
    assert.deepEqual(reserve(fresh, "pro", 50_000), [1, 50_000]);
    assert.equal(settle(fresh, -90_000), 0);
    assert.equal(cli("GET", fresh), "0");
    assert.ok(Number(cli("TTL", fresh)) > 3500);

    const pool = "na:allowance:free-pool:2026-10-12";
    cli("SET", pool, 950_000);
    assert.deepEqual(reserve(pool, "free", 88_632), [0, 950_000], "would exceed the day");
    assert.equal(cli("GET", pool), "950000", "a refusal adds nothing");
    assert.ok(Number(cli("TTL", pool)) < 0, "a refusal sets no TTL");
    assert.deepEqual(reserve(pool, "free", 50_000), [1, 1_000_000]);
    assert.ok(Number(cli("TTL", pool)) > 3500);

    // The Pro day: ten request ids, the eleventh refused, a refund frees exactly one place.
    const dayScript = (key, id) => cli("EVAL", a.RESERVE_DAY_SCRIPT, 1, key, id, a.PRO_DAILY_REWRITES, a.PRO_DAY_TTL_SECONDS).split("\n").map(Number);
    const today = "na:allowance:pro-day:2026-10-12:test", tomorrow = "na:allowance:pro-day:2026-10-13:test";
    for (let i = 1; i <= 10; i++) assert.deepEqual(dayScript(today, `r${i}`), [1, i]);
    assert.ok(Number(cli("TTL", today)) > 86400, "TTL set on the first rewrite");
    assert.deepEqual(dayScript(today, "r11"), [0, 10], "the eleventh is refused");
    assert.deepEqual(dayScript(today, "r5"), [1, 10], "a retried id is not counted twice");
    assert.equal(cli("EVAL", a.REFUND_DAY_SCRIPT, 1, today, "r3"), "1");
    assert.equal(cli("EVAL", a.REFUND_DAY_SCRIPT, 1, today, "r3"), "0", "a refund frees one place once");
    assert.equal(cli("EVAL", a.REFUND_DAY_SCRIPT, 1, today, "nobody"), "0");
    assert.deepEqual(dayScript(today, "r12"), [1, 10], "the freed place is usable");
    assert.deepEqual(dayScript(today, "r13"), [0, 10]);
    assert.deepEqual(dayScript(tomorrow, "r1"), [1, 1], "a new day key starts at zero");
  } finally {
    server.kill();
  }
});
