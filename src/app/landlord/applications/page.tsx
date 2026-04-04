import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default async function LandlordApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      properties(title, city, state, landlord_id),
      users(full_name, email, trust_score, verification_status)
    `)
    .order("created_at", { ascending: false });

  const myApplications = applications?.filter(
    (a) => (a.properties as { landlord_id: string } | null)?.landlord_id === user?.id
  );

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Applications</h1>
        <p className="text-muted-foreground mt-1">Review tenant applications for your properties.</p>
      </div>

      {!myApplications || myApplications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No applications received yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {myApplications.map((app) => {
            const tenant = app.users as { full_name: string; email: string; trust_score: number; verification_status: string } | null;
            const property = app.properties as { title: string; city: string; state: string } | null;

            return (
              <Card key={app.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{tenant?.full_name ?? "Tenant"}</CardTitle>
                      <VerifiedBadge
                        isVerified={tenant?.verification_status === "verified"}
                        variant="icon"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{tenant?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/landlord/applications/${app.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs")}
                    >
                      <ExternalLink className="h-3 w-3" /> View Passport
                    </Link>
                    <Badge variant={
                      app.status === "approved" ? "default" :
                      app.status === "rejected" ? "destructive" : "secondary"
                    } className="capitalize">
                      {app.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Property</p>
                      <p className="font-medium">{property?.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{property?.city}, {property?.state}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Trust Score</p>
                      <p className="font-medium">{tenant?.trust_score ?? 0}/5</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Move-In Date</p>
                      <p className="font-medium">{app.move_in_date ?? "Flexible"}</p>
                    </div>
                  </div>

                  {app.message && (
                    <p className="text-sm text-muted-foreground italic border-l-2 border-emerald-200 pl-3">
                      {app.message}
                    </p>
                  )}

                  {app.status === "submitted" && (
                    <div className="flex gap-2 pt-1">
                      <form action={`/api/applications/${app.id}/approve`} method="post">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Approve
                        </Button>
                      </form>
                      <form action={`/api/applications/${app.id}/reject`} method="post">
                        <Button size="sm" variant="outline">
                          Decline
                        </Button>
                      </form>
                    </div>
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
