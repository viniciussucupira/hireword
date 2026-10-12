# Pro access emails

## Production configuration

- Resend domain: `mail.hireword.com` (DNS hosted on Vercel).
- `RESEND_API_KEY`: a sending-only key restricted to that domain, stored only in Vercel's sensitive production environment variables.
- `RECOVERY_EMAIL_FROM`: `Hireword <access@mail.hireword.com>`.
- Uses existing Redis credentials and the existing Pro session signing secret.
- Redeploy after adding environment variables. The email form remains hidden until both email variables exist.
- Disable open/click tracking for this domain. Access tokens are URL fragments and must not be rewritten or tracked.

## Flow and safeguards

`/login` requests an email (`/restore` redirects there); `/restore/email#token=...` displays an explicit confirmation. POST verification checks existing paid entitlement, then atomically consumes the token and sets the signed Pro cookie. GET never consumes a token, protecting against email link scanners. Only token hashes are stored, with a 15-minute expiry. No bearer token or email is logged by the handlers. Tokens are removed from the address bar before verification. Rate limits: 3 emails/address/hour, 10/IP/hour, 100 total/hour; 30 verification attempts/IP/hour. Redis errors fail closed. Delivery failures invalidate that token. Temporary entitlement errors allow retry until expiration.

Every valid, permitted request receives the same access email regardless of purchase status. Subscription status is disclosed only after proving control of that inbox. A purchase recorded by the Paddle checkout/webhook is required; inactive customers are never granted Pro. Missing purchase records retain the receipt-code and support fallback.

## Launch validation

Run `npm run lint`, `npm test`, `npm run build`. Verify the mobile form and error/success screens. With configuration active, send a test link to an owner-controlled inbox, verify delivery in Resend, then check that an inbox without a paid purchase is denied. Use an existing paid test purchase to validate success without making a new charge. Never manually grant production Pro for a test. Verify replay rejection. Do not claim full delivery validation until a real email has arrived.

## Validation on September 24, 2026

- Resend verified DKIM, SPF and the return-path MX for `mail.hireword.com`; TLS is enforced and tracking is not configured.
- Production has a domain-restricted sending key stored as a Vercel Secret, plus the configured sender.
- 13 unit tests, lint and production build passed. Mobile layout checked at 390px.
- Local end-to-end fixture verified request validation, same-origin protection, delivery adapter, signed Pro cookie, `/api/me` paid status, unpaid denial, replay rejection and request rate limiting. The fixture did not call real payment/email services.
- A real production email was delivered by Resend and arrived in the owner's Gmail inbox. Its link denied access for an email without a recorded active purchase; replay returned an invalid/used-link response. Paid activation was tested with the local fixture, not a real paid production purchase. No new payment or artificial production entitlement was created.

## Log out (26 September 2026)

`/login` shows the signed-in address with **Log out** and **Log out of all devices**. The second stores one timestamp per address (`na:signout:<hash>`); every Pro and billing session issued before it is refused. Purchase codes log in only within 24 hours of payment while email login is configured.
