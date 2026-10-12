import { Redis } from "@upstash/redis";
import { recoveryHash, type RecoveryStore } from "./recovery";
import { createHmac } from "node:crypto";
import { estimateRewriteCost, type TokenUsage, REWRITE_MODEL } from "./ai-cost";
import { RESERVE_FREE_SCRIPT, REFUND_FREE_SCRIPT } from "./free-session";
import { sessionSecret } from "./pro-cookie";

/** Cost metadata only; never store customer drafts, outputs, email addresses or IPs. */
export async function recordRewriteCost(usage: TokenUsage, pro: boolean, email: string | null) {
  const totals = estimateRewriteCost(usage);
  const day = new Date().toISOString().slice(0, 10), month = day.slice(0, 7);
  const tier = pro ? "pro" : "free";
  // Vercel logs provide a second private record if Redis is temporarily unavailable.
  console.info("na:ai-cost", JSON.stringify({ day, tier, model: REWRITE_MODEL, ...totals }));
  try {
    const client = getRedis();
    if (!client) throw new Error("Missing usage storage");
    const key = `na:ai-cost:day:${day}:${tier}`;
    const tx = client.multi();
    for (const [field, value] of Object.entries({ requests: 1, ...totals })) tx.hincrby(key, field, value);
    tx.expire(key, 400 * 86400);
    if (pro && email) {
      const account = createHmac("sha256", sessionSecret()).update(`nativeapply:cost:${month}:${email}`).digest("hex");
      const top = `na:ai-cost:accounts:${month}`;
      tx.zincrby(top, totals.costMicroUsd, account);
      tx.expire(top, 400 * 86400);
    }
    await tx.exec();
  } catch {
    // A metrics outage must never charge the free quota without delivering the result.
    console.error("na:ai-cost:storage-unavailable");
  }
}

// Reuses the SAME Upstash Redis instance as Fluentsmith. Every key this product
// touches is namespaced with "na:" so it never collides with other products.
let redis: Redis | null = null;

function firstNonEmptyEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) return value;
  }
  return undefined;
}

function getRedis(): Redis | null {
  // Prefer the vars auto-provisioned by the Vercel/Upstash integration; the
  // plain UPSTASH_REDIS_REST_* vars have been empty in this project before.
  const url = firstNonEmptyEnv("UPSTASH_REDIS_REST_KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
  const token = firstNonEmptyEnv("UPSTASH_REDIS_REST_KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;
  if (!redis) redis = new Redis({ url, token });
  return redis;
}

const DAY_SECONDS = 60 * 60 * 24;

function recoveryClient(): Redis {
  const client = getRedis();
  if (!client) throw new Error("Recovery storage unavailable");
  return client;
}

export const recoveryStore: RecoveryStore = {
  async put(hash, email, ttl) { await recoveryClient().set(`na:recovery:token:${hash}`, email, { ex: ttl }); },
  async read(hash) { return await recoveryClient().get<string>(`na:recovery:token:${hash}`); },
  async consume(hash) { return await recoveryClient().getdel<string>(`na:recovery:token:${hash}`); },
  async remove(hash) { await recoveryClient().del(`na:recovery:token:${hash}`); },
};

// Billing proof is separate from Pro restoration: receipt codes never grant billing rights.
export const billingRecoveryStore: RecoveryStore = {
  async put(hash, email, ttl) { await recoveryClient().set(`na:billing:token:${hash}`, email, { ex: ttl }); },
  async read(hash) { return await recoveryClient().get<string>(`na:billing:token:${hash}`); },
  async consume(hash) { return await recoveryClient().getdel<string>(`na:billing:token:${hash}`); },
  async remove(hash) { await recoveryClient().del(`na:billing:token:${hash}`); },
};

// "Sign out on all devices": one timestamp per address. Every Pro or billing
// session issued at or before it is refused. Keyed by a hash, so the store
// holds no address in the clear. It outlives the longest session (one year)
// and then expires on its own, since nothing older can still be valid.
const SIGNOUT_TTL_SECONDS = 400 * DAY_SECONDS;
const signoutKey = (email: string) => `na:signout:${recoveryHash(`nativeapply:signout:${email.trim().toLowerCase()}`)}`;

/** Milliseconds of the last "sign out everywhere", or 0. Throws if the store cannot answer. */
export async function signedOutAt(email: string): Promise<number> {
  const value = await recoveryClient().get<number | string>(signoutKey(email));
  const n = typeof value === "number" ? value : Number(value);
  return value !== null && value !== undefined && Number.isFinite(n) && n > 0 ? n : 0;
}

export async function signOutEverywhere(email: string, now = Date.now()): Promise<void> {
  await recoveryClient().set(signoutKey(email), now, { ex: SIGNOUT_TTL_SECONDS });
}

/** Atomic counter + expiry; no raw email/IP in rate-limit keys. Fail closed. */
export async function allowRecoveryAttempt(scope: string, identity: string, limit: number, seconds = 3600): Promise<boolean> {
  const count = await recoveryClient().eval<[number], number>(
    "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n",
    [`na:recovery:limit:${scope}:${recoveryHash(identity)}`], [seconds],
  );
  return count <= limit;
}

/** Returned by incrementDailyUsage when the count could not be read at all. */
export const USAGE_UNVERIFIABLE = -1;

function usageKey(browserId: string, day: string): string {
  return `na:free-browser:${browserId}:${day}`;
}

/** Reserve one attempt atomically. Rejected requests never consume extra quota. */
export async function incrementDailyUsage(browserId: string, reservation: string, day: string): Promise<number> {
  const client = getRedis();
  if (!client) return process.env.NODE_ENV === "production" ? USAGE_UNVERIFIABLE : 1;
  try {
    return await client.eval<[string, number], number>(RESERVE_FREE_SCRIPT, [usageKey(browserId, day)], [reservation, DAY_SECONDS * 2]);
  } catch { return USAGE_UNVERIFIABLE; }
}

/** Roll back only this failed request's reservation, including across midnight. */
export async function refundDailyUsage(browserId: string, reservation: string, day: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return process.env.NODE_ENV !== "production";
  try {
    await client.eval<[string], number>(REFUND_FREE_SCRIPT, [usageKey(browserId, day)], [reservation]);
    return true;
  }
  catch { console.error("na:free:refund-unavailable"); return false; }
}

// ---------------------------------------------------------------------------
// Pro access
//
// Value stored at na:pro:<email>:
//   "lifetime:<txn_id>"  — one-time Lifetime purchase, no expiry
//   "monthly:<txn_id>"   — monthly subscription, expires at the end of the
//                          paid billing period (+ grace). Every renewal
//                          (transaction.completed) pushes the expiry forward,
//                          so a cancelled subscription lapses on its own.
//   "1"                  — legacy value written before this scheme existed
// ---------------------------------------------------------------------------

function proKey(email: string): string {
  return `na:pro:${email.trim().toLowerCase()}`;
}

export async function isPro(email: string): Promise<boolean> {
  const client = getRedis();
  if (!client) throw new Error("Pro storage unavailable");
  const value = await client.get(proKey(email));
  return Boolean(value);
}

export async function grantLifetimePro(email: string, transactionId: string): Promise<boolean> {
  const client = getRedis();
  if (!client) throw new Error("Pro storage unavailable");
  return Boolean(await client.eval(
    "if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end; redis.call('SET', KEYS[1], ARGV[1]); return 1",
    [proKey(email), `na:refund:${transactionId}`], [`lifetime:${transactionId}`],
  ));
}

export async function grantMonthlyPro(
  email: string,
  transactionId: string,
  expiresAtSeconds: number,
  subscriptionId = ""
): Promise<boolean> {
  const client = getRedis();
  if (!client) throw new Error("Pro storage unavailable");
  // Atomic: refunds cannot race a grant; delayed renewals cannot shorten access.
  return Boolean(await client.eval(
    "if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end; local current = redis.call('GET', KEYS[1]); if current and string.sub(current, 1, 9) == 'lifetime:' then return 1 end; local ttl = redis.call('TTL', KEYS[1]); local now = redis.call('TIME'); if ttl > 0 and tonumber(now[1]) + ttl > tonumber(ARGV[2]) then return 1 end; redis.call('SET', KEYS[1], ARGV[1], 'EXAT', ARGV[2]); if ARGV[3] ~= '' then redis.call('SET', KEYS[3], ARGV[3]) end; return 1",
    [proKey(email), `na:refund:${transactionId}`, `na:sub:${email.trim().toLowerCase()}`], [`monthly:${transactionId}`, expiresAtSeconds, subscriptionId],
  ));
}

// Remembers which Paddle subscription a monthly customer has, so access can
// be re-checked with Paddle even if a renewal webhook never arrives.
export async function setSubscriptionId(email: string, subscriptionId: string): Promise<void> {
  const client = getRedis();
  if (!client) throw new Error("Pro storage unavailable");
  await client.set(`na:sub:${email.trim().toLowerCase()}`, subscriptionId);
}

export async function getSubscriptionId(email: string): Promise<string | null> {
  const client = getRedis();
  if (!client) return null;
  const value = await client.get<string>(`na:sub:${email.trim().toLowerCase()}`);
  return typeof value === "string" && value ? value : null;
}

export async function clearSubscriptionId(email: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  await client.del(`na:sub:${email.trim().toLowerCase()}`);
}

/** Revokes Pro only if it was granted by this exact transaction (refund/chargeback). */
export async function revokeProForTransaction(email: string, transactionId: string, subscriptionId = ""): Promise<void> {
  const client = getRedis();
  if (!client) throw new Error("Pro storage unavailable");
  await client.eval(
    "redis.call('SET', KEYS[2], '1'); local current = redis.call('GET', KEYS[1]); if current == ARGV[1] or current == ARGV[2] or current == ARGV[3] then redis.call('DEL', KEYS[1]) end; return 1",
    [proKey(email), `na:refund:${transactionId}`], [`monthly:${transactionId}`, `lifetime:${transactionId}`, `monthly:${subscriptionId}`],
  );
}

/** Durable refund intent, with no raw email or card data. Never expires into a duplicate POST. */
export const refundIntentStore = {
  async read(id: string) { return Boolean(await recoveryClient().get(`na:refund-request:${id}`)); },
  async claim(id: string, requestedAt: string) { return await recoveryClient().set(`na:refund-request:${id}`, requestedAt, { nx: true }) === "OK"; },
};

export async function revokeMonthlyForSubscription(email: string, subscriptionId: string): Promise<void> {
  const client = recoveryClient();
  await client.eval(
    "local current = redis.call('GET', KEYS[1]); if redis.call('GET', KEYS[2]) == ARGV[1] and current and string.sub(current, 1, 8) == 'monthly:' then redis.call('DEL', KEYS[1]) end; return 1",
    [proKey(email), `na:sub:${email.trim().toLowerCase()}`], [subscriptionId],
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function clearReversedRefund(transactionId: string): Promise<void> {
  await recoveryClient().del(`na:refund:${transactionId}`);
}

/** A scheduled cancellation can shorten the cache, never extend another purchase. */
export async function capMonthlyForSubscription(email: string, subscriptionId: string, expiresAt: number): Promise<void> {
  await recoveryClient().eval(
    "local current = redis.call('GET', KEYS[1]); if redis.call('GET', KEYS[2]) == ARGV[1] and current and string.sub(current, 1, 8) == 'monthly:' then local ttl = redis.call('TTL', KEYS[1]); local now = redis.call('TIME'); if ttl < 0 or tonumber(now[1]) + ttl > tonumber(ARGV[2]) then redis.call('EXPIREAT', KEYS[1], ARGV[2]) end end; return 1",
    [proKey(email), `na:sub:${email.trim().toLowerCase()}`], [subscriptionId, expiresAt],
  );
}

const TOTAL_REWRITES_KEY = "na:stats:totalRewrites";

function toRewriteCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export async function getTotalRewrites(): Promise<number> {
  try {
    const client = getRedis();
    if (!client) return 0;
    return toRewriteCount(await client.get(TOTAL_REWRITES_KEY));
  } catch (error) {
    console.error("na:stats: failed to read total rewrites", error);
    return 0;
  }
}

export async function incrementTotalRewrites(): Promise<number> {
  try {
    const client = getRedis();
    if (!client) return 0;
    return await client.incr(TOTAL_REWRITES_KEY);
  } catch (error) {
    console.error("na:stats: failed to increment total rewrites", error);
    return 0;
  }
}
