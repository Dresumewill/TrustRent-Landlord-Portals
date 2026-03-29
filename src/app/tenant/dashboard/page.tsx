import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { Search, FileText, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn, fmtAmount } from "@/lib/utils";

export default async function TenantDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase.from("users").select("full_name, trust_score, verification_status").eq("id", user?.id ?? "").single(),
    supabase
      .from("applications")
      .select("id, status, created_at, properties(title, city, state, rent_amount)")
      .eq("tenant_id", user?.id ?? "")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "Tenant"}
          </h1>
          <p className="text-muted-foreground mt-1">Find your next verified home.</p>
        </div>
        <Link
          href="/tenant/search"
          className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white gap-2")}
        >
          <Search className="h-4 w-4" /> Find a Home
        </Link>
      </div>

      {/* Trust profile cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trust Score</p>
              <p className="text-xl font-bold">{profile?.trust_score ?? 0}/5</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-xl font-bold">{applications?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verification</p>
              <p className="text-base font-semibold capitalize">{profile?.verification_status ?? "Unverified"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Applications</CardTitle>
          <Link href="/tenant/applications" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {!applications || applications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No applications yet.{" "}
              <Link href="/tenant/search" className="text-emerald-600 hover:underline">Browse listings</Link> to apply.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {applications.map((app) => {
                type PropShape = { title: string; city: string; state: string; rent_amount: number };
                const property = (Array.isArray(app.properties)
                  ? app.properties[0]
                  : app.properties) as PropShape | null;
                return (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{property?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {property?.city}, {property?.state} · ₦{fmtAmount(Number(property?.rent_amount))}/mo
                      </p>
                    </div>
                    <Badge variant={app.status === "approved" ? "default" : "secondary"} className="capitalize">
                      {app.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
