import { cookies } from "next/headers";
import { PRO_COOKIE_NAME, readProSessionDetails, sessionSecret } from "./pro-cookie";
import { getProRecord, signedOutAt } from "./redis";
import { refreshMonthlyPro } from "./paddle";

/** A session is live unless its address signed out everywhere after it was issued. */
export async function sessionIsLive(session: { email: string; issuedAt: number }): Promise<boolean> {
  const cutoff = await signedOutAt(session.email);
  return cutoff === 0 || session.issuedAt > cutoff;
}

/**
 * Reads the Pro cookie (set after a successful Paddle checkout or an email
 * login) and confirms the email is actually marked Pro in Redis.
 * Never trust the cookie alone — Redis is the source of truth.
 *
 * `signedOut` means the cookie is genuine but was ended by "Sign out on all
 * devices"; the caller should clear it.
 */
export async function getProStatus(): Promise<{ pro: boolean; email: string | null; lifetime?: boolean; needsRestore?: boolean; signedOut?: boolean }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PRO_COOKIE_NAME)?.value;
  if (!raw) return { pro: false, email: null };
  const session = readProSessionDetails(raw, sessionSecret());
  // Older unsigned email cookies must be re-verified by logging in again.
  if (!session) return { pro: false, email: null, needsRestore: true };
  if (!await sessionIsLive(session)) return { pro: false, email: null, signedOut: true };
  const { email } = session;

  const record = await getProRecord(email);
  // A Lifetime purchase (no longer sold) keeps what it was sold: see the rewrite route.
  if (record?.startsWith("lifetime:")) return { pro: true, email, lifetime: true };
  let pro = Boolean(record);
  if (!pro) {
    // Monthly access lapsed in Redis: confirm with Paddle before locking out
    // a customer whose renewal simply hasn't been recorded yet.
    pro = await refreshMonthlyPro(email);
  }
  return { pro, email };
}
