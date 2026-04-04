"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  emailLandlordVerified,
  emailLandlordRejected,
  emailDisputeResolved,
} from "@/lib/email";
import { fmtCurrency } from "@/lib/utils";

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

export async function verifyLandlord(landlordId: string) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db
    .from("users")
    .update({ verification_status: "verified", rejection_reason: null })
    .eq("id", landlordId);

  if (error) return { error: "Failed to verify landlord." };

  // Email the landlord
  const { data: landlord } = await db
    .from("users")
    .select("email, full_name")
    .eq("id", landlordId)
    .single();

  if (landlord) {
    await emailLandlordVerified({
      landlordEmail: landlord.email,
      landlordName:  landlord.full_name ?? "Landlord",
      dashboardUrl:  `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/dashboard`,
    });
  }

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

  // Email the landlord
  const { data: landlord } = await db
    .from("users")
    .select("email, full_name")
    .eq("id", landlordId)
    .single();

  if (landlord) {
    await emailLandlordRejected({
      landlordEmail:   landlord.email,
      landlordName:    landlord.full_name ?? "Landlord",
      reason:          reason.trim(),
      verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/verification`,
    });
  }

  revalidatePath("/admin/verification");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function releaseDisputeFundsToLandlord(
  transactionId: string,
  adminNotes?: string
) {
  const adminId = await requireAdmin();
  const db = createAdminClient();

  const { data: tx } = await db
    .from("transactions")
    .select("payer_id, payee_id, amount, currency, property_id")
    .eq("id", transactionId)
    .single();

  const { error } = await db
    .from("transactions")
    .update({
      status:             "resolved",
      escrow_released_at: new Date().toISOString(),
      admin_resolved_by:  adminId,
      admin_resolved_at:  new Date().toISOString(),
      admin_notes:        adminNotes ?? "Funds released to landlord by admin.",
    })
    .eq("id", transactionId)
    .eq("status", "disputed");

  if (error) return { error: "Failed to release funds." };

  // Email both parties
  if (tx) {
    const [{ data: landlord }, { data: tenant }, { data: property }] = await Promise.all([
      db.from("users").select("email, full_name").eq("id", tx.payee_id).single(),
      db.from("users").select("email, full_name").eq("id", tx.payer_id).single(),
      db.from("properties").select("title").eq("id", tx.property_id).single(),
    ]);

    const notes = adminNotes ?? "Funds released to landlord by admin.";
    const amt   = fmtCurrency(Number(tx.amount), tx.currency);

    if (landlord && property) {
      await emailDisputeResolved({
        recipientEmail: landlord.email,
        recipientName:  landlord.full_name ?? "Landlord",
        propertyTitle:  property.title,
        outcome:        "released_to_landlord",
        amount:         amt,
        adminNotes:     notes,
        appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/transactions`,
      });
    }
    if (tenant && property) {
      await emailDisputeResolved({
        recipientEmail: tenant.email,
        recipientName:  tenant.full_name ?? "Tenant",
        propertyTitle:  property.title,
        outcome:        "released_to_landlord",
        amount:         amt,
        adminNotes:     notes,
        appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/tenant/payments`,
      });
    }
  }

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

  const { data: tx } = await db
    .from("transactions")
    .select("payer_id, payee_id, amount, currency, property_id")
    .eq("id", transactionId)
    .single();

  const { error } = await db
    .from("transactions")
    .update({
      status:            "refunded",
      admin_resolved_by: adminId,
      admin_resolved_at: new Date().toISOString(),
      admin_notes:       adminNotes ?? "Funds refunded to tenant by admin.",
    })
    .eq("id", transactionId)
    .eq("status", "disputed");

  if (error) return { error: "Failed to refund funds." };

  // Email both parties
  if (tx) {
    const [{ data: landlord }, { data: tenant }, { data: property }] = await Promise.all([
      db.from("users").select("email, full_name").eq("id", tx.payee_id).single(),
      db.from("users").select("email, full_name").eq("id", tx.payer_id).single(),
      db.from("properties").select("title").eq("id", tx.property_id).single(),
    ]);

    const notes = adminNotes ?? "Funds refunded to tenant by admin.";
    const amt   = fmtCurrency(Number(tx.amount), tx.currency);

    if (landlord && property) {
      await emailDisputeResolved({
        recipientEmail: landlord.email,
        recipientName:  landlord.full_name ?? "Landlord",
        propertyTitle:  property.title,
        outcome:        "refunded_to_tenant",
        amount:         amt,
        adminNotes:     notes,
        appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/transactions`,
      });
    }
    if (tenant && property) {
      await emailDisputeResolved({
        recipientEmail: tenant.email,
        recipientName:  tenant.full_name ?? "Tenant",
        propertyTitle:  property.title,
        outcome:        "refunded_to_tenant",
        amount:         amt,
        adminNotes:     notes,
        appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/tenant/payments`,
      });
    }
  }

  revalidatePath("/admin/disputes");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
