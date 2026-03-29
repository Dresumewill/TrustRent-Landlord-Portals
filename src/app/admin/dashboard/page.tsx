import { createAdminClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  BadgeCheck,
  ShieldOff,
  Wallet,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { fmtAmount } from "@/lib/utils";

export default async function AdminDashboardPage() {
  // Auth guard (middleware also guards, but belt-and-suspenders for RSC)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();

  // ── Landlord verification counts ──
  const { data: landlords } = await db
    .from("users")
    .select("verification_status")
    .eq("role", "landlord");

  const totalLandlords  = landlords?.length ?? 0;
  const verified        = landlords?.filter((u) => u.verification_status === "verified").length ?? 0;
  const unverified      = landlords?.filter((u) => u.verification_status !== "verified").length ?? 0;
  const pendingQueue    = landlords?.filter((u) => u.verification_status === "pending").length ?? 0;

  // ── Escrow totals ──
  const { data: escrowTxs } = await db
    .from("transactions")
    .select("amount")
    .eq("status", "held_in_escrow");

  const totalEscrow = (escrowTxs ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

  // ── Dispute rate ──
  const { count: totalTxCount } = await db
    .from("transactions")
    .select("id", { count: "exact", head: true });

  const { count: disputedCount } = await db
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("status", "disputed");

  const disputeRate =
    totalTxCount && totalTxCount > 0
      ? ((disputedCount ?? 0) / totalTxCount) * 100
      : 0;

  const stats = [
    {
      label: "Verified Landlords",
      value: verified,
      sub: `${unverified} unverified · ${pendingQueue} pending`,
      icon: BadgeCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Unverified Landlords",
      value: unverified,
      sub: `Out of ${totalLandlords} total landlords`,
      icon: ShieldOff,
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
    {
      label: "Funds in Escrow",
      value: `₦${fmtAmount(totalEscrow)}`,
      sub: `${escrowTxs?.length ?? 0} active deposits`,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Dispute Rate",
      value: `${disputeRate.toFixed(1)}%`,
      sub: `${disputedCount ?? 0} active dispute${(disputedCount ?? 0) !== 1 ? "s" : ""} · ${totalTxCount ?? 0} total`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-slate-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Trust Meter — live platform health at a glance.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <Card key={label} className={`border ${border} shadow-none`}>
            <CardContent className="pt-5 pb-5">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}>
                <Icon className={`h-4.5 w-4.5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
              <p className="text-xs font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary info strip */}
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Verification Breakdown</h2>
          <div className="flex gap-6 text-sm">
            {[
              { label: "Verified",   count: verified,   color: "bg-emerald-500" },
              { label: "Pending",    count: pendingQueue, color: "bg-amber-400" },
              { label: "Unverified", count: landlords?.filter((u) => u.verification_status === "unverified").length ?? 0, color: "bg-slate-300" },
              { label: "Rejected",   count: landlords?.filter((u) => u.verification_status === "rejected").length ?? 0, color: "bg-red-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          {totalLandlords > 0 && (
            <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${(verified / totalLandlords) * 100}%` }} />
              <div className="bg-amber-400 h-full" style={{ width: `${(pendingQueue / totalLandlords) * 100}%` }} />
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Dispute Health</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {disputeRate < 5
                ? "Healthy — dispute rate below 5%"
                : disputeRate < 15
                ? "Moderate — monitor dispute trends"
                : "High — immediate attention required"}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              disputeRate < 5
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : disputeRate < 15
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {disputeRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
