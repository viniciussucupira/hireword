import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as billing from "./billing.ts";

const source = ts.transpileModule(readFileSync(new URL("./refunds.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const api = {}; vm.runInNewContext(source, { exports: api, require: () => billing, Date, BigInt });
const now = Date.parse("2026-09-24T12:00:00Z"), email = "buyer@example.test", price = "pri_native";
const txid = `txn_${"a".repeat(26)}`, cid = `ctm_${"b".repeat(26)}`, sid = `sub_${"c".repeat(26)}`;
const purchase = { id: txid, customer_id: cid, subscription_id: sid, status: "completed", currency_code: "USD", items: [{ price: { id: price } }], payments: [{ status: "captured", captured_at: "2026-09-23T12:00:00Z" }], details: { totals: { total: "1900" } } };

function fixture({ transactions = [purchase], customerEmail = email, adjustments = [], failCancel = false, failRefund = false, lostResponse = false, storageDown = false } = {}) {
  const intents = new Set(), posts = [];
  let canceled = false;
  const store = { read: async id => intents.has(id), claim: async id => { if (storageDown) throw Error("Storage down"); if (intents.has(id)) return false; intents.add(id); return true; } };
  const request = async (path, body) => {
    if (body) {
      posts.push({ path, body });
      if (path.endsWith("/cancel")) { if (failCancel) throw Error("Cancel failed"); canceled = true; }
      if (path === "/adjustments") {
        if (failRefund) throw Error("Uncertain provider result");
        const adjustment = { id: "adj_fixture", transaction_id: txid, action: "refund", type: "full", status: "pending_approval" };
        adjustments.push(adjustment);
        if (lostResponse) throw Error("Lost response");
        return { data: adjustment };
      }
    }
    if (path.startsWith("/customers?")) return { data: [{ id: cid, email: customerEmail }] };
    if (path.startsWith("/customers/")) return { data: { id: cid, email: customerEmail } };
    if (path.startsWith("/transactions?")) return { data: transactions };
    if (path.startsWith("/transactions/")) return { data: transactions.find(tx => path.endsWith(tx.id)) };
    if (path.startsWith("/adjustments?")) return { data: adjustments };
    return { data: { id: sid, customer_id: cid, status: "active", items: [{ price: { id: price } }], scheduled_change: canceled ? { action: "cancel", effective_at: "2026-10-23T12:00:00Z" } : null } };
  };
  return { request, store, posts, adjustments, canceled: () => canceled, read: () => api.getRefundView(email, price, store, request, now), submit: (id = txid) => api.requestFirstPaymentRefund(email, id, price, store, request, now) };
}

test("eligible verified first payment refunds only its full transaction after stopping renewal", async () => {
  const f = fixture(); assert.equal((await f.read()).state, "eligible");
  assert.equal((await f.submit()).state, "pending_approval"); assert.equal(f.canceled(), true);
  assert.deepEqual(f.posts.map(p => p.path), [`/subscriptions/${sid}/cancel`, "/adjustments"]);
  const body = f.posts[1].body;
  assert.equal(body.transaction_id, txid); assert.equal(body.action, "refund"); assert.equal(body.type, "full");
  await f.submit(); assert.equal(f.posts.filter(p => p.path === "/adjustments").length, 1);
});
test("simultaneous refund submissions produce at most one money-moving request", async () => {
  const f = fixture(); await Promise.all([f.submit(), f.submit()]);
  assert.equal(f.posts.filter(p => p.path === "/adjustments").length, 1);
});
test("lost provider response is reconciled without a second refund", async () => {
  const f = fixture({ lostResponse: true }); assert.equal((await f.submit()).state, "pending_approval");
  await f.submit(); assert.equal(f.posts.filter(p => p.path === "/adjustments").length, 1);
});
test("ambiguous failures stay unconfirmed and cannot be blindly resubmitted", async () => {
  const f = fixture({ failRefund: true }); assert.equal((await f.submit()).state, "unconfirmed");
  assert.equal((await f.submit()).state, "unconfirmed");
  assert.equal(f.posts.filter(p => p.path === "/adjustments").length, 1);
});
test("cancel and durable-storage failures prevent the refund POST", async () => {
  for (const options of [{ failCancel: true }, { storageDown: true }]) {
    const f = fixture(options); await assert.rejects(f.submit());
    assert.equal(f.posts.filter(p => p.path === "/adjustments").length, 0);
  }
});
test("other emails, products, mixed purchases and invented transaction IDs cannot move money", async () => {
  for (const options of [{ customerEmail: "other@example.test" }, { transactions: [{ ...purchase, items: [{ price_id: "retone" }] }] }, { transactions: [{ ...purchase, items: [...purchase.items, { price_id: "retone" }] }] }]) {
    const f = fixture(options); await assert.rejects(f.submit()); assert.equal(f.posts.length, 0);
  }
  const f = fixture(); await assert.rejects(f.submit(`txn_${"z".repeat(26)}`)); assert.equal(f.posts.length, 0);
});
test("a recent renewal cannot replace an older first payment or restart its guarantee", async () => {
  const first = { ...purchase, id: `txn_${"0".repeat(26)}`, payments: [{ status: "captured", captured_at: "2026-08-01T12:00:00Z" }] };
  const f = fixture({ transactions: [purchase, first] });
  assert.equal((await f.read()).state, "outside_window");
  await assert.rejects(f.submit()); assert.equal(f.posts.length, 0);
});
test("14-day boundary uses captured payment time, not creation or billing date", async () => {
  const f = fixture({ transactions: [{ ...purchase, created_at: "2026-01-01T00:00:00Z", payments: [{ status: "captured", captured_at: "2026-09-10T12:00:00Z" }] }] });
  assert.equal((await f.read()).state, "eligible");
  assert.equal((await api.getRefundView(email, price, f.store, f.request, now + 1)).state, "outside_window");
});
test("approved, partial, rejected or chargeback adjustments cannot cause another full refund", async () => {
  for (const [action, status, type, state] of [["refund", "approved", "full", "approved"], ["refund", "approved", "partial", "review"], ["refund", "rejected", "full", "review"], ["chargeback", "approved", "full", "review"]]) {
    const f = fixture({ adjustments: [{ id: "adj_fixture", transaction_id: txid, action, status, type }] });
    assert.equal((await f.read()).state, state);
    if (state === "approved") await f.submit(); else await assert.rejects(f.submit());
    assert.equal(f.posts.length, 0);
  }
});
test("missing payment evidence fails closed instead of guessing eligibility", async () => {
  const f = fixture({ transactions: [{ ...purchase, payments: [] }] });
  await assert.rejects(f.read()); await assert.rejects(f.submit()); assert.equal(f.posts.length, 0);
});
