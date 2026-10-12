# Hireword

AI tool that rewrites cover letters, resume bullet points, and recruiter
messages so they read clear, confident, and professional — built for
professionals applying for jobs in the US, UK, Canada, and Europe.

Same architecture as Fluentsmith: Next.js (App Router) + Tailwind, freemium
rate-limited by IP via the same Upstash Redis instance, Pro unlocked through
Paddle (Merchant of Record) with a webhook, deployed on Vercel.

## Pages

- `/` — main tool (cover letter by default)
- `/cover-letter-rewriter`
- `/resume-rewriter`
- `/recruiter-message-rewriter`
- `/checkout` — Paddle checkout (Monthly $19; the Lifetime plan is no longer sold)
- `/login` — log in with a one-time email link, sign out, or sign out on all devices (`/restore` redirects here, keeping `?txn=`)
- `/terms`, `/privacy`, `/refunds`

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `ANTHROPIC_API_KEY` — same key used for Fluentsmith works fine here.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — copy the exact
  same values from the Fluentsmith Vercel project. This app namespaces its own
  keys (`na:...`) so it cannot collide with Fluentsmith's data in the same
  database — no new database needed.
- `NEXT_PUBLIC_PADDLE_ENV`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`,
  `NEXT_PUBLIC_PADDLE_PRICE_ID`, `NEXT_PUBLIC_PADDLE_LIFETIME_PRICE_ID`,
  `PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY` — from a **new product** created
  under the existing Paddle seller account (same account as
  Fluentsmith, just a new product + two new prices).

## Local development

```
npm install
npm run dev
```

## Rewrite experience and validation

- One free rewrite per day, without an email gate. Production usage checks fail closed if Redis is unavailable.
- Every model call is metered by cost before it is made (`lib/allowance.ts`, which holds the arithmetic): Pro gets 600 rewrites ($6.00 of model cost) per account per calendar month (UTC), and all free use together gets $1.00 a day. If the meter cannot be read, no call is made.
- American English is the default; British English is available in every editor.
- Results include the submitted original and a comparison of digit-based expressions. This check is not verification of names, claims, or meaning.
- Run `npm test` on Node 22.18+ or 24+, `npm run lint`, and `npm run build` before publishing.

## Pro session security

Pro cookies are signed and expire after one year; active entitlement is still checked with Redis/Paddle.
Set an optional `PRO_SESSION_SECRET` or keep the existing `PADDLE_WEBHOOK_SECRET` configured as the signing-key fallback.
Legacy unsigned cookies require logging in once; the editor explains that no new payment is needed.
Logging in is by a one-time email link (Resend, verified sender). A receipt code (`txn_…`) logs in only within 24 hours of the purchase while email login is configured.

## Logging in and logging out (26 Sept 2026)

The same way in as every Solrenning product: **Log in** (`/login`) sends a one-time link — 32 random bytes stored only as a hash, 15 minutes, one use, carried after `#`, spent only by a POST from our own page after a tap.

- Pro and billing sessions carry `iat`. Sessions made before it date themselves from their expiry, so nobody was logged out by the change.
- **Log out** clears this browser's Pro and billing cookies. **Log out of all devices** (`/api/signout` with `{ everywhere: true }`, same-origin, needs a live session) stores `na:signout:<hash>` = now; every Pro or billing session issued at or before it is refused (`sessionIsLive` in `lib/pro.ts`), and `/api/me` removes the dead cookie. The key expires after 400 days, when no older session can still be valid.
- A receipt is forwarded and archived for years, so its code is not a permanent key: `/api/paddle/confirm` answers `login_required` for a purchase older than 24 hours when email login is configured.

## On-site subscription cancellation

The Access & billing page verifies the purchase email using a separate one-time billing link. A signed, HttpOnly billing session lasts 15 minutes. Pro cookies and receipt codes cannot authorize cancellation. The server verifies the customer email and Hireword price for each request, cancels at the next billing period, and reads back Paddle status before confirming. Paused subscriptions cancel immediately.

Requires existing RESEND_API_KEY, RECOVERY_EMAIL_FROM, Redis, signing secret, NEXT_PUBLIC_PADDLE_PRICE_ID, and PADDLE_API_KEY with customer.read and subscription.write. An optional PADDLE_BILLING_API_KEY can isolate billing permissions. Never expose API keys to the client.

Validation: unit tests cover ownership/product isolation, session separation and expiry, provider failures, ambiguous timeout reconciliation and repeated cancellation. Local endpoint and browser tests cover billing email verification, purpose isolation, CSRF, explicit confirmation, period-end cancellation and confirmation UI using mock services only. No real customer subscription is canceled for testing.

## Deploy

1. Push this repo to GitHub.
2. Import it as a new Vercel project.
3. Add the environment variables above in Vercel → Settings → Environment
   Variables.
4. In Paddle, set the webhook endpoint to
   `https://<your-domain>/api/paddle/webhook` and subscribe it to the
   `transaction.completed`, `adjustment.created` and `adjustment.updated`
   events. Monthly Pro expires at the end of each paid period and is
   extended by every renewal, so `transaction.completed` must be delivered.
5. Point the domain (e.g. `hireword.com`) at the Vercel project.

## What's not done yet

- Domain registration and Paddle product/price creation — these involve a
  purchase / business account changes and need to be done by the account
  owner (or with the owner watching, one step at a time).
- No custom favicon binary was hand-picked; `app/opengraph-image.tsx`
  generates the social preview image dynamically, matching Fluentsmith's setup.


## Pricing and AI-cost measurement (September 24, 2026)

New monthly purchases use USD 19. Existing Paddle subscriptions retain their captured price; no subscription item updates are performed. The checkout price ID remains the same catalog entity.

Every Anthropic response records actual token counts and estimated Sonnet 4.5 cost before checking output completeness. Metadata-only `na:ai-cost` events are in private Vercel logs. Redis stores daily free/Pro aggregates and monthly top Pro costs using keyed pseudonyms, expiring after 400 days. No prompts, outputs, email addresses or IP addresses are included in cost records.

Run `npm run report:ai-cost -- YYYY-MM` in a trusted server environment with the existing Redis variables to get a private report. Never expose this command or Redis secrets through a public endpoint. Rates are in `lib/ai-cost.ts`; compare estimates with Anthropic invoices. Failures without returned token usage can be missing. These figures are AI cost, not net profit; include payment fees, refunds, taxes, hosting, advertising and support when evaluating margin. Collection starts at deployment, not retroactively.

## Fair free allowance

One free rewrite per browser per UTC day, identified by a signed HttpOnly cookie. Shared-IP users no longer spend one another's allowance. Redis atomically reserves the attempt; rejected attempts do not increment it, and failed generations release only their own reservation. A separate 60-attempt/hour hashed-network safeguard limits automation and uses a distinct message. Cookies are not accounts: another browser or cleared cookies can get a new allowance. No fingerprinting is used.

Validation includes two independent browsers on one IP, repeated denials, provider failure then success, concurrent requests and cost totals with mocked provider/Redis services.
