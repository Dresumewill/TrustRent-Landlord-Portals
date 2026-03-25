"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText, ShieldCheck, AlertCircle } from "lucide-react";
import { verifyLandlord, rejectLandlord } from "@/app/actions/admin";

interface PendingLandlord {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  id_document_url: string | null;
  deed_document_url: string | null;
  verification_status: string;
}

interface VerificationModalProps {
  landlord: PendingLandlord;
  trigger: React.ReactNode;
}

function DocumentPreview({ url, label }: { url: string | null; label: string }) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs gap-2">
        <FileText className="h-5 w-5" />
        <span>No {label} uploaded</span>
      </div>
    );
  }

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      {isPdf ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700"
        >
          <FileText className="h-4 w-4 text-slate-400" />
          View {label} (PDF)
        </a>
      ) : (
        <img
          src={url}
          alt={label}
          className="w-full h-40 object-cover"
        />
      )}
    </div>
  );
}

export function VerificationModal({ landlord, trigger }: VerificationModalProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"main" | "reject">("main");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"verify" | "reject" | null>(null);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleOpenChange(val: boolean) {
    setOpen(val);
    if (!val) {
      // Reset state on close
      setTimeout(() => { setView("main"); setReason(""); setResult(null); }, 200);
    }
  }

  async function handleVerify() {
    setLoading("verify");
    setResult(null);
    const res = await verifyLandlord(landlord.id);
    if (res?.error) {
      setResult({ type: "error", message: res.error });
    } else {
      setResult({ type: "success", message: `${landlord.full_name ?? "Landlord"} has been verified.` });
    }
    setLoading(null);
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setLoading("reject");
    setResult(null);
    const res = await rejectLandlord(landlord.id, reason);
    if (res?.error) {
      setResult({ type: "error", message: res.error });
    } else {
      setResult({ type: "success", message: `${landlord.full_name ?? "Landlord"} has been rejected.` });
    }
    setLoading(null);
  }

  const isDone = result?.type === "success";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Landlord Verification
          </DialogTitle>
        </DialogHeader>

        {isDone ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-medium text-slate-800">{result?.message}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Landlord info */}
            <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{landlord.full_name ?? "—"}</p>
                <p className="text-xs text-slate-500">{landlord.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Joined {new Date(landlord.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize text-xs">
                {landlord.verification_status}
              </Badge>
            </div>

            {/* Documents */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-slate-600">Government ID</p>
                <DocumentPreview url={landlord.id_document_url} label="Government ID" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-slate-600">Property Deed / Title</p>
                <DocumentPreview url={landlord.deed_document_url} label="Property Deed" />
              </div>
            </div>

            {/* Error */}
            {result?.type === "error" && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {result.message}
              </div>
            )}

            {/* Rejection reason input */}
            {view === "reject" && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-slate-700">Rejection Reason</p>
                <Textarea
                  placeholder="Explain why the documents were rejected (this will be sent to the landlord)…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-sm resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        {!isDone && (
          <DialogFooter>
            {view === "main" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("reject")}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerify}
                  disabled={loading !== null}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {loading === "verify" ? "Verifying…" : "Verify Landlord"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("main")}
                  disabled={loading !== null}
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={loading !== null || !reason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {loading === "reject" ? "Rejecting…" : "Send Rejection"}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
