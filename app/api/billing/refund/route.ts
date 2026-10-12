import { NextRequest, NextResponse } from "next/server";
import { BILLING_COOKIE, readBillingSessionDetails } from "@/lib/billing";
import { getRefundView, requestFirstPaymentRefund } from "@/lib/refunds";
import { refundIntentStore, allowRecoveryAttempt } from "@/lib/redis";
import { sessionSecret } from "@/lib/pro-cookie";
import { sessionIsLive } from "@/lib/pro";
import { RECOVERY_ORIGIN } from "@/lib/recovery";
import { revokeProForRefund } from "@/lib/paddle";

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
// A billing session ended by "Sign out on all devices" is refused like an expired one.
async function identity(req: NextRequest) {
  const session = readBillingSessionDetails(req.cookies.get(BILLING_COOKIE)?.value || "", sessionSecret());
  return session && await sessionIsLive(session) ? session.email : null;
}
async function reconcileApproved(refund: Awaited<ReturnType<typeof getRefundView>>) {
  if (refund.state === "approved" && refund.transactionId) {
    // Also repair access on refresh if an approval webhook was delayed or missed.
    try { await revokeProForRefund(refund.transactionId); }
    catch { console.error("na:refund: access reconciliation pending"); }
  }
}
export async function GET(req: NextRequest) {
  try {
    const email = await identity(req);
    if (!email) return reply({ error: "verify_email" }, 401);
    if (!await allowRecoveryAttempt("refund-read", email, 30)) return reply({ error: "too_many_requests" }, 429);
    const refund = await getRefundView(email, process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || "", refundIntentStore);
    await reconcileApproved(refund);
    return reply({ refund });
  } catch { return reply({ error: "unavailable" }, 503); }
}
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== (process.env.NODE_ENV === "production" ? RECOVERY_ORIGIN : req.nextUrl.origin)) return reply({ error: "invalid_origin" }, 403);
  try {
    const email = await identity(req);
    if (!email) return reply({ error: "verify_email" }, 401);
    let body;
    try { body = await req.json(); } catch { return reply({ error: "invalid_request" }, 400); }
    if (body?.confirmRefundAndCancellation !== true || typeof body.transactionId !== "string" || !/^txn_[a-z0-9]{26}$/.test(body.transactionId)) return reply({ error: "invalid_request" }, 400);
    if (!await allowRecoveryAttempt("refund-write", email, 10)) return reply({ error: "too_many_requests" }, 429);
    const refund = await requestFirstPaymentRefund(email, body.transactionId, process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || "", refundIntentStore);
    await reconcileApproved(refund);
    return reply({ refund });
  } catch { return reply({ error: "refund_not_confirmed" }, 503); }
}
