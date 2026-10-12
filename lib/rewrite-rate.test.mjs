import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";
import * as constants from "./constants.ts";
import { protectCompanyNames } from "./rewrite-names.ts";
import * as aiCost from "./ai-cost.ts";

const transpile = (path) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const allowance = {};
vm.runInNewContext(transpile("./allowance.ts"), { exports: allowance, require: () => aiCost, TextEncoder, Date, Math, Number });

const source = ts.transpileModule(readFileSync(new URL("../app/api/rewrite/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
class APIError extends Error { constructor(status) { super("provider"); this.status = status; } }
function fixture({ outage = false, meterOutage = false, pro = true, lifetime = false, pastDue = false, paddleSays = pastDue, meter = new Map(), model } = {}) {
  let email = "buyer@example.test", calls = 0, freeReservations = 0;
  const counts = new Map(), limits = [], exports = {}, settles = [], refunds = [];
  const usage = { input_tokens: 1200, output_tokens: 300 };
  class Anthropic {
    static APIError = APIError;
    messages = { create: async (request) => { calls++; if (model) return model(request); return { content: [{ type: "text", text: "Edited draft." }], usage, stop_reason: "end_turn" }; } };
  }
  const json = (body, init) => { const result = Response.json(body, init); result.cookies = { set() {} }; return result; };
  const modules = {
    "node:crypto": { randomBytes },
    "next/server": { NextResponse: { json } },
    "@anthropic-ai/sdk": { default: Anthropic },
    "@/lib/constants": constants,
    "@/lib/free-session": { FREE_COOKIE: "free", freeBrowserSession: () => ({ id: "fixture", fresh: false }) },
    "@/lib/pro-cookie": { sessionSecret: () => "fixture" },
    "@/lib/pro": { getProStatus: async () => ({ pro, email: pro ? email : null, ...(lifetime ? { lifetime } : {}) }) },
    "@/lib/paddle": { stillPastDue: async () => { if (paddleSays === "outage") throw Error("Paddle unavailable"); return Boolean(paddleSays); } },
    "@/lib/rewrite-review": { ENGLISH_VARIANTS: [{ value: "en-US", instruction: "American English" }] },
    "@/lib/ai-cost": { ...aiCost, REWRITE_MODEL: "fixture" },
    "@/lib/allowance": allowance,
    "@/lib/rewrite-names": { protectCompanyNames },
    "@/lib/redis": {
      allowRecoveryAttempt: async (scope, identity, limit, seconds) => {
        limits.push({ scope, identity, limit, seconds });
        if (outage) throw Error("Storage unavailable");
        const key = scope + identity, n = (counts.get(key) || 0) + 1; counts.set(key, n); return n <= limit;
      },
      incrementDailyUsage: async () => { freeReservations++; return freeReservations; },
      refundDailyUsage: async () => { refunds.push(1); return true; },
      paymentPastDue: async () => pastDue,
      recordRewriteCost: async () => {}, incrementTotalRewrites: async () => 1,
      // An in-memory meter making the same decisions as the Lua scripts.
      reserveMeter: async (kind, account, amount) => {
        if (meterOutage) throw Error("Storage unavailable");
        const key = kind === "pro" ? `pro:${account}` : "free-pool", used = meter.get(key) || 0;
        if (!allowance.admits(used, amount, allowance.meterLimits(kind, amount))) return { ok: false, used };
        meter.set(key, used + amount);
        return { ok: true, reservation: { kind, key, reserved: amount }, used: used + amount };
      },
      settleMeter: async (reservation, charged) => {
        settles.push({ ...reservation, charged });
        const total = allowance.settledTotal(meter.get(reservation.key) || 0, reservation.reserved, charged);
        meter.set(reservation.key, total);
        return total;
      },
    },
  };
  vm.runInNewContext(source, { exports, require: name => { if (!(name in modules)) throw Error(name); return modules[name]; }, process: { env: {} }, console, AbortSignal, Date });
  return {
    send: (ip = "203.0.113.1") => exports.POST({ cookies: { get() {} }, headers: new Headers({ "x-forwarded-for": ip }), json: async () => ({ text: "Draft.", context: "cover-letter", englishVariant: "en-US" }) }),
    account: value => { email = value; }, calls: () => calls, freeReservations: () => freeReservations, limits, meter, settles, refunds,
  };
}

test("Pro burst guard stops provider calls after 20 requests even across different IPs", async () => {
  const f = fixture();
  for (let i = 0; i < 20; i++) assert.equal((await f.send()).status, 200);
  const denied = await f.send("203.0.113.99");
  assert.equal(denied.status, 429);
  assert.equal(denied.headers.get("Retry-After"), "60");
  assert.match((await denied.json()).message, /not reached a daily limit/);
  assert.equal(f.calls(), 20);
  assert.equal(f.freeReservations(), 0);
  assert.ok(f.limits.every(item => item.seconds === 60 && item.scope === "pro-rewrite-burst"));
});

test("one Pro account's burst does not block another account on the same IP", async () => {
  const f = fixture();
  for (let i = 0; i < 21; i++) await f.send();
  f.account("another@example.test");
  assert.equal((await f.send()).status, 200);
  assert.equal(f.calls(), 21);
});

test("failed safeguard storage cannot create unbounded paid API calls", async () => {
  const f = fixture({ outage: true });
  const response = await f.send();
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /draft is still here/);
  assert.equal(f.calls(), 0);
});

const PRO_KEY = "pro:buyer@example.test";

test("a Pro rewrite is charged its real cost in whole credits and reports what is left", async () => {
  const f = fixture();
  const response = await f.send();
  assert.equal(response.status, 200);
  // 1,200 input and 300 output tokens cost $0.0081: one rewrite.
  assert.deepEqual((await response.json()).allowance, { remaining: 599, limit: 600 });
  assert.equal(f.meter.get(PRO_KEY), 10_000);
  assert.ok(f.settles[0].reserved >= 4096 * 15, "the reservation covered the whole of max_tokens");
});

test("a Pro account with no rewrite left is refused before any paid call", async () => {
  const f = fixture({ meter: new Map([[PRO_KEY, 5_990_001]]) });
  const response = await f.send();
  assert.equal(response.status, 429);
  const body = await response.json();
  assert.equal(body.error, "monthly_allowance_used");
  assert.match(body.message, /^You have used this month's Pro allowance of 600 rewrites\. It renews on [A-Z][a-z]+ 1 at 00:00 UTC\. Your draft is still here\.$/);
  assert.deepEqual(body.allowance, { remaining: 0, limit: 600 });
  assert.equal(f.calls(), 0);
  assert.equal(f.meter.get(PRO_KEY), 5_990_001);
});

test("the last Pro rewrite is admitted and the counter then reads zero", async () => {
  const f = fixture({ meter: new Map([[PRO_KEY, 5_990_000]]) });
  assert.equal((await f.send()).status, 200);
  assert.equal(f.meter.get(PRO_KEY), 6_000_000);
  assert.equal((await f.send()).status, 429);
  assert.equal(f.calls(), 1);
});

test("an unreachable meter refuses the rewrite instead of making an unmetered call", async () => {
  for (const pro of [true, false]) {
    const f = fixture({ meterOutage: true, pro });
    const response = await f.send();
    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /[Dd]raft is still here/);
    assert.equal(f.calls(), 0);
    assert.equal(f.freeReservations(), 0);
  }
});

test("a request the provider refused is released; a billed but unusable one is charged", async () => {
  const refused = fixture({ model: () => { throw new APIError(529); } });
  assert.equal((await refused.send()).status, 500);
  assert.equal(refused.meter.get(PRO_KEY), 0);

  const unusable = fixture({ model: () => ({ content: [{ type: "text", text: "Cut off" }], usage: { input_tokens: 1200, output_tokens: 4096 }, stop_reason: "max_tokens" }) });
  const response = await unusable.send();
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.match(body.message, /counted toward this month's allowance/);
  // 1,200 × 3 + 4,096 × 15 = 65,040 micro-USD: seven rewrites.
  assert.equal(unusable.meter.get(PRO_KEY), 70_000);
  assert.deepEqual(body.allowance, { remaining: 593, limit: 600 });
});

test("a call with an unknown outcome keeps its reservation on the meter", async () => {
  const f = fixture({ model: () => { throw new Error("socket hang up"); } });
  const response = await f.send();
  assert.equal(response.status, 500);
  assert.match((await response.json()).message, /may count toward this month's allowance/);
  assert.equal(f.settles.length, 0);
  assert.ok(f.meter.get(PRO_KEY) >= 4096 * 15);
});

test("a spent free pool pauses free rewrites without using the visitor's own", async () => {
  const f = fixture({ pro: false, meter: new Map([["free-pool", 950_000]]) });
  const response = await f.send();
  assert.equal(response.status, 429);
  const body = await response.json();
  assert.equal(body.error, "free_pool_used");
  assert.equal(body.message, "Free rewrites are paused for today because today's shared free allowance is used. They resume at 00:00 UTC; Pro is not affected.");
  assert.equal(f.freeReservations(), 0);
  assert.equal(f.calls(), 0);
  assert.equal(f.meter.get("free-pool"), 950_000);
});

test("a free rewrite settles the pool at its real cost, and a refused one gives the pool back", async () => {
  const f = fixture({ pro: false });
  const first = await f.send();
  assert.equal(first.status, 200);
  assert.equal((await first.json()).allowance, undefined);
  assert.equal(f.meter.get("free-pool"), 1200 * 3 + 300 * 15);
  // The browser's own rewrite is spent: refused, and the pool is untouched by it.
  const second = await f.send();
  assert.equal(second.status, 429);
  assert.equal((await second.json()).error, "limit_reached");
  assert.equal(f.meter.get("free-pool"), 1200 * 3 + 300 * 15);
  assert.equal(f.calls(), 1);
});

test("a free rewrite the provider refused restores both the visitor's rewrite and the pool", async () => {
  const f = fixture({ pro: false, model: () => { throw new APIError(500); } });
  const response = await f.send();
  assert.equal(response.status, 500);
  assert.match((await response.json()).message, /did not use your free rewrite/);
  assert.equal(f.refunds.length, 1);
  assert.equal(f.meter.get("free-pool"), 0);
});

test("a Lifetime purchase is exempt from the monthly allowance but not from the burst limit", async () => {
  const f = fixture({ lifetime: true, meter: new Map([[PRO_KEY, 6_250_000]]) });
  const response = await f.send();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).allowance, undefined);
  assert.equal(f.meter.get(PRO_KEY), 6_250_000, "the meter is not touched");
  assert.equal(f.settles.length, 0);
  for (let i = 0; i < 19; i++) assert.equal((await f.send()).status, 200);
  assert.equal((await f.send()).status, 429);
  assert.equal(f.calls(), 20);
});

test("a past-due subscription pauses paid rewrites after the free daily one", async () => {
  const f = fixture({ pastDue: true });
  // An ordinary visitor's free rewrite, drawn from the free pool, not the Pro meter.
  assert.equal((await f.send()).status, 200);
  assert.equal(f.meter.get(PRO_KEY), undefined);
  assert.ok(f.meter.get("free-pool") > 0);
  const refused = await f.send();
  assert.equal(refused.status, 402);
  const body = await refused.json();
  assert.equal(body.error, "payment_past_due");
  assert.equal(body.message, "Your last Pro payment didn't go through, so Pro rewrites are paused. Update your payment method from the link in your Paddle email; rewriting resumes as soon as the payment succeeds. Your draft is still here.");
  assert.equal(f.calls(), 1);
});

test("a past-due mark that Paddle no longer confirms does not pause a paying customer", async () => {
  const f = fixture({ pastDue: true, paddleSays: false });
  const response = await f.send();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).allowance, { remaining: 599, limit: 600 });
  assert.equal(f.freeReservations(), 0);
});

test("if Paddle cannot answer, the past-due mark stands", async () => {
  const f = fixture({ pastDue: true, paddleSays: "outage", meter: new Map([["free-pool", 1_000_000]]) });
  const response = await f.send();
  assert.equal(response.status, 402);
  assert.equal((await response.json()).error, "payment_past_due");
  assert.equal(f.calls(), 0);
});

test("Lifetime is never paused as past due", async () => {
  const f = fixture({ lifetime: true, pastDue: true });
  assert.equal((await f.send()).status, 200);
  assert.equal(f.freeReservations(), 0);
});
