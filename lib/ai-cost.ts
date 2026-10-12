// Standard Claude Sonnet 4.5 USD rates checked 2026-09-24.
// Estimates only: provider invoices remain the source of truth.
// https://platform.claude.com/docs/en/about-claude/pricing
export const REWRITE_MODEL = "claude-sonnet-4-5";
/** $3 per million input tokens and $15 per million output tokens, in micro-USD per token. */
export const INPUT_MICRO_USD_PER_TOKEN = 3;
export const OUTPUT_MICRO_USD_PER_TOKEN = 15;
export type TokenUsage = { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null };
export function estimateRewriteCost(usage: TokenUsage) {
  const count = (n: number | null | undefined) => Number.isSafeInteger(n) && Number(n) >= 0 ? Number(n) : 0;
  const input = count(usage.input_tokens), output = count(usage.output_tokens);
  const cacheRead = count(usage.cache_read_input_tokens), cacheWrite = count(usage.cache_creation_input_tokens);
  // Use the one-hour cache rate as a conservative estimate for any cache writes.
  const microUsd = input * INPUT_MICRO_USD_PER_TOKEN + output * OUTPUT_MICRO_USD_PER_TOKEN + cacheRead * 0.3 + cacheWrite * 6;
  return { input, output, cacheRead, cacheWrite, costMicroUsd: Math.ceil(microUsd) };
}
