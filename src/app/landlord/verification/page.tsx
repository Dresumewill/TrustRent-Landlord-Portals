import { createClient } from "@/lib/supabase/server";
import { TrustChecklist } from "@/components/landlord/TrustChecklist";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Info } from "lucide-react";

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select(`
      full_name, verification_status, trust_score,
      id_document_url, deed_document_url,
      utility_bill_url, tax_clearance_url
    `)
    .eq("id", user?.id ?? "")
    .single();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, is_verified")
    .eq("landlord_id", user?.id ?? "");

  const verifiedProperties = properties?.filter((p) => p.is_verified) ?? [];

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold">Identity Verification</h1>
        </div>
        <p className="text-muted-foreground">
          Complete your trust checklist to get the TrustRent Verified badge on your listings.
        </p>
      </div>

      <Card className="mb-6 border-slate-200">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Account holder</p>
              <p className="font-semibold">{profile?.full_name ?? user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verification status</p>
              <div className="mt-0.5">
                {profile?.verification_status === "verified" ? (
                  <VerifiedBadge isVerified={true} variant="pill" />
                ) : (
                  <span className="text-sm font-medium capitalize text-amber-600">
                    {profile?.verification_status ?? "Unverified"}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trust score</p>
              <p className="font-semibold">{profile?.trust_score ?? 0} / 5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified listings</p>
              <p className="font-semibold">{verifiedProperties.length} / {properties?.length ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-lg bg-blue-50 border border-blue-100 p-4 mb-6 text-sm text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <p>
          Once your identity and property documents are verified, all your <strong>active listings</strong> will
          automatically display the <strong>TrustRent Verified</strong> badge, increasing tenant trust and application rates.
        </p>
      </div>

      <TrustChecklist
        userId={user?.id ?? ""}
        docPaths={{
          id_document_url:  profile?.id_document_url  ?? null,
          deed_document_url: profile?.deed_document_url ?? null,
          utility_bill_url:  profile?.utility_bill_url  ?? null,
          tax_clearance_url: profile?.tax_clearance_url ?? null,
        }}
        verificationStatus={profile?.verification_status ?? "unverified"}
      />
    </div>
  );
}
