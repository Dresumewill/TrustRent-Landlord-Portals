"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emailNewApplication } from "@/lib/email";

export async function saveLandlordNote(applicationId: string, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify this landlord owns the property on this application
  const { data: application } = await supabase
    .from("applications")
    .select("id, properties!inner(landlord_id)")
    .eq("id", applicationId)
    .single();

  const prop = application?.properties as unknown as { landlord_id: string } | null;
  if (prop?.landlord_id !== user.id) return { error: "Access denied." };

  const { error } = await supabase
    .from("applications")
    .update({ landlord_note: note.trim() || null })
    .eq("id", applicationId);

  if (error) return { error: "Failed to save note." };

  revalidatePath(`/landlord/applications/${applicationId}`);
  return { success: true };
}

export async function submitApplication(data: {
  propertyId: string;
  moveInDate: string | null;
  numOccupants: number;
  employmentStatus: string;
  monthlyIncome: number | null;
  message: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error: insertError } = await supabase.from("applications").insert({
    property_id:       data.propertyId,
    tenant_id:         user.id,
    move_in_date:      data.moveInDate,
    num_occupants:     data.numOccupants,
    employment_status: data.employmentStatus,
    monthly_income:    data.monthlyIncome,
    message:           data.message,
    trust_score_at_apply: null,
  });

  if (insertError) return { error: insertError.message };

  // Fire email to landlord (use admin client to read landlord details)
  const db = createAdminClient();
  const { data: property } = await db
    .from("properties")
    .select("title, landlord_id, users(email, full_name)")
    .eq("id", data.propertyId)
    .single();

  const landlord = property?.users as unknown as { email: string; full_name: string | null } | null;
  const { data: tenant } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (landlord && property) {
    // Fetch the new application id for the link
    const { data: newApp } = await supabase
      .from("applications")
      .select("id")
      .eq("property_id", data.propertyId)
      .eq("tenant_id", user.id)
      .single();

    await emailNewApplication({
      landlordEmail: landlord.email,
      landlordName:  landlord.full_name ?? "Landlord",
      tenantName:    tenant?.full_name ?? "A tenant",
      propertyTitle: property.title,
      appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/applications/${newApp?.id ?? ""}`,
    });
  }

  revalidatePath("/tenant/applications");
  return { success: true };
}
