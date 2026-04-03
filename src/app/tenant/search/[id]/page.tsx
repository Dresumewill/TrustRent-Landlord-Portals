import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, BedDouble, Bath, Sofa, PawPrint, MapPin, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/lib/button-variants";
import { cn, fmtCurrency, fmtDate } from "@/lib/utils";
import { ApplyForm } from "./ApplyForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("*, users(full_name, verification_status, trust_score)")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!property) notFound();

  const landlord = property.users as {
    full_name: string;
    verification_status: string;
    trust_score: number;
  } | null;

  // Check if tenant already applied
  let alreadyApplied = false;
  if (user) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("property_id", id)
      .eq("tenant_id", user.id)
      .maybeSingle();
    alreadyApplied = !!existing;
  }

  const depositAmount = Number(property.deposit_amount) > 0
    ? Number(property.deposit_amount)
    : Number(property.rent_amount);

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/tenant/search"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 mb-6 -ml-2")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Search
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            {property.is_verified && (
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" /> Verified
              </div>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.address_line1}, {property.city}, {property.state}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-emerald-700">
            {fmtCurrency(Number(property.rent_amount), property.currency)}
          </p>
          <p className="text-sm text-muted-foreground">per month</p>
        </div>
      </div>

      {/* Key details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <BedDouble className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Bedrooms</p>
            <p className="font-semibold">{property.bedrooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <Bath className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Bathrooms</p>
            <p className="font-semibold">{property.bathrooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <Sofa className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Furnished</p>
            <p className="font-semibold">{property.is_furnished ? "Yes" : "No"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1 text-center">
            <PawPrint className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Pets</p>
            <p className="font-semibold">{property.allows_pets ? "Allowed" : "No Pets"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {property.description && (
        <Card className="mb-4">
          <CardContent className="pt-5 pb-5">
            <h2 className="font-semibold mb-2">About This Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Financial details */}
      <Card className="mb-4">
        <CardContent className="pt-5 pb-5">
          <h2 className="font-semibold mb-3">Financial Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Monthly Rent</p>
              <p className="font-semibold text-base">{fmtCurrency(Number(property.rent_amount), property.currency)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Security Deposit</p>
              <p className="font-semibold text-base">{fmtCurrency(depositAmount, property.currency)}</p>
            </div>
            {property.available_from && (
              <div>
                <p className="text-muted-foreground">Available From</p>
                <p className="font-medium flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {fmtDate(property.available_from)}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Property Type</p>
              <p className="font-medium capitalize">{property.property_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landlord info */}
      <Card className="mb-6">
        <CardContent className="pt-5 pb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Listed by</p>
            <p className="font-semibold">{landlord?.full_name ?? "Landlord"}</p>
          </div>
          <div className="flex items-center gap-2">
            {landlord?.verification_status === "verified" && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified Landlord
              </Badge>
            )}
            {landlord?.trust_score && landlord.trust_score > 0 ? (
              <Badge variant="secondary">{landlord.trust_score.toFixed(1)} ★</Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Application form */}
      {user ? (
        <ApplyForm
          propertyId={property.id}
          depositAmount={depositAmount}
          currency={property.currency}
          alreadyApplied={alreadyApplied}
        />
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 pb-5 text-sm text-amber-800">
            <Link href="/login" className="font-medium underline">Sign in</Link> or{" "}
            <Link href="/signup" className="font-medium underline">create an account</Link> to apply for this property.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
