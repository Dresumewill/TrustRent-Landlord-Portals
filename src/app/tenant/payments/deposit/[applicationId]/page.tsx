import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PayDepositForm } from "@/components/tenant/PayDepositForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ applicationId: string }>;
}

export default async function PayDepositPage({ params }: Props) {
  const { applicationId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: application } = await supabase
    .from("applications")
    .select("*, properties(id, title, city, state, rent_amount, deposit_amount)")
    .eq("id", applicationId)
    .eq("tenant_id", user?.id ?? "")
    .single();

  if (!application || application.status !== "approved") notFound();

  const property = application.properties as {
    id: string;
    title: string;
    city: string;
    state: string;
    rent_amount: number;
    deposit_amount: number;
  } | null;

  if (!property) notFound();

  const depositAmount = Number(property.deposit_amount) > 0
    ? Number(property.deposit_amount)
    : Number(property.rent_amount);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/tenant/applications"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 gap-2 -ml-2")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Pay Security Deposit</h1>
        <p className="text-muted-foreground mt-1">
          {property.title} · {property.city}, {property.state}
        </p>
      </div>

      <PayDepositForm
        applicationId={applicationId}
        propertyTitle={property.title}
        amount={depositAmount}
      />
    </div>
  );
}
