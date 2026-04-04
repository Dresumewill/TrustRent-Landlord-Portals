import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { fmtCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  ShieldCheck,
  CalendarDays,
  Users,
  FileText,
  StickyNote,
} from "lucide-react";
import { LandlordNoteForm } from "./LandlordNoteForm";

interface Props {
  params: Promise<{ id: string }>;
}

const VERIFICATION_CONFIG: Record<string, { label: string; color: string }> = {
  unverified: { label: "Unverified",   color: "text-slate-400" },
  pending:    { label: "Under Review", color: "text-amber-600" },
  verified:   { label: "Verified",     color: "text-emerald-600" },
  rejected:   { label: "Rejected",     color: "text-red-500" },
};

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const colour = score >= 4 ? "#10b981" : score >= 2.5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-20 h-20">
      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.9" fill="none"
          stroke={colour}
          strokeWidth="3"
          strokeDasharray={`${pct} 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black leading-none">{score.toFixed(1)}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/ 5</span>
      </div>
    </div>
  );
}

export default async function TenantPassportPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch application + tenant profile + property
  const { data: application } = await supabase
    .from("applications")
    .select(`
      *,
      properties(id, title, city, state, rent_amount, currency, landlord_id),
      users(
        id, full_name, email, phone, avatar_url,
        role, verification_status, trust_score,
        bio, city, state, country, created_at
      )
    `)
    .eq("id", id)
    .single();

  if (!application) notFound();

  // Security: only the landlord who owns the property can view this
  const property = application.properties as {
    id: string; title: string; city: string; state: string;
    rent_amount: number; currency: string; landlord_id: string;
  } | null;

  if (property?.landlord_id !== user?.id) notFound();

  const tenant = application.users as {
    id: string; full_name: string; email: string; phone: string | null;
    avatar_url: string | null; verification_status: string;
    trust_score: number; bio: string | null;
    city: string | null; state: string | null; country: string;
    created_at: string;
  } | null;

  const verConfig = VERIFICATION_CONFIG[tenant?.verification_status ?? "unverified"];
  const isVerified = tenant?.verification_status === "verified";
  const initials = tenant?.full_name
    ? tenant.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  // Count how many other verified tenancies this tenant has completed
  const { count: completedTenancies } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant?.id ?? "")
    .eq("status", "approved");

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/landlord/applications"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 mb-6 -ml-2")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tenant Passport</h1>
        <Badge
          variant={
            application.status === "approved" ? "default" :
            application.status === "rejected" ? "destructive" : "secondary"
          }
          className="capitalize"
        >
          Application: {application.status.replace("_", " ")}
        </Badge>
      </div>

      {/* ── Identity Card ───────────────────────────────────────── */}
      <Card className={cn(
        "mb-4 border-2",
        isVerified ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white" : "border-border"
      )}>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{tenant?.full_name ?? "Unknown Tenant"}</h2>
                {isVerified && <VerifiedBadge isVerified={true} variant="pill" />}
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {tenant?.email}
                </span>
                {tenant?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> {tenant.phone}
                  </span>
                )}
                {(tenant?.city || tenant?.state) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {[tenant.city, tenant.state].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Member since {new Date(tenant?.created_at ?? "").getFullYear()}
                </span>
              </div>

              {tenant?.bio && (
                <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-emerald-200 pl-3">
                  {tenant.bio}
                </p>
              )}
            </div>

            {/* Score ring */}
            <ScoreRing score={tenant?.trust_score ?? 0} />
          </div>
        </CardContent>
      </Card>

      {/* ── Trust Metrics ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <ShieldCheck className={cn("h-5 w-5", verConfig.color)} />
            <p className="text-xs text-muted-foreground">ID Status</p>
            <p className={cn("text-sm font-semibold", verConfig.color)}>{verConfig.label}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <Star className="h-5 w-5 text-amber-500" />
            <p className="text-xs text-muted-foreground">Trust Score</p>
            <p className="text-sm font-semibold">{tenant?.trust_score?.toFixed(1) ?? "0.0"} / 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <Users className="h-5 w-5 text-blue-500" />
            <p className="text-xs text-muted-foreground">Past Tenancies</p>
            <p className="text-sm font-semibold">{completedTenancies ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <User className="h-5 w-5 text-violet-500" />
            <p className="text-xs text-muted-foreground">Account Type</p>
            <p className="text-sm font-semibold capitalize">{tenant?.verification_status === "verified" ? "Verified" : "Standard"}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Application Details ─────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Property Applied For</p>
            <p className="font-medium">{property?.title}</p>
            <p className="text-xs text-muted-foreground">{property?.city}, {property?.state}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly Rent</p>
            <p className="font-medium">{fmtCurrency(Number(property?.rent_amount), property?.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Desired Move-In</p>
            <p className="font-medium">{application.move_in_date ?? "Flexible"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Occupants</p>
            <p className="font-medium">{application.num_occupants}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Employment</p>
            <p className="font-medium capitalize">{application.employment_status ?? "Not stated"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly Income</p>
            <p className="font-medium">
              {application.monthly_income
                ? fmtCurrency(Number(application.monthly_income), property?.currency)
                : "Not stated"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Application message */}
      {application.message && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Message from Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{application.message}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Landlord actions ────────────────────────────────────── */}
      {application.status === "submitted" && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm font-medium mb-3">Your Decision</p>
            <div className="flex gap-3">
              <form action={`/api/applications/${id}/approve`} method="post">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <ShieldCheck className="h-4 w-4" /> Approve Application
                </Button>
              </form>
              <form action={`/api/applications/${id}/reject`} method="post">
                <Button variant="outline">Decline</Button>
              </form>
            </div>
            {!isVerified && (
              <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
                ⚠ This tenant has not completed identity verification.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Landlord private note ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            Private Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LandlordNoteForm
            applicationId={id}
            initialNote={application.landlord_note ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
