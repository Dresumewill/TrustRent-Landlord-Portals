"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Guard: ensure caller is an authenticated admin
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return user.id;
}

// ──────────────────────────────────────────────────────────────
// LANDLORD VERIFICATION
// ──────────────────────────────────────────────────────────────

export async function verifyLandlord(landlordId: string) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("users")
    .update({ verification_status: "verified", rejection_reason: null })
    .eq("id", landlordId);

  if (error) return { error: "Failed to verify landlord." };

  revalidatePath("/admin/verification");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function rejectLandlord(landlordId: string, reason: string) {
  await requireAdmin();
  if (!reason.trim()) return { error: "A rejection reason is required." };

  const db = createAdminClient();

  const { error } = await db
    .from("users")
    .update({ verification_status: "rejected", rejection_reason: reason.trim() })
    .eq("id", landlordId);

  if (error) return { error: "Failed to reject landlord." };

  revalidatePath("/admin/verification");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// ──────────────────────────────────────────────────────────────
// DISPUTE RESOLUTION
// ──────────────────────────────────────────────────────────────

export async function releaseDisputeFundsToLandlord(
  transactionId: string,
  adminNotes?: string
) {
  const adminId = await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("transactions")
    .update({
      status: "resolved",
      escrow_released_at: new Date().toISOString(),
      admin_resolved_by: adminId,
      admin_resolved_at: new Date().toISOString(),
      admin_notes: adminNotes ?? "Funds released to landlord by admin.",
    })
    .eq("id", transactionId)
    .eq("status", "disputed");

  if (error) return { error: "Failed to release funds." };

  revalidatePath("/admin/disputes");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function refundDisputeFundsToTenant(
  transactionId: string,
  adminNotes?: string
) {
  const adminId = await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("transactions")
    .update({
      status: "refunded",
      admin_resolved_by: adminId,
      admin_resolved_at: new Date().toISOString(),
      admin_notes: adminNotes ?? "Funds refunded to tenant by admin.",
    })
    .eq("id", transactionId)
    .eq("status", "disputed");

  if (error) return { error: "Failed to refund funds." };

  revalidatePath("/admin/disputes");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
