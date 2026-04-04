import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { emailApplicationApproved } from "@/lib/email";
import { fmtCurrency } from "@/lib/utils";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: application } = await supabase
    .from("applications")
    .select("id, tenant_id, properties(landlord_id, title, rent_amount, deposit_amount, currency)")
    .eq("id", id)
    .single();

  const prop = application?.properties as unknown as {
    landlord_id: string; title: string;
    rent_amount: number; deposit_amount: number; currency: string;
  } | { landlord_id: string; title: string; rent_amount: number; deposit_amount: number; currency: string; }[] | null;

  const propObj = Array.isArray(prop) ? prop[0] : prop;
  if (!application || propObj?.landlord_id !== user.id) redirect("/landlord/applications");

  await supabase
    .from("applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  // Email tenant
  const { data: tenant } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", application.tenant_id)
    .single();

  if (tenant && propObj) {
    const depositAmt = Number(propObj.deposit_amount) > 0
      ? Number(propObj.deposit_amount)
      : Number(propObj.rent_amount);

    await emailApplicationApproved({
      tenantEmail:   tenant.email,
      tenantName:    tenant.full_name ?? "Tenant",
      propertyTitle: propObj.title,
      depositAmount: fmtCurrency(depositAmt, propObj.currency),
      appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/tenant/applications`,
    });
  }

  redirect("/landlord/applications");
}
