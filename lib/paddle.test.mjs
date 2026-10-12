import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as validation from "./purchase-validation.ts";

const customer = `ctm_${"b".repeat(26)}`, subscription = `sub_${"a".repeat(26)}`, transaction = `txn_${"c".repeat(26)}`;
const email = "buyer@example.test";
const purchase = { id: transaction, customer_id: customer, subscription_id: subscription, status: "completed", items: [{ price: { id: "native-monthly" } }], billing_period: { ends_at: new Date(Date.now() + 86400000).toISOString() } };
const plan = { id: subscription, customer_id: customer, status: "active", items: purchase.items };
const source = ts.transpileModule(readFileSync(new URL("./paddle.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function fixture({ tx = purchase, sub = plan, remembered = subscription, outage = false, blocked = false, history } = {}) {
  const grants = [], revocations = [], caps = [], requests = [], cleared = [], pastDue = [];
  const store = {
    getSubscriptionId: async () => remembered, clearSubscriptionId: async () => {},
    grantMonthlyPro: async (...args) => { grants.push(args); return !blocked; },
    grantLifetimePro: async (...args) => { grants.push(args); return !blocked; },
    revokeProForTransaction: async (...args) => revocations.push(args),
    revokeMonthlyForSubscription: async (...args) => revocations.push(args),
    capMonthlyForSubscription: async (...args) => caps.push(args),
    clearReversedRefund: async (...args) => cleared.push(args),
    setPaymentPastDue: async (...args) => pastDue.push(args),
  };
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => name === "./redis" ? store : validation, process: { env: { PADDLE_API_KEY: "fixture", NEXT_PUBLIC_PADDLE_PRICE_ID: "native-monthly", NEXT_PUBLIC_PADDLE_LIFETIME_PRICE_ID: "native-lifetime" } }, AbortSignal, Date,
    fetch: async url => {
      const path = new URL(url).pathname; requests.push(url);
      if (outage) return { ok: false, status: 503 };
      let data;
      if (path === "/customers") data = [{ id: customer, email }];
      else if (path.startsWith("/customers/")) data = { id: customer, email };
      else if (path.startsWith("/subscriptions/")) data = sub;
      else if (path === "/transactions") data = history ? (new URL(url).searchParams.has("after") ? history.slice(30) : history.slice(0, 30)) : tx ? [tx] : [];
      else data = tx;
      return { ok: true, json: async () => ({ data }) };
    },
  });
  return { api: exports, grants, revocations, caps, requests, cleared, pastDue };
}
test("monthly activation reads provider email and grants only the paid period", async () => {
  const f = fixture();
  const tx = await f.api.fetchTransaction(transaction);
  assert.equal(await f.api.grantProForTransaction(tx), email);
  assert.deepEqual(f.grants[0], [email, transaction, Math.floor(Date.parse(purchase.billing_period.ends_at) / 1000), subscription]);
  assert.ok(f.requests[0].endsWith("?include=adjustments"));
});
test("renewal recovery finds its paid receipt beyond the first page", async () => {
  const old = Array.from({ length: 30 }, (_, i) => ({ ...purchase, id: `txn_${String(i).padStart(26, "0")}`, items: [{ price: { id: "other-price" } }] }));
  const f = fixture({ history: [...old, purchase] });
  assert.equal(await f.api.refreshMonthlyPro(email), true);
  assert.ok(f.requests.some(url => url.includes("&after=")));
});
test("a temporarily missing subscription is a retryable lookup error, not an inactive purchase", async () => {
  const f = fixture({ sub: null });
  await assert.rejects(f.api.grantProForTransaction(purchase), /lookup unavailable/);
  assert.equal(f.grants.length, 0);
});
test("an invalid, unpaid, refunded or other-product purchase never activates Pro", async () => {
  for (const tx of [{ ...purchase, status: "billed" }, { ...purchase, adjustments: [{ action: "refund", type: "full", status: "approved" }] }, { ...purchase, items: [{ price: { id: "retone" } }] }]) {
    const f = fixture({ tx });
    assert.equal(await f.api.grantProForTransaction(tx), null);
    assert.equal(f.grants.length, 0);
  }
  const f = fixture();
  assert.equal(await f.api.fetchTransaction("txn_bad"), null);
  assert.equal(f.requests.length, 0);
});
test("provider outages propagate rather than converting a subscriber into free access", async () => {
  const f = fixture({ outage: true });
  await assert.rejects(f.api.refreshMonthlyPro(email), /unavailable/);
  assert.equal(f.grants.length, 0);
});
test("email recovery finds a paid purchase without initial activation or a saved subscription", async () => {
  const f = fixture({ remembered: null });
  assert.equal(await f.api.restoreProByEmail(email), true);
  assert.equal(f.grants.length, 1);
});
test("email recovery rejects expired and refunded receipts", async () => {
  for (const tx of [{ ...purchase, billing_period: { ends_at: "2020-01-01T00:00:00Z" } }, { ...purchase, adjustments: [{ action: "refund", type: "full", status: "approved" }] }]) {
    const f = fixture({ remembered: null, tx });
    assert.equal(await f.api.restoreProByEmail(email), false);
    assert.equal(f.grants.length, 0);
  }
});
test("a concurrent refund tombstone prevents confirmation from reporting successful activation", async () => {
  const f = fixture({ blocked: true });
  assert.equal(await f.api.grantProForTransaction(purchase), null);
});
test("refund reconciliation revokes its receipt and supports a provider-confirmed dispute reversal", async () => {
  const f = fixture({ tx: { ...purchase, adjustments: [{ action: "refund", type: "full", status: "approved" }] } });
  await f.api.revokeProForRefund(transaction);
  assert.deepEqual(f.revocations[0], [email, transaction, subscription]);
  const reversed = fixture({ tx: { ...purchase, adjustments: [{ action: "chargeback", status: "reversed" }] } });
  await reversed.api.revokeProForRefund(transaction);
  assert.deepEqual(reversed.cleared[0], [transaction]);
  assert.equal(reversed.grants.length, 1);
});
test("cancellation notifications reconcile fresh provider state and preserve the paid end date", async () => {
  const f = fixture({ sub: { ...plan, scheduled_change: { action: "cancel", effective_at: purchase.billing_period.ends_at } } });
  await f.api.reconcileSubscription(subscription);
  assert.equal(f.revocations.length, 0);
  assert.deepEqual(f.caps[0], [email, subscription, Math.floor(Date.parse(purchase.billing_period.ends_at) / 1000)]);
  const canceled = fixture({ sub: { ...plan, status: "canceled" } });
  await canceled.api.reconcileSubscription(subscription);
  assert.deepEqual(canceled.revocations[0], [email, subscription]);
});

test("the past-due mark follows Paddle's subscription status", async () => {
  const late = fixture({ sub: { ...plan, status: "past_due" } });
  await late.api.reconcileSubscription(subscription);
  assert.deepEqual(late.pastDue.at(-1), [email, true]);
  assert.equal(await late.api.stillPastDue(email), true);

  const recovered = fixture({ sub: { ...plan, status: "active" } });
  await recovered.api.reconcileSubscription(subscription);
  assert.deepEqual(recovered.pastDue.at(-1), [email, false]);
  assert.equal(await recovered.api.stillPastDue(email), false);
  assert.deepEqual(recovered.pastDue.at(-1), [email, false]);

  const refreshed = fixture({ sub: { ...plan, status: "past_due" } });
  await refreshed.api.refreshMonthlyPro(email);
  assert.deepEqual(refreshed.pastDue[0], [email, true]);

  await assert.rejects(fixture({ outage: true }).api.stillPastDue(email), /unavailable/);
});
