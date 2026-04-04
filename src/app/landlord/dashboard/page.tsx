import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Wallet, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { fmtCurrency } from "@/lib/utils";

export default async function LandlordDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: propertyCount },
    { count: pendingApplicationCount },
    { data: recentApplications },
    { data: profile },
    { data: escrowTxs },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("landlord_id", user?.id ?? ""),

    supabase
      .from("applications")
      .select("id, properties!inner(landlord_id)", { count: "exact", head: true })
      .eq("properties.landlord_id", user?.id ?? "")
      .eq("status", "submitted"),

    supabase
      .from("applications")
      .select("id, status, created_at, properties!inner(title, landlord_id), users(full_name)")
      .eq("properties.landlord_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("users")
      .select("verification_status")
      .eq("id", user?.id ?? "")
      .single(),

    supabase
      .from("transactions")
      .select("amount, currency, property_id, properties!inner(landlord_id)")
      .eq("properties.landlord_id", user?.id ?? "")
      .eq("status", "held_in_escrow"),
  ]);

  // Group escrow balance by currency
  const escrowByCurrency: Record<string, number> = {};
  (escrowTxs ?? []).forEach((t) => {
    escrowByCurrency[t.currency] = (escrowByCurrency[t.currency] ?? 0) + Number(t.amount);
  });
  const escrowDisplay = Object.entries(escrowByCurrency)
    .map(([code, amt]) => fmtCurrency(amt, code))
    .join(" + ") || "—";

  const verificationStatus = profile?.verification_status ?? "unverified";
  const verificationColor =
    verificationStatus === "verified"  ? "text-emerald-600" :
    verificationStatus === "pending"   ? "text-amber-600"   : "text-slate-500";

  const stats = [
    {
      icon: Building2,
      label: "Total Properties",
      value: propertyCount ?? 0,
      color: "text-emerald-600",
    },
    {
      icon: Users,
      label: "Pending Applications",
      value: pendingApplicationCount ?? 0,
      color: "text-blue-600",
    },
    {
      icon: Wallet,
      label: "Escrow Balance",
      value: escrowDisplay,
      color: "text-violet-600",
    },
    {
      icon: ShieldCheck,
      label: "Verification Status",
      value: verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1),
      color: verificationColor,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your properties, applications, and payments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Applications</CardTitle>
          <Link href="/landlord/applications" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {!recentApplications || recentApplications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No applications yet.{" "}
              <Link href="/landlord/properties/new" className="text-emerald-600 hover:underline">
                Add a property
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {recentApplications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {(Array.isArray(app.users)
                        ? app.users[0]
                        : app.users as { full_name: string } | null
                      )?.full_name ?? "Tenant"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(Array.isArray(app.properties)
                        ? app.properties[0]
                        : app.properties as { title: string } | null
                      )?.title ?? "Property"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      app.status === "approved" ? "default" :
                      app.status === "rejected" ? "destructive" : "secondary"
                    }
                    className="capitalize"
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
