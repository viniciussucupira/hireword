import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../app/api/billing/refund/route.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function fixture(state, { session = true, reconciliationFails = false, signedOut = false } = {}) {
  const repaired = [], reads = [], transactionId = `txn_${"a".repeat(26)}`;
  const refund = { state, transactionId };
  const modules = {
    "next/server": { NextResponse: { json: (body, init) => ({ body, ...init }) } },
    "@/lib/billing": { BILLING_COOKIE: "billing", readBillingSessionDetails: () => session ? { email: "buyer@example.test", issuedAt: 1 } : null },
    "@/lib/pro": { sessionIsLive: async () => !signedOut },
    "@/lib/refunds": { getRefundView: async email => { reads.push(email); return refund; }, requestFirstPaymentRefund: async () => refund },
    "@/lib/redis": { refundIntentStore: {}, allowRecoveryAttempt: async () => true },
    "@/lib/pro-cookie": { sessionSecret: () => "fixture" },
    "@/lib/recovery": { RECOVERY_ORIGIN: "https://hireword.com" },
    "@/lib/paddle": { revokeProForRefund: async id => { repaired.push(id); if (reconciliationFails) throw Error(); } },
  };
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => modules[name], process: { env: { NEXT_PUBLIC_PADDLE_PRICE_ID: "fixture" } }, console: { error: () => {} } });
  const req = { cookies: { get: () => ({ value: "fixture" }) } };
  return { get: () => exports.GET(req), repaired, reads, transactionId };
}
test("refreshing an approved refund repairs access when its webhook was missed", async () => {
  const f = fixture("approved"); const response = await f.get();
  assert.equal(response.status, 200);
  assert.deepEqual(f.repaired, [f.transactionId]);
  assert.equal(response.headers["Cache-Control"], "private, no-store");
});
test("pending and eligible refunds do not revoke paid access", async () => {
  for (const state of ["eligible", "pending_approval", "unconfirmed", "review"]) {
    const f = fixture(state); await f.get(); assert.equal(f.repaired.length, 0);
  }
});
test("expired billing proof cannot query or reconcile a refund", async () => {
  const f = fixture("approved", { session: false });
  assert.equal((await f.get()).status, 401);
  assert.equal(f.reads.length, 0); assert.equal(f.repaired.length, 0);
});
test("a cache outage does not misreport an approved refund as unpaid", async () => {
  const f = fixture("approved", { reconciliationFails: true });
  assert.equal((await f.get()).body.refund.state, "approved");
});
test("billing proof ended by signing out on all devices is refused", async () => {
  const f = fixture("approved", { signedOut: true });
  assert.equal((await f.get()).status, 401);
  assert.equal(f.reads.length, 0); assert.equal(f.repaired.length, 0);
});
