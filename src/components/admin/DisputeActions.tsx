"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, RotateCcw, AlertCircle, ShieldCheck } from "lucide-react";
import { releaseDisputeFundsToLandlord, refundDisputeFundsToTenant } from "@/app/actions/admin";
import { fmtAmount } from "@/lib/utils";

interface DisputeActionsProps {
  transactionId: string;
  amount: number;
  tenantName: string;
  landlordName: string;
}

type Decision = "release" | "refund";

export function DisputeActions({
  transactionId,
  amount,
  tenantName,
  landlordName,
}: DisputeActionsProps) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit() {
    if (!decision) return;
    setLoading(true);
    setResult(null);

    const action =
      decision === "release"
        ? releaseDisputeFundsToLandlord(transactionId, notes || undefined)
        : refundDisputeFundsToTenant(transactionId, notes || undefined);

    const res = await action;
    if (res?.error) {
      setResult({ type: "error", message: res.error });
    } else {
      setResult({
        type: "success",
        message:
          decision === "release"
            ? `₦${fmtAmount(amount)} released to ${landlordName}. Decision logged.`
            : `₦${fmtAmount(amount)} refunded to ${tenantName}. Decision logged.`,
      });
    }
    setLoading(false);
  }

  if (result?.type === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-8 flex flex-col items-center gap-3 text-center">
        <ShieldCheck className="h-10 w-10 text-emerald-500" />
        <p className="font-semibold text-slate-800">{result.message}</p>
        <p className="text-xs text-slate-500">This decision has been permanently logged against your admin account.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-slate-900 text-sm">Admin Decision</h3>
        <p className="text-xs text-slate-500 mt-1">
          Choose an outcome for this dispute. Your decision will be logged.
        </p>
      </div>

      {/* Decision cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDecision("release")}
          className={`rounded-lg border-2 p-4 text-left transition-all ${
            decision === "release"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <CheckCircle2 className={`h-5 w-5 mb-2 ${decision === "release" ? "text-emerald-600" : "text-slate-400"}`} />
          <p className={`text-sm font-semibold ${decision === "release" ? "text-emerald-800" : "text-slate-700"}`}>
            Release to Landlord
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            ₦{fmtAmount(amount)} → {landlordName}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setDecision("refund")}
          className={`rounded-lg border-2 p-4 text-left transition-all ${
            decision === "refund"
              ? "border-red-500 bg-red-50"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <RotateCcw className={`h-5 w-5 mb-2 ${decision === "refund" ? "text-red-600" : "text-slate-400"}`} />
          <p className={`text-sm font-semibold ${decision === "refund" ? "text-red-800" : "text-slate-700"}`}>
            Refund to Tenant
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            ₦{fmtAmount(amount)} → {tenantName}
          </p>
        </button>
      </div>

      {/* Admin notes */}
      {decision && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-700">
            Admin Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Briefly explain your reasoning for the audit log…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Error */}
      {result?.type === "error" && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {result.message}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!decision || loading}
        className={`w-full font-semibold ${
          decision === "release"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : decision === "refund"
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
      >
        {loading
          ? "Processing…"
          : !decision
          ? "Select an outcome above"
          : decision === "release"
          ? `Confirm Release → ${landlordName}`
          : `Confirm Refund → ${tenantName}`}
      </Button>
    </div>
  );
}
