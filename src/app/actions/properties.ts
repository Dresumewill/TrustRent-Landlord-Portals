"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify ownership before deleting
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("landlord_id", user.id)
    .single();

  if (!property) return { error: "Property not found or access denied." };

  // Block delete if there are active escrow transactions
  const { count: escrowCount } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId)
    .eq("status", "held_in_escrow");

  if (escrowCount && escrowCount > 0) {
    return { error: "Cannot delete a property with funds held in escrow." };
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("landlord_id", user.id);

  if (error) return { error: "Failed to delete property." };

  revalidatePath("/landlord/properties");
  revalidatePath("/landlord/dashboard");
  return { success: true };
}
