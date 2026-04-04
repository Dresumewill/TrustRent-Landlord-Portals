import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, CalendarDays, CreditCard, Users, Briefcase, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { cn, fmtCurrency, fmtDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  submitted: { label: "Under Review",  variant: "secondary" },
  approved:  { label: "Approved",      variant: "default" },
  rejected:  { label: "Declined",      variant: "destructive" },
};

export default async function TenantApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: application } = await supabase
    .from("applications")
    .select(`
      *,
      properties(
        id, title, city, state, address_line1,
        rent_amount, deposit_amount, currency,
        bedrooms, bathrooms, property_type, is_furnished,
        landlord_id,
        users(full_name, verification_status)
      )
    `)
    .eq("id", id)
    .eq("tenant_id", user?.id ?? "")
    .single();

  if (!application) notFound();

  const property = application.properties as {
    id: string; title: string; city: string; state: string; address_line1: string;
    rent_amount: number; deposit_amount: number; currency: string;
    bedrooms: number; bathrooms: number; property_type: string; is_furnished: boolean;
    landlord_id: string;
    users: { full_name: string | null; verification_status: string } | null;
  } | null;

  const depositAmount = Number(property?.deposit_amount) > 0
    ? Number(property?.deposit_amount)
    : Number(property?.rent_amount);

  const statusCfg = STATUS_CONFIG[application.status] ?? STATUS_CONFIG.submitted;

  // Check if deposit already paid
  const { data: escrowTx } = await supabase
    .from("transactions")
    .select("id, status, amount, currency")
    .eq("application_id", id)
    .eq("payer_id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <Link
        href="/tenant/applications"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 mb-6 -ml-2")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{property?.title ?? "Property"}</h1>
          <p className="text-muted-foreground mt-0.5">{property?.city}, {property?.state}</p>
        </div>
        <Badge variant={statusCfg.variant} className="capitalize shrink-0 mt-1">
          {statusCfg.label}
        </Badge>
      </div>

      {/* Rejection reason */}
      {application.status === "rejected" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">Application Declined</p>
          {application.rejection_reason ? (
            <p className="text-sm text-red-600 mt-1">{application.rejection_reason}</p>
          ) : (
            <p className="text-sm text-red-500 mt-1">The landlord did not provide a reason.</p>
          )}
        </div>
      )}

      {/* Approval + deposit CTA */}
      {application.status === "approved" && !escrowTx && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Your application was approved!</p>
            <p className="text-sm text-emerald-700">Pay your deposit to secure the property.</p>
          </div>
          <Link
            href={`/tenant/payments/deposit/${id}`}
            className={cn(buttonVariants({ size: "sm" }), "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shrink-0")}
          >
            <CreditCard className="h-3.5 w-3.5" /> Pay Deposit
          </Link>
        </div>
      )}

      {application.status === "approved" && escrowTx && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ Deposit paid — {fmtCurrency(Number(escrowTx.amount), escrowTx.currency)} held in escrow
          </p>
          <p className="text-sm text-emerald-700 mt-0.5">
            Status: <span className="capitalize font-medium">{escrowTx.status.replace(/_/g, " ")}</span>
            {" · "}
            <Link href="/tenant/payments" className="underline">View in Payments</Link>
          </p>
        </div>
      )}

      {/* Property details */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Property
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Monthly Rent</p>
            <p className="font-semibold text-emerald-700">{fmtCurrency(Number(property?.rent_amount), property?.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Deposit</p>
            <p className="font-medium">{fmtCurrency(depositAmount, property?.currency)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{property?.property_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bedrooms</p>
            <p className="font-medium">{property?.bedrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bathrooms</p>
            <p className="font-medium">{property?.bathrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Furnished</p>
            <p className="font-medium">{property?.is_furnished ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Your application details */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Your Application
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Desired Move-In</p>
            <p className="font-medium flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              {application.move_in_date ?? "Flexible"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Occupants</p>
            <p className="font-medium">{application.num_occupants}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Employment</p>
            <p className="font-medium capitalize flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              {(application.employment_status ?? "Not stated").replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly Income</p>
            <p className="font-medium">
              {application.monthly_income
                ? fmtCurrency(Number(application.monthly_income), property?.currency)
                : "Not stated"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">{fmtDate(application.created_at)}</p>
          </div>
          {application.reviewed_at && (
            <div>
              <p className="text-muted-foreground">Reviewed</p>
              <p className="font-medium">{fmtDate(application.reviewed_at)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message to landlord */}
      {application.message && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Your Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{application.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
