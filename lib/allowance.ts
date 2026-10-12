/*
 * What a plan can cost at its worst (12 Oct 2026)
 *
 * The rule: no plan may ever be able to lose money. The worst-case cost of
 * any customer sits well below what the plan takes in, with a high margin,
 * and the protection acts on its own — nobody watches a dashboard or answers
 * an alert. Every number below is enforced in lib/redis.ts before a model
 * call is made, not reported after it.
 *
 * Pro: $19.00 a month. Paddle keeps 5% + $0.50 = $1.45, so $17.55 arrives.
 *   What the customer is sold: up to 10 rewrites per UTC day per account
 *   (the purchase email), each counting as one, up to 3,500 characters a
 *   request. A person writing English uses about $0.019 of model cost on a
 *   full-length rewrite, so 10 a day for 31 days is about $5.80-$5.90.
 *
 *   The daily count alone does not bound cost: a 3,500-character request in
 *   a script the tokenizer reads as one token per character, answered at
 *   full max_tokens, costs about $0.08, and 310 of those would be $26. So a
 *   cost meter stays behind it as the backstop: $6.00 of model cost per
 *   account per calendar month (UTC). A request is admitted while at least
 *   $0.01 is left, so the last one may finish past the line;
 *   PRO_OVERDRAFT_MICRO_USD ($0.25, more than the largest request can
 *   reserve) is the hard ceiling on that. Worst month: $6.25 of model cost
 *   against $17.55 → 64% margin. A real person does not reach it.
 *
 * Free: one rewrite a day per browser, and on top of that a ceiling shared
 *   by every free visitor together: $1.00 of model cost per UTC day, at
 *   most about $31 a month for all free use, however many browsers or
 *   networks ask.
 *
 * Both cost meters reserve the worst case before the call (one token per
 * UTF-8 byte of the system prompt and the draft, plus framing, at the input
 * rate; max_tokens at the output rate) and settle the real cost from the
 * provider's usage afterward. If a counter or a meter cannot be read, no
 * paid call is made.
 *
 * Any change to the price, the limits, the request length or the model's
 * rates redoes this arithmetic in the same commit.
 */
import { INPUT_MICRO_USD_PER_TOKEN, OUTPUT_MICRO_USD_PER_TOKEN } from "./ai-cost";

/** Rewrites a Pro account may start per UTC day; each counts as one, whatever its length. */
export const PRO_DAILY_REWRITES = 10;
/** The backstop: $6.00 of model cost per Pro account per calendar month (UTC). */
export const PRO_MONTHLY_BUDGET_MICRO_USD = 6_000_000;
/** A Pro request is admitted only while at least this much ($0.01) of the month is left. */
export const MIN_HEADROOM_MICRO_USD = 10_000;
/** The most a month can exceed the budget by, because the last admitted rewrite may finish past it. */
export const PRO_OVERDRAFT_MICRO_USD = 250_000;
/** $1.00 of model cost per UTC day, shared by every free visitor together. */
export const FREE_DAILY_POOL_MICRO_USD = 1_000_000;

/** Must match the max_tokens sent to the model. */
export const MAX_OUTPUT_TOKENS = 4096;
/** Role markers and message framing the provider adds around the text. */
export const REQUEST_OVERHEAD_TOKENS = 64;

export const PRO_METER_TTL_SECONDS = 40 * 86400;
export const PRO_DAY_TTL_SECONDS = 2 * 86400;
export const FREE_POOL_TTL_SECONDS = 3 * 86400;

/** No tokenizer produces more tokens than UTF-8 bytes, so bytes bound tokens from above. */
export function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** The most this request can cost, in micro-USD, before the provider has seen it. */
export function worstCaseMicroUsd(systemPrompt: string, userText: string, maxTokens = MAX_OUTPUT_TOKENS): number {
  const inputTokens = utf8Length(systemPrompt) + utf8Length(userText) + REQUEST_OVERHEAD_TOKENS;
  return inputTokens * INPUT_MICRO_USD_PER_TOKEN + maxTokens * OUTPUT_MICRO_USD_PER_TOKEN;
}

export type MeterKind = "pro" | "free";

/**
 * What a finished call is charged on a cost meter: its real cost, rounded up
 * to a whole micro-dollar. `null` means the provider billed nothing (it
 * refused the request), so the whole reservation is released.
 */
export function chargeFor(costMicroUsd: number | null): number {
  if (costMicroUsd === null) return 0;
  return Number.isFinite(costMicroUsd) && costMicroUsd > 0 ? Math.ceil(costMicroUsd) : 0;
}

export type MeterLimits = { budget: number; floorUnit: number; ceiling: number };

/**
 * Pro: admitted while at least $0.01 is left, and never past the
 * budget plus the overdraft. Free: admitted only if the whole reservation
 * fits in today's pool.
 */
export function meterLimits(kind: MeterKind, amount: number): MeterLimits {
  return kind === "pro"
    ? { budget: PRO_MONTHLY_BUDGET_MICRO_USD, floorUnit: MIN_HEADROOM_MICRO_USD, ceiling: PRO_MONTHLY_BUDGET_MICRO_USD + PRO_OVERDRAFT_MICRO_USD }
    : { budget: FREE_DAILY_POOL_MICRO_USD, floorUnit: amount, ceiling: FREE_DAILY_POOL_MICRO_USD };
}

/** The same decision RESERVE_METER_SCRIPT makes, for tests and for reading. */
export function admits(used: number, amount: number, limits: MeterLimits): boolean {
  return amount > 0 && used + limits.floorUnit <= limits.budget && used + amount <= limits.ceiling;
}

/** The same arithmetic SETTLE_METER_SCRIPT does: the counter never goes below zero. */
export function settledTotal(current: number, reserved: number, charged: number): number {
  return Math.max(0, current + (charged - reserved));
}

/** The same decision RESERVE_DAY_SCRIPT makes for a new rewrite. */
export function dayAdmits(startedToday: number, limit = PRO_DAILY_REWRITES): boolean {
  return startedToday < limit;
}

export function remainingToday(startedToday: number, limit = PRO_DAILY_REWRITES): number {
  const used = Number.isFinite(startedToday) && startedToday > 0 ? Math.floor(startedToday) : 0;
  return Math.max(0, limit - used);
}

export function meterMonth(now: Date): string {
  return now.toISOString().slice(0, 7);
}

export function meterDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** "November 1": the first day of the next calendar month in UTC. */
export function renewalLabel(now: Date): string {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

/** "in about 7 hours" until the next 00:00 UTC; "in less than an hour" in the last hour. */
export function resetHint(now: Date): string {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const hours = Math.round((midnight - now.getTime()) / 3_600_000);
  if (midnight - now.getTime() < 3_600_000) return "in less than an hour";
  return hours === 1 ? "in about 1 hour" : `in about ${hours} hours`;
}

export function dailyLimitMessage(now: Date): string {
  return `You've used today's ${PRO_DAILY_REWRITES} Pro rewrites. They reset at 00:00 UTC (${resetHint(now)}). Your draft is still here.`;
}

/** The address is written out here because this module imports nothing from the app; a test checks it matches SUPPORT_EMAIL. */
export function monthlySafeguardMessage(now: Date): string {
  return `This account has reached its monthly safeguard against automated use. It resets on ${renewalLabel(now)} at 00:00 UTC. If you think this is a mistake, write to support@hireword.com.`;
}

export const PAST_DUE_MESSAGE =
  "Your last Pro payment didn't go through, so Pro rewrites are paused. Update your payment method from the link in your Paddle email; rewriting resumes as soon as the payment succeeds. Your draft is still here.";

export const FREE_POOL_MESSAGE =
  "Free rewrites are paused for today because today's shared free allowance is used. They resume at 00:00 UTC; Pro is not affected.";

/**
 * KEYS[1] the meter. ARGV: amount, budget, floor unit, ceiling, TTL seconds.
 * Adds the reservation only if the decision in `admits` says yes; returns
 * {1, new total} or {0, current total}. The TTL is set on the first write.
 */
export const RESERVE_METER_SCRIPT =
  "local used = tonumber(redis.call('GET', KEYS[1]) or '0') or 0; " +
  "local amount = tonumber(ARGV[1]); " +
  "if amount <= 0 or used + tonumber(ARGV[3]) > tonumber(ARGV[2]) or used + amount > tonumber(ARGV[4]) then return {0, used} end; " +
  "local total = redis.call('INCRBY', KEYS[1], amount); " +
  "if redis.call('TTL', KEYS[1]) < 0 then redis.call('EXPIRE', KEYS[1], ARGV[5]) end; " +
  "return {1, total}";

/**
 * KEYS[1] the meter. ARGV: charged minus reserved, TTL seconds. Applies the
 * difference and never leaves the counter below zero; returns the new total.
 */
export const SETTLE_METER_SCRIPT =
  "local total = redis.call('INCRBY', KEYS[1], ARGV[1]); " +
  "if total < 0 then redis.call('SET', KEYS[1], '0', 'KEEPTTL'); total = 0 end; " +
  "if redis.call('TTL', KEYS[1]) < 0 then redis.call('EXPIRE', KEYS[1], ARGV[2]) end; " +
  "return total";

/**
 * KEYS[1] the account's set of today's rewrites. ARGV: this request's id,
 * the limit, TTL seconds. Adds the id only while fewer than the limit are
 * there; returns {1, count} or {0, count}. One id per request, so giving a
 * rewrite back removes exactly that request and nobody else's.
 */
export const RESERVE_DAY_SCRIPT =
  "local n = redis.call('SCARD', KEYS[1]); " +
  "if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 1 then return {1, n} end; " +
  "if n >= tonumber(ARGV[2]) then return {0, n} end; " +
  "redis.call('SADD', KEYS[1], ARGV[1]); " +
  "if redis.call('TTL', KEYS[1]) < 0 then redis.call('EXPIRE', KEYS[1], ARGV[3]) end; " +
  "return {1, n + 1}";

/** KEYS[1] the same set, ARGV[1] the request's id. Gives back that one rewrite. */
export const REFUND_DAY_SCRIPT = "return redis.call('SREM', KEYS[1], ARGV[1])";
