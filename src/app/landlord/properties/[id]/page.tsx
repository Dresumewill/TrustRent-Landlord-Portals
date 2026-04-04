import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { cn, fmtCurrency } from "@/lib/utils";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { EditPropertyForm } from "./EditPropertyForm";
import { DeletePropertyButton } from "./DeletePropertyButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("*, images")
    .eq("id", id)
    .eq("landlord_id", user?.id ?? "")
    .single();

  if (!property) notFound();

  const { count: applicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id);

  const { count: pendingCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id)
    .eq("status", "submitted");

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <Link
        href="/landlord/properties"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 mb-6 -ml-2")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Properties
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <VerifiedBadge isVerified={property.is_verified} variant="icon" />
          </div>
          <p className="text-muted-foreground mt-0.5">{property.city}, {property.state}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-emerald-700">
            {fmtCurrency(Number(property.rent_amount), property.currency)}/mo
          </p>
          <Badge variant={property.status === "active" ? "default" : "secondary"} className="capitalize mt-1">
            {property.status}
          </Badge>
        </div>
      </div>

      {/* Application stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Applications</p>
              <p className="font-bold text-lg">{applicationCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
              <p className="font-bold text-lg">{pendingCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingCount && pendingCount > 0 ? (
        <div className="mb-6">
          <Link
            href="/landlord/applications"
            className={cn(buttonVariants({ size: "sm" }), "bg-emerald-600 hover:bg-emerald-700 text-white gap-2")}
          >
            <Users className="h-3.5 w-3.5" /> Review {pendingCount} Pending Application{pendingCount > 1 ? "s" : ""}
          </Link>
        </div>
      ) : null}

      {/* Danger zone */}
      <div className="mb-6 flex justify-end">
        <DeletePropertyButton propertyId={property.id} />
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPropertyForm property={property} />
        </CardContent>
      </Card>
    </div>
  );
}
