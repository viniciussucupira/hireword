import {
  clearSubscriptionId,
  getSubscriptionId,
  grantLifetimePro,
  grantMonthlyPro,
  revokeProForTransaction,
  revokeMonthlyForSubscription,
  clearReversedRefund,
  capMonthlyForSubscription,
  setPaymentPastDue,
} from "./redis";
import { purchasePlan, purchaseRefunded, paidMonthlyExpiry, type Purchase, type PurchaseSubscription } from "./purchase-validation";

// The Paddle account is shared by several products (Fluentsmith,
// Hireword, ...). Paddle sends every product's events to every webhook
// destination, so a transaction only unlocks Hireword Pro when it contains
// one of Hireword's own prices.
const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? "";
const LIFETIME_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_LIFETIME_PRICE_ID ?? "";

export type PaddleTransaction = Purchase;

export type Plan = "monthly" | "lifetime";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
}

async function paddleGet<T>(path: string): Promise<T | null> {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error("Payment verification unavailable");
  }
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Payment provider unavailable (${res.status})`);
  }
  const json = await res.json();
  return (json?.data ?? null) as T | null;
}

export function fetchTransaction(transactionId: string): Promise<PaddleTransaction | null> {
  if (!/^txn_[a-z0-9]{26}$/.test(transactionId)) return Promise.resolve(null);
  return paddleGet<PaddleTransaction>(`/transactions/${transactionId}?include=adjustments`);
}

export async function fetchCustomerEmail(customerId: string): Promise<string | null> {
  if (!/^ctm_[a-z0-9]{26}$/.test(customerId)) return null;
  const customer = await paddleGet<{ email?: string }>(`/customers/${customerId}`);
  return customer?.email?.trim().toLowerCase() ?? null;
}

/** Which Hireword plan this transaction bought, or null if it's another product. */
export function planForTransaction(tx: PaddleTransaction): Plan | null {
  return purchasePlan(tx, MONTHLY_PRICE_ID, LIFETIME_PRICE_ID);
}

async function monthlyExpiry(tx: PaddleTransaction): Promise<number | null> {
  if (!tx.subscription_id || !/^sub_[a-z0-9]{26}$/.test(tx.subscription_id)) return null;
  const sub = await paddleGet<PurchaseSubscription>(`/subscriptions/${tx.subscription_id}`);
  if (!sub) throw new Error("Subscription lookup unavailable");
  return paidMonthlyExpiry(tx, sub, MONTHLY_PRICE_ID);
}

/** Bounded pagination: never report "no purchase" from a truncated history. */
async function* completedTransactions(filter: string) {
  let after = "";
  for (let page = 0; page < 10; page++) {
    const batch = await paddleGet<PaddleTransaction[]>(`/transactions?${filter}&status=completed&order_by=id[DESC]&per_page=30${after ? `&after=${after}` : ""}`);
    if (!Array.isArray(batch)) throw new Error("Purchase lookup unavailable");
    for (const tx of batch) yield tx;
    if (batch.length < 30) return;
    const cursor = batch.at(-1)?.id;
    if (!cursor || !/^txn_[a-z0-9]{26}$/.test(cursor) || cursor === after) throw new Error("Purchase lookup incomplete");
    after = cursor;
  }
  throw new Error("Purchase lookup incomplete");
}

function mayHaveAccess(tx: PaddleTransaction) {
  const plan = planForTransaction(tx);
  return plan === "lifetime" || (plan === "monthly" && Date.parse(tx.billing_period?.ends_at || "") + 3 * 86400000 > Date.now());
}

/**
 * For a monthly customer whose access key ran out: asks Paddle whether the
 * subscription is still active and, if so, extends access to the end of the
 * current paid period. Returns true when Pro was restored.
 */
export async function refreshMonthlyPro(email: string): Promise<boolean> {
  const subscriptionId = await getSubscriptionId(email);
  if (!subscriptionId) return false;
  const sub = await paddleGet<PurchaseSubscription>(`/subscriptions/${subscriptionId}`);
  if (!sub) throw new Error("Subscription lookup unavailable");
  if (!["active", "past_due", "trialing"].includes(sub.status || "")) {
    await clearSubscriptionId(email);
    await setPaymentPastDue(email, false);
    return false;
  }
  await setPaymentPastDue(email, sub.status === "past_due");
  for await (const candidate of completedTransactions(`subscription_id=${subscriptionId}`)) {
    if (!mayHaveAccess(candidate)) continue;
    const tx = await fetchTransaction(candidate.id);
    if (!tx || tx.subscription_id !== subscriptionId || !planForTransaction(tx) || purchaseRefunded(tx)) continue;
    if (await fetchCustomerEmail(tx.customer_id || "") !== email) continue;
    if (await grantProForTransaction(tx) === email) return true;
  }
  return false;
}

/**
 * Grants Pro for a completed Hireword transaction and returns the buyer's
 * email, or null when the transaction isn't a completed Hireword purchase.
 */
export async function grantProForTransaction(tx: PaddleTransaction): Promise<string | null> {
  if (tx.status !== "completed" && tx.status !== "paid") return null;
  const plan = planForTransaction(tx);
  if (!plan || !tx.customer_id) return null;
  if (purchaseRefunded(tx)) return null;

  const email = await fetchCustomerEmail(tx.customer_id);
  if (!email) return null;

  if (plan === "lifetime") {
    if (!await grantLifetimePro(email, tx.id)) return null;
  } else {
    const expiresAt = await monthlyExpiry(tx);
    // An old renewal must not grant access that has already run out.
    if (!expiresAt || expiresAt <= Math.floor(Date.now() / 1000)) return null;
    if (!await grantMonthlyPro(email, tx.id, expiresAt, tx.subscription_id || "")) return null;
  }
  return email;
}

/** Removes Pro that was granted by a transaction that was fully refunded or charged back. */
export async function revokeProForRefund(transactionId: string): Promise<void> {
  const tx = await fetchTransaction(transactionId);
  if (!tx) throw new Error("Transaction lookup unavailable");
  if (!planForTransaction(tx) || !tx.customer_id) return;
  const email = await fetchCustomerEmail(tx.customer_id);
  if (!email) throw new Error("Customer lookup unavailable");
  if (purchaseRefunded(tx)) await revokeProForTransaction(email, tx.id, tx.subscription_id || "");
  else if (tx.adjustments?.some(a => a.action === "chargeback" && a.status === "reversed")) {
    await clearReversedRefund(tx.id);
    await grantProForTransaction(tx);
  }
}

export async function reconcileSubscription(subscriptionId: string): Promise<void> {
  if (!/^sub_[a-z0-9]{26}$/.test(subscriptionId)) return;
  const sub = await paddleGet<PurchaseSubscription>(`/subscriptions/${subscriptionId}`);
  if (!sub) throw new Error("Subscription lookup unavailable");
  if (!sub.customer_id || !sub.items?.some(item => (item.price?.id ?? item.price_id) === MONTHLY_PRICE_ID)) return;
  const email = await fetchCustomerEmail(sub.customer_id);
  if (!email) throw new Error("Customer lookup unavailable");
  await setPaymentPastDue(email, sub.status === "past_due");
  if (["canceled", "paused"].includes(sub.status || "")) await revokeMonthlyForSubscription(email, subscriptionId);
  else if (["cancel", "pause"].includes(sub.scheduled_change?.action || "")) {
    const end = Date.parse(sub.scheduled_change?.effective_at || "");
    if (Number.isFinite(end)) await capMonthlyForSubscription(email, subscriptionId, Math.floor(end / 1000));
  }
}

/**
 * Asked only when this account is marked past due, before refusing a paid
 * rewrite: reads the subscription's status from Paddle again, so a recovery
 * whose webhook never arrived does not keep a paying customer paused.
 * Throws if Paddle cannot answer; the caller then keeps the mark.
 */
export async function stillPastDue(email: string): Promise<boolean> {
  const subscriptionId = await getSubscriptionId(email);
  if (!subscriptionId) { await setPaymentPastDue(email, false); return false; }
  const sub = await paddleGet<PurchaseSubscription>(`/subscriptions/${subscriptionId}`);
  if (!sub) throw new Error("Subscription lookup unavailable");
  const pastDue = sub.status === "past_due";
  await setPaymentPastDue(email, pastDue);
  return pastDue;
}

/** Email proof can recover a purchase even when both initial activation and webhook were missed. */
export async function restoreProByEmail(email: string): Promise<boolean> {
  if (await refreshMonthlyPro(email)) return true;
  const customers = await paddleGet<{ id: string; email: string }[]>(`/customers?email=${encodeURIComponent(email)}&status=active,archived&per_page=100`);
  if (!customers) throw new Error("Customer lookup unavailable");
  for (const customer of customers) {
    if (customer.email.trim().toLowerCase() !== email || !/^ctm_[a-z0-9]{26}$/.test(customer.id)) continue;
    for await (const candidate of completedTransactions(`customer_id=${customer.id}`)) {
        if (!mayHaveAccess(candidate) || candidate.customer_id !== customer.id) continue;
        const tx = await fetchTransaction(candidate.id);
        if (tx && await grantProForTransaction(tx) === email) return true;
    }
  }
  return false;
}
