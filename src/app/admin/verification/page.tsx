import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Clock, FileX } from "lucide-react";
import { VerificationModal } from "@/components/admin/VerificationModal";
import { fmtDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  pending:    "secondary",
  verified:   "default",
  rejected:   "destructive",
  unverified: "secondary",
};

async function getSignedUrls(db: ReturnType<typeof createAdminClient>, landlord: {
  id_document_url: string | null;
  deed_document_url: string | null;
}) {
  const EXPIRY = 60 * 60; // 1 hour

  const [idResult, deedResult] = await Promise.all([
    landlord.id_document_url
      ? db.storage.from("landlord-documents").createSignedUrl(landlord.id_document_url, EXPIRY)
      : Promise.resolve({ data: null }),
    landlord.deed_document_url
      ? db.storage.from("landlord-documents").createSignedUrl(landlord.deed_document_url, EXPIRY)
      : Promise.resolve({ data: null }),
  ]);

  return {
    id_document:   idResult.data?.signedUrl   ?? null,
    deed_document: deedResult.data?.signedUrl ?? null,
  };
}

export default async function VerificationQueuePage() {
  const db = createAdminClient();

  const { data: landlords } = await db
    .from("users")
    .select("id, full_name, email, created_at, verification_status, id_document_url, deed_document_url")
    .eq("role", "landlord")
    .order("created_at", { ascending: false });

  const pending = landlords?.filter((l) => l.verification_status === "pending") ?? [];
  const others  = landlords?.filter((l) => l.verification_status !== "pending") ?? [];

  // Generate signed URLs for all pending landlords (1-hour expiry)
  const pendingWithUrls = await Promise.all(
    pending.map(async (landlord) => ({
      landlord,
      signedUrls: await getSignedUrls(db, landlord),
    }))
  );

  const docStatus = (l: typeof pending[number]) => {
    const hasId   = !!l.id_document_url;
    const hasDeed = !!l.deed_document_url;
    if (hasId && hasDeed) return { label: "Both uploaded", color: "text-emerald-600" };
    if (hasId || hasDeed) return { label: "Partial",       color: "text-amber-600" };
    return                       { label: "None uploaded",  color: "text-slate-400" };
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-3">
        <BadgeCheck className="h-6 w-6 text-slate-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and approve landlord identity documents.</p>
        </div>
      </div>

      {/* Pending queue */}
      <Card className="mb-6 shadow-none border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Review
            <span className="ml-auto text-xs font-normal bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-slate-400">
              <BadgeCheck className="h-8 w-8 text-emerald-300" />
              <p className="text-sm font-medium">All caught up — no pending submissions.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="pl-6 text-xs text-slate-500 font-semibold uppercase tracking-wide">Name</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Email</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Date Joined</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Documents</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Status</TableHead>
                  <TableHead className="pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingWithUrls.map(({ landlord, signedUrls }) => {
                  const docs = docStatus(landlord);
                  return (
                    <TableRow key={landlord.id} className="hover:bg-slate-50/80">
                      <TableCell className="pl-6 font-medium text-slate-900">{landlord.full_name ?? "—"}</TableCell>
                      <TableCell className="text-slate-600 text-sm">{landlord.email}</TableCell>
                      <TableCell className="text-slate-500 text-sm">{fmtDate(landlord.created_at)}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${docs.color}`}>{docs.label}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[landlord.verification_status]} className="capitalize text-xs">
                          {landlord.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <VerificationModal
                          landlord={landlord}
                          signedUrls={signedUrls}
                          trigger={
                            <span className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer">
                              Review →
                            </span>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All other landlords */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileX className="h-4 w-4 text-slate-400" />
            All Landlords
            <span className="ml-auto text-xs font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {others.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {others.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No other landlords.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="pl-6 text-xs text-slate-500 font-semibold uppercase tracking-wide">Name</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Email</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Date Joined</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Documents</TableHead>
                  <TableHead className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Status</TableHead>
                  <TableHead className="pr-6" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {others.map((landlord) => {
                  const docs = docStatus(landlord);
                  return (
                    <TableRow key={landlord.id} className="hover:bg-slate-50/80">
                      <TableCell className="pl-6 font-medium text-slate-900">{landlord.full_name ?? "—"}</TableCell>
                      <TableCell className="text-slate-600 text-sm">{landlord.email}</TableCell>
                      <TableCell className="text-slate-500 text-sm">{fmtDate(landlord.created_at)}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${docs.color}`}>{docs.label}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[landlord.verification_status]} className="capitalize text-xs">
                          {landlord.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {landlord.verification_status !== "verified" && (
                          <VerificationModal
                            landlord={landlord}
                            trigger={
                              <span className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer">
                                Review →
                              </span>
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
