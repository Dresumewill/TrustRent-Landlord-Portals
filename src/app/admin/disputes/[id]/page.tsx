import { createAdminClient } from "@/lib/supabase/admin-client";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Camera, Wallet, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisputeActions } from "@/components/admin/DisputeActions";

interface Props {
  params: Promise<{ id: string }>;
}

interface DisputeEvidence {
  messages?: { from: "tenant" | "landlord"; text: string; timestamp: string }[];
  move_in_photos?: string[];
  move_out_photos?: string[];
}

export default async function DisputeMediationPage({ params }: Props) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: tx } = await db
    .from("transactions")
    .select(`
      id, amount, status, created_at, admin_notes, dispute_evidence,
      properties(title, city, state, address_line1),
      payer:payer_id(id, full_name, email),
      payee:payee_id(id, full_name, email)
    `)
    .eq("id", id)
    .single();

  if (!tx) notFound();

  const property  = tx.properties as unknown as { title: string; city: string; state: string; address_line1: string } | null;
  const tenant    = tx.payer    as unknown as { id: string; full_name: string; email: string } | null;
  const landlord  = tx.payee   as unknown as { id: string; full_name: string; email: string } | null;

  const evidence  = (tx.dispute_evidence ?? {}) as DisputeEvidence;
  const messages  = evidence.messages  ?? [];
  const moveIn    = evidence.move_in_photos  ?? [];
  const moveOut   = evidence.move_out_photos ?? [];

  const isActive  = tx.status === "disputed";

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/disputes"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 gap-2 -ml-2 text-slate-500")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Disputes
      </Link>

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5 shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispute Mediation</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {property?.title} · {property?.city}, {property?.state}
            </p>
          </div>
        </div>
        <Badge
          variant={isActive ? "destructive" : "default"}
          className="capitalize text-xs mt-1"
        >
          {tx.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — evidence */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Dispute summary */}
          <Card className="shadow-none border-red-200">
            <CardContent className="pt-5 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Tenant</p>
                <p className="font-semibold text-slate-900">{tenant?.full_name ?? "—"}</p>
                <p className="text-xs text-slate-400">{tenant?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Landlord</p>
                <p className="font-semibold text-slate-900">{landlord?.full_name ?? "—"}</p>
                <p className="text-xs text-slate-400">{landlord?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Frozen Escrow</p>
                <p className="font-bold text-red-700 text-lg">₦{Number(tx.amount).toLocaleString()}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Opened {new Date(tx.created_at).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Chat logs */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Chat Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                  <MessageSquare className="h-7 w-7 text-slate-200" />
                  <p className="text-xs">No chat logs submitted as evidence.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        msg.from === "tenant" ? "self-start" : "self-end items-end"
                      }`}
                    >
                      <div
                        className={`rounded-xl px-4 py-2.5 text-sm ${
                          msg.from === "tenant"
                            ? "bg-slate-100 text-slate-800"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className="text-xs text-slate-400 px-1">
                        {msg.from === "tenant" ? tenant?.full_name : landlord?.full_name} ·{" "}
                        {new Date(msg.timestamp).toLocaleString("en-GB", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Move-in / Move-out photos */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-400" />
                Move-In vs. Move-Out Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moveIn.length === 0 && moveOut.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                  <Camera className="h-7 w-7 text-slate-200" />
                  <p className="text-xs">No photos submitted as evidence.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Move-In</p>
                    {moveIn.length === 0 ? (
                      <p className="text-xs text-slate-400">No photos</p>
                    ) : (
                      <div className="grid gap-2">
                        {moveIn.map((url, i) => (
                          <img key={i} src={url} alt={`Move-in ${i + 1}`} className="rounded-lg w-full h-32 object-cover border border-slate-200" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Move-Out</p>
                    {moveOut.length === 0 ? (
                      <p className="text-xs text-slate-400">No photos</p>
                    ) : (
                      <div className="grid gap-2">
                        {moveOut.map((url, i) => (
                          <img key={i} src={url} alt={`Move-out ${i + 1}`} className="rounded-lg w-full h-32 object-cover border border-slate-200" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — action panel */}
        <div className="flex flex-col gap-4">
          {isActive ? (
            <DisputeActions
              transactionId={tx.id}
              amount={Number(tx.amount)}
              tenantName={tenant?.full_name ?? "Tenant"}
              landlordName={landlord?.full_name ?? "Landlord"}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-semibold text-slate-700">Dispute Resolved</p>
              <p className="text-xs text-slate-500">
                {tx.status === "resolved"
                  ? `Funds were released to ${landlord?.full_name ?? "the landlord"}.`
                  : `Funds were refunded to ${tenant?.full_name ?? "the tenant"}.`}
              </p>
              {tx.admin_notes && (
                <p className="text-xs text-slate-400 italic border-t border-slate-200 pt-3 mt-1">
                  &ldquo;{tx.admin_notes}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
