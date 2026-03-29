"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { confirmMoveIn, disputeTransaction } from "@/app/actions/escrow";

interface EscrowActionsProps {
  transactionId: string;
}

export function EscrowActions({ transactionId }: EscrowActionsProps) {
  const [loading, setLoading] = useState<"confirm" | "dispute" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleConfirm() {
    setLoading("confirm");
    setMessage(null);
    const result = await confirmMoveIn(transactionId);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Move-in confirmed! Funds released to landlord." });
    }
    setLoading(null);
  }

  async function handleDispute() {
    if (!confirm("Are you sure you want to open a dispute? Funds will be frozen until resolved.")) return;
    setLoading("dispute");
    setMessage(null);
    const result = await disputeTransaction(transactionId);
    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Dispute opened. Funds are frozen. Admin has been notified." });
    }
    setLoading(null);
  }

  if (message?.type === "success") {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
        {message.text}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={loading !== null}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {loading === "confirm" ? "Confirming…" : "Confirm Move-In"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDispute}
          disabled={loading !== null}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {loading === "dispute" ? "Opening…" : "Dispute"}
        </Button>
      </div>
      {message?.type === "error" && (
        <p className="text-xs text-destructive">{message.text}</p>
      )}
    </div>
  );
}
