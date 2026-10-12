import { paddleBillingRequest, cancelBillingSubscription, type BillingTransport } from "./billing";

const transactionPattern = /^txn_[a-z0-9]{26}$/;
const customerPattern = /^ctm_[a-z0-9]{26}$/;
const subscriptionPattern = /^sub_[a-z0-9]{26}$/;
const GUARANTEE_MS = 14 * 86400000;
type Transaction = {
  id: string; customer_id: string; subscription_id?: string; status: string; currency_code: string;
  items?: { price?: { id?: string }; price_id?: string }[];
  payments?: { status: string; captured_at?: string | null }[];
  details?: { totals?: { total?: string } };
};
type Adjustment = { id: string; transaction_id: string; action: string; status: string; type: string };
export type RefundView = {
  transactionId: string | null; amount: string | null; currency: string | null; paidAt: string | null;
  deadline: string | null; state: "eligible" | "none" | "outside_window" | "review" | "pending_approval" | "approved" | "unconfirmed";
};
export type RefundIntentStore = { read(id: string): Promise<boolean>; claim(id: string, requestedAt: string): Promise<boolean> };

async function pages<T extends { id: string }>(path: string, request: BillingTransport): Promise<T[]> {
  const result: T[] = []; let after = "";
  for (let page = 0; page < 10; page++) {
    const response = await request<T[]>(`${path}&per_page=30${after ? `&after=${encodeURIComponent(after)}` : ""}`);
    if (!Array.isArray(response.data)) throw new Error("Refund lookup unavailable");
    result.push(...response.data);
    if (!response.meta?.pagination?.has_more && response.data.length < 30) return result;
    const next = response.data.at(-1)?.id;
    if (!next || next === after) throw new Error("Refund lookup incomplete");
    after = next;
  }
  throw new Error("Refund lookup incomplete");
}
function paidAt(tx: Transaction): number {
  const dates = (tx.payments || []).filter(p => p.status === "captured").map(p => Date.parse(p.captured_at || ""));
  return dates.length && dates.every(Number.isFinite) ? Math.max(...dates) : NaN;
}
function containsNative(tx: Transaction, price: string) { return tx.items?.some(i => (i.price?.id || i.price_id) === price); }
function nativeOnly(tx: Transaction, price: string) { return Boolean(tx.items?.length && tx.items.every(i => (i.price?.id || i.price_id) === price)); }

/**
 * Find the FIRST paid Hireword purchase across all Paddle customers for the verified email.
 * Only that payment carries the 14-day guarantee (12 Oct 2026): a renewal does not, because
 * refunding every renewal would let anybody use Pro every month for nothing. The earliest
 * purchase stays the earliest after a refund, so subscribing again does not restart it.
 */
async function firstPurchase(email: string, price: string, request: BillingTransport): Promise<Transaction | null> {
  if (!price) throw new Error("Refund product unavailable");
  const customers = await pages<{ id: string; email: string }>(`/customers?email=${encodeURIComponent(email)}&status=active,archived`, request);
  const purchases: Transaction[] = [];
  for (const customer of customers) {
    if (!customerPattern.test(customer.id) || customer.email.trim().toLowerCase() !== email.trim().toLowerCase()) continue;
    const transactions = await pages<Transaction>(`/transactions?customer_id=${customer.id}&status=completed&order_by=id[ASC]`, request);
    for (const tx of transactions) if (tx.customer_id === customer.id && tx.status === "completed" && containsNative(tx, price)) {
      // Missing payment evidence must never turn a renewal into a first purchase.
      if (!transactionPattern.test(tx.id) || !Number.isFinite(paidAt(tx))) throw new Error("Refund payment date unavailable");
      purchases.push(tx);
    }
  }
  return purchases.sort((a, b) => paidAt(a) - paidAt(b) || a.id.localeCompare(b.id))[0] || null;
}

async function inspect(email: string, price: string, store: RefundIntentStore, request: BillingTransport, now: number) {
  const first = await firstPurchase(email, price, request);
  const empty: RefundView = { transactionId: null, amount: null, currency: null, paidAt: null, deadline: null, state: "none" };
  if (!first) return { view: empty, transaction: null };
  const { data: tx } = await request<Transaction>(`/transactions/${first.id}`);
  if (!tx || tx.id !== first.id || tx.customer_id !== first.customer_id || tx.status !== "completed" || !containsNative(tx, price)) throw new Error("Refund purchase changed");
  const date = paidAt(tx), total = tx.details?.totals?.total;
  if (!Number.isFinite(date) || !total || !/^\d+$/.test(total)) throw new Error("Refund payment unavailable");
  const view: RefundView = { transactionId: tx.id, amount: total, currency: tx.currency_code, paidAt: new Date(date).toISOString(), deadline: new Date(date + GUARANTEE_MS).toISOString(), state: "eligible" };
  const adjustments = await pages<Adjustment>(`/adjustments?transaction_id=${tx.id}`, request);
  const own = adjustments.filter(a => a.transaction_id === tx.id);
  if (own.some(a => a.action === "refund" && a.status === "approved" && a.type === "full")) view.state = "approved";
  else if (own.some(a => a.action === "refund" && a.status === "pending_approval")) view.state = "pending_approval";
  else if (own.length || !nativeOnly(tx, price) || !subscriptionPattern.test(tx.subscription_id || "") || BigInt(total) === BigInt(0)) view.state = "review";
  else if (await store.read(tx.id)) view.state = "unconfirmed";
  else if (now < date || now > date + GUARANTEE_MS) view.state = "outside_window";
  return { view, transaction: tx };
}

export async function getRefundView(email: string, price: string, store: RefundIntentStore, request = paddleBillingRequest, now = Date.now()) {
  return (await inspect(email, price, store, request, now)).view;
}

export async function requestFirstPaymentRefund(email: string, transactionId: string, price: string, store: RefundIntentStore, request = paddleBillingRequest, now = Date.now()): Promise<RefundView> {
  if (!transactionPattern.test(transactionId)) throw new Error("Invalid refund reference");
  const { view, transaction: tx } = await inspect(email, price, store, request, now);
  if (!tx || tx.id !== transactionId) throw new Error("Refund purchase unavailable");
  if (["pending_approval", "approved", "unconfirmed"].includes(view.state)) return view;
  if (view.state !== "eligible") throw new Error("Refund requires Paddle review");
  // The customer explicitly confirms both actions. Never silently leave renewal on.
  await cancelBillingSubscription(email, tx.subscription_id!, price, request);
  // Permanent, atomic intent: at most one money-moving POST, including lost responses.
  // Ambiguous attempts go to Paddle buyer support, never an automatic second refund.
  if (!await store.claim(tx.id, new Date(now).toISOString())) return { ...view, state: "unconfirmed" };
  try {
    const { data: adjustment } = await request<Adjustment>("/adjustments", {
      action: "refund", type: "full", transaction_id: tx.id,
      reason: "Hireword first-payment 14-day guarantee requested by verified customer",
    });
    if (adjustment?.transaction_id !== tx.id || adjustment.action !== "refund" || adjustment.type !== "full" || !["pending_approval", "approved"].includes(adjustment.status)) throw new Error("Refund not confirmed");
    return { ...view, state: adjustment.status as "pending_approval" | "approved" };
  } catch {
    // Read provider truth after a timeout; do not repeat the financial operation.
    try { return await getRefundView(email, price, store, request, now); }
    catch { return { ...view, state: "unconfirmed" }; }
  }
}
