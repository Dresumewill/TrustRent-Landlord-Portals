import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { emailApplicationRejected } from "@/lib/email";

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
    .select("id, tenant_id, properties(landlord_id, title)")
    .eq("id", id)
    .single();

  const prop = application?.properties as unknown as
    | { landlord_id: string; title: string }
    | { landlord_id: string; title: string }[]
    | null;
  const propObj = Array.isArray(prop) ? prop[0] : prop;
  if (!application || propObj?.landlord_id !== user.id) redirect("/landlord/applications");

  await supabase
    .from("applications")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  // Email tenant
  const { data: tenant } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", application.tenant_id)
    .single();

  if (tenant && propObj) {
    await emailApplicationRejected({
      tenantEmail:   tenant.email,
      tenantName:    tenant.full_name ?? "Tenant",
      propertyTitle: propObj.title,
      appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/tenant/search`,
    });
  }

  redirect("/landlord/applications");
}
