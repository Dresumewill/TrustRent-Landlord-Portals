import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn, fmtCurrency } from "@/lib/utils";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("landlord_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your rental listings.</p>
        </div>
        <Link
          href="/landlord/properties/new"
          className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white gap-2")}
        >
          <Plus className="h-4 w-4" /> Add Property
        </Link>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground">You haven&apos;t listed any properties yet.</p>
            <Link
              href="/landlord/properties/new"
              className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white gap-2")}
            >
              <Plus className="h-4 w-4" /> Add Your First Property
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                  </div>
                  <VerifiedBadge isVerified={property.is_verified} variant="icon" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700">
                    {fmtCurrency(Number(property.rent_amount), property.currency)}/mo
                  </span>
                  <Badge variant={property.status === "active" ? "default" : "secondary"} className="capitalize">
                    {property.status}
                  </Badge>
                </div>

                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{property.bedrooms} bed</span>
                  <span>·</span>
                  <span>{property.bathrooms} bath</span>
                  {property.is_furnished && <><span>·</span><span>Furnished</span></>}
                </div>

                <Link
                  href={`/landlord/properties/${property.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View Details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
