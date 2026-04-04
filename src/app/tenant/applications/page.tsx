import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn, fmtCurrency, fmtDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";

export default async function TenantApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, properties(title, city, state, rent_amount, deposit_amount, currency, landlord_id)")
    .eq("tenant_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  // Fetch existing escrow transactions for this tenant to know which apps already paid
  const { data: escrowTxs } = await supabase
    .from("transactions")
    .select("application_id")
    .eq("payer_id", user?.id ?? "")
    .in("status", ["held_in_escrow", "completed", "disputed"]);

  const paidApplicationIds = new Set((escrowTxs ?? []).map((t) => t.application_id));

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">Track the status of all your rental applications.</p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            You haven&apos;t applied to any properties yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {applications.map((app) => {
            const property = app.properties as {
              title: string; city: string; state: string;
              rent_amount: number; deposit_amount: number; currency: string;
            } | null;

            const depositAmount = Number(property?.deposit_amount) > 0
              ? Number(property?.deposit_amount)
              : Number(property?.rent_amount);

            const alreadyPaid = paidApplicationIds.has(app.id);

            return (
              <Card key={app.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{property?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{property?.city}, {property?.state}</p>
                  </div>
                  <Badge variant={
                    app.status === "approved" ? "default" :
                    app.status === "rejected" ? "destructive" : "secondary"
                  } className="capitalize">
                    {app.status.replace("_", " ")}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Monthly Rent</p>
                      <p className="font-medium">{fmtCurrency(Number(property?.rent_amount), property?.currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deposit</p>
                      <p className="font-medium">{fmtCurrency(depositAmount, property?.currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Move-In Date</p>
                      <p className="font-medium">{app.move_in_date ?? "Flexible"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applied On</p>
                      <p className="font-medium">{fmtDate(app.created_at)}</p>
                    </div>
                  </div>

                  {app.status === "approved" && !alreadyPaid && (
                    <Link
                      href={`/tenant/payments/deposit/${app.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 self-start"
                      )}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Pay Deposit into Escrow
                    </Link>
                  )}

                  {app.status === "approved" && alreadyPaid && (
                    <p className="text-xs text-emerald-700 font-medium">
                      ✓ Deposit paid · <Link href="/tenant/payments" className="underline">View in Payments</Link>
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
