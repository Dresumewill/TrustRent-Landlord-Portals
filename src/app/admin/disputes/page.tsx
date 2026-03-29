import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn, fmtCurrency, fmtDate } from "@/lib/utils";

export default async function DisputesPage() {
  const db = createAdminClient();

  const { data: disputes } = await db
    .from("transactions")
    .select(`
      id, amount, currency, status, created_at, admin_resolved_at,
      properties(title, city, state),
      payer:payer_id(full_name, email),
      payee:payee_id(full_name, email)
    `)
    .in("status", ["disputed", "resolved", "refunded"])
    .order("created_at", { ascending: false });

  const active   = disputes?.filter((d) => d.status === "disputed") ?? [];
  const resolved = disputes?.filter((d) => d.status !== "disputed") ?? [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispute Resolution Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Mediate escrow disputes and release or refund frozen funds.
          </p>
        </div>
      </div>

      {/* Active disputes */}
      <Card className="mb-6 shadow-none border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Active Disputes
            <span className="ml-auto text-xs font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {active.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {active.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-400">
              <AlertTriangle className="h-8 w-8 text-slate-200" />
              <p className="text-sm font-medium">No active disputes — all clear.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-red-50/60">
                  <TableHead className="pl-6 text-xs text-slate-500 font-semibold uppercase tracking-wide">Property</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Tenant</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Landlord</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Escrow Amount</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Opened</TableHead>
                  <TableHead className="pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((dispute) => {
                  const property = dispute.properties as unknown as { title: string; city: string; state: string } | null;
                  const tenant   = dispute.payer as unknown as { full_name: string; email: string } | null;
                  const landlord = dispute.payee as unknown as { full_name: string; email: string } | null;

                  return (
                    <TableRow key={dispute.id} className="hover:bg-red-50/40">
                      <TableCell className="pl-6">
                        <p className="font-medium text-slate-900 text-sm">{property?.title ?? "—"}</p>
                        <p className="text-xs text-slate-400">{property?.city}, {property?.state}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-800">{tenant?.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{tenant?.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-800">{landlord?.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{landlord?.email}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-red-700">{fmtCurrency(Number(dispute.amount), dispute.currency)}</span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {fmtDate(dispute.created_at)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Link
                          href={`/admin/disputes/${dispute.id}`}
                          className={cn(
                            buttonVariants({ size: "sm", variant: "outline" }),
                            "gap-1.5 text-xs border-red-200 text-red-700 hover:bg-red-50"
                          )}
                        >
                          Mediate →
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolved disputes */}
      {resolved.length > 0 && (
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Resolved
              <span className="ml-auto text-xs font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {resolved.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="pl-6 text-xs text-slate-500 font-semibold uppercase tracking-wide">Property</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Tenant</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Landlord</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Amount</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Outcome</TableHead>
                  <TableHead className="pr-6 text-xs text-slate-500 font-semibold uppercase tracking-wide">Resolved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolved.map((dispute) => {
                  const property = dispute.properties as unknown as { title: string } | null;
                  const tenant   = dispute.payer as unknown as { full_name: string } | null;
                  const landlord = dispute.payee as unknown as { full_name: string } | null;

                  return (
                    <TableRow key={dispute.id} className="hover:bg-slate-50/80 opacity-70">
                      <TableCell className="pl-6 text-sm text-slate-700">{property?.title ?? "—"}</TableCell>
                      <TableCell className="text-sm text-slate-600">{tenant?.full_name ?? "—"}</TableCell>
                      <TableCell className="text-sm text-slate-600">{landlord?.full_name ?? "—"}</TableCell>
                      <TableCell className="text-sm text-slate-700 font-medium">
                        {fmtCurrency(Number(dispute.amount), dispute.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={dispute.status === "resolved" ? "default" : "secondary"}
                          className="capitalize text-xs"
                        >
                          {dispute.status === "resolved" ? "Released to landlord" : "Refunded to tenant"}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-slate-400 text-sm">
                        {dispute.admin_resolved_at ? fmtDate(dispute.admin_resolved_at) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
