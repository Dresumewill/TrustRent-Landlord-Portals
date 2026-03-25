import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchParams {
  city?: string;
  max_price?: string;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.max_price) {
    query = query.lte("rent_amount", Number(params.max_price));
  }

  const { data: properties } = await query;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Find a Home</h1>
        <p className="text-muted-foreground mt-1">Browse verified listings from trusted landlords.</p>
      </div>

      {/* Search filters */}
      <form method="get" className="flex gap-3 mb-8 flex-wrap">
        <Input name="city" placeholder="City (e.g. Lagos)" defaultValue={params.city} className="w-48" />
        <Input name="max_price" type="number" placeholder="Max rent (₦)" defaultValue={params.max_price} className="w-44" />
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Search</Button>
        {(params.city || params.max_price) && (
          <Link href="/tenant/search" className={buttonVariants({ variant: "outline" })}>Clear</Link>
        )}
      </form>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No verified listings found. Try adjusting your search filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold leading-snug">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                  </div>
                  {property.is_verified && (
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 text-lg">
                    ₦{Number(property.rent_amount).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </span>
                  <Badge variant="secondary" className="capitalize">{property.property_type}</Badge>
                </div>

                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{property.bedrooms} bed</span>
                  <span>·</span>
                  <span>{property.bathrooms} bath</span>
                  {property.is_furnished && <><span>·</span><span>Furnished</span></>}
                </div>

                <Link
                  href={`/tenant/search/${property.id}`}
                  className={cn(buttonVariants(), "bg-emerald-600 hover:bg-emerald-700 text-white w-full justify-center")}
                >
                  View &amp; Apply
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
