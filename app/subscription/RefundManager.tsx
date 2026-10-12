"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Primitives";
import { refreshProStatus } from "@/components/ui/useProStatus";
import type { RefundView } from "@/lib/refunds";

function amount(view: RefundView) {
  if (!view.currency || !view.amount) return "your first payment";
  try {
    const format = new Intl.NumberFormat("en-US", { style: "currency", currency: view.currency });
    return format.format(Number(view.amount) / 10 ** (format.resolvedOptions().maximumFractionDigits ?? 2));
  } catch { return "your first payment"; }
}
export default function RefundManager({ onSessionExpired, onSubmitted }: { onSessionExpired: () => void; onSubmitted: () => void }) {
  const [view, setView] = useState<RefundView | null>(null);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false), [error, setError] = useState("");
  const submitting = useRef(false);
  async function load() {
    setLoading(true); setError(""); setConfirm(false); setView(null);
    try {
      const response = await fetch("/api/billing/refund", { cache: "no-store", signal: AbortSignal.timeout(45000) });
      if (response.status === 401) { onSessionExpired(); return; }
      if (!response.ok) throw Error();
      const data = await response.json(); setView(data.refund);
      if (data.refund.state === "approved") refreshProStatus();
    } catch { setError("We could not check your refund status. Refresh below, or request help directly from Paddle. You do not need to email Hireword."); }
    finally { setLoading(false); }
  }
  // Parent mounts this only after purchase-email verification succeeds.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void Promise.resolve().then(load); }, []);
  async function submit() {
    if (!view?.transactionId || submitting.current) return;
    submitting.current = true;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/billing/refund", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transactionId: view.transactionId, confirmRefundAndCancellation: true }), signal: AbortSignal.timeout(60000) });
      if (response.status === 401) { onSessionExpired(); return; }
      if (!response.ok) throw Error();
      const data = await response.json(); setView(data.refund); setConfirm(false);
      if (data.refund.state === "approved") refreshProStatus();
      onSubmitted();
    } catch { setConfirm(false); setView(null); setError("We could not confirm the refund request. Refresh the status before trying again. If it remains unclear, use Paddle payment help below. Do not start another purchase."); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <div className="space-y-3">
    <p className="text-sm leading-6 text-muted">Your first payment has a 14-day refund guarantee. Request it here, without emailing support. Renewals are not refunded, except where the law requires it or a fault on our side kept Pro from working. We submit eligible requests directly to Paddle. Paddle may review the request before approving it.</p>
    {loading && <p role="status">Checking your first payment…</p>}
    {error && <p role="alert" className="text-flag">{error}</p>}
    {!loading && view && <>
      {view.transactionId && <p className="text-sm">First payment: <strong>{amount(view)}</strong>{view.paidAt ? ` · ${new Date(view.paidAt).toLocaleDateString("en-US", { timeZone: "UTC" })}` : ""}</p>}
      {view.state === "eligible" && view.deadline && <p className="text-sm text-muted">Request by {new Date(view.deadline).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "long", timeStyle: "short" })} UTC.</p>}
      {view.state === "eligible" && (confirm ? <div className="rounded-xl border border-line bg-white p-4">
        <p>Request a full refund of {amount(view)} and stop future renewals for this subscription? Once approved, the Pro access from this payment ends. The money returns to the original payment method; the timing depends on your payment provider.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Button disabled={busy} onClick={submit}>{busy ? "Submitting request…" : "Confirm refund and stop renewal"}</Button><Button disabled={busy} variant="secondary" onClick={() => setConfirm(false)}>Go back</Button></div>
      </div> : <Button onClick={() => setConfirm(true)}>Request a refund</Button>)}
      {view.state === "pending_approval" && <p role="status" className="font-semibold">Refund request received by Paddle — awaiting approval. Do not submit another request. You can refresh the status here.</p>}
      {view.state === "approved" && <p role="status" className="font-semibold">Refund approved by Paddle. The credit may take time to appear on your original payment method. Access from this refunded payment ends.</p>}
      {view.state === "unconfirmed" && <p role="status">A refund submission was attempted, but its outcome has not been confirmed. To prevent duplicate requests, we will not submit it again automatically. Refresh the status or ask Paddle to check your payment.</p>}
      {view.state === "none" && <p>No completed Hireword payment was found for this email. If you just paid, refresh in a moment or verify the email on your receipt.</p>}
      {view.state === "outside_window" && <p>The 14-day guarantee covers your first payment only, and it has ended. You can still ask Paddle to review a payment issue below. This does not remove any rights you have under consumer law.</p>}
      {view.state === "review" && <p>This payment needs individual review. Request help directly from Paddle below; you do not need to email Hireword. This does not remove any rights you have under consumer law.</p>}
    </>}
    <div className="flex flex-wrap gap-4"><button type="button" disabled={busy || loading} onClick={load} className="min-h-11 font-semibold text-brand-700 underline">Refresh refund status</button><a href="https://paddle.net/contact" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-brand-700 underline">Paddle payment help</a></div>
  </div>;
}
