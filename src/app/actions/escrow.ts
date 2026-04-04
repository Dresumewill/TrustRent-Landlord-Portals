"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { emailEscrowReleased, emailDisputeOpened } from "@/lib/email";
import { fmtCurrency } from "@/lib/utils";

export async function payDeposit(applicationId: string, stripePaymentIntentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*, properties(id, title, rent_amount, deposit_amount, currency, landlord_id)")
    .eq("id", applicationId)
    .eq("tenant_id", user.id)
    .single();

  if (appError || !application) return { error: "Application not found." };
  if (application.status !== "approved") {
    return { error: "Application must be approved before paying deposit." };
  }

  const property = application.properties as {
    id: string; title: string;
    rent_amount: number; deposit_amount: number;
    currency: string; landlord_id: string;
  } | null;
  if (!property) return { error: "Property not found." };

  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("application_id", applicationId)
    .eq("status", "held_in_escrow")
    .maybeSingle();

  if (existing) return { error: "A deposit is already held in escrow for this application." };

  const depositAmount = Number(property.deposit_amount) > 0
    ? Number(property.deposit_amount)
    : Number(property.rent_amount);

  const { error: txError } = await supabase.from("transactions").insert({
    property_id:      property.id,
    application_id:   applicationId,
    payer_id:         user.id,
    payee_id:         property.landlord_id,
    amount:           depositAmount,
    currency:         property.currency,
    transaction_type: "deposit",
    status:           "held_in_escrow",
    reference:        stripePaymentIntentId ?? `manual_${Date.now()}`,
    provider:         stripePaymentIntentId ? "stripe" : "manual",
  });

  if (txError) return { error: "Failed to record transaction." };

  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/applications");
  return { success: true };
  // Note: deposit-paid email is sent by the Stripe webhook for Stripe payments.
  // For manual payments (test mode) it is skipped — webhook handles production.
}

export async function confirmMoveIn(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("id, payer_id, payee_id, amount, currency, property_id, status")
    .eq("id", transactionId)
    .eq("payer_id", user.id)
    .single();

  if (txError || !tx) return { error: "Transaction not found." };
  if (tx.status !== "held_in_escrow") return { error: "Funds are not currently in escrow." };

  const { error } = await supabase
    .from("transactions")
    .update({ status: "completed", escrow_released_at: new Date().toISOString() })
    .eq("id", transactionId);

  if (error) return { error: "Failed to release funds." };

  // Email the landlord that funds are released
  const db = createAdminClient();
  const [{ data: landlord }, { data: property }] = await Promise.all([
    db.from("users").select("email, full_name").eq("id", tx.payee_id).single(),
    db.from("properties").select("title").eq("id", tx.property_id).single(),
  ]);

  if (landlord && property) {
    await emailEscrowReleased({
      landlordEmail:  landlord.email,
      landlordName:   landlord.full_name ?? "Landlord",
      amount:         fmtCurrency(Number(tx.amount), tx.currency),
      propertyTitle:  property.title,
      appUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/transactions`,
    });
  }

  // Update trust scores: +0.25 per completed tenancy (capped at 5)
  await Promise.all([
    db.rpc("increment_trust_score", { user_id: tx.payer_id,  delta: 0.25 }),
    db.rpc("increment_trust_score", { user_id: tx.payee_id, delta: 0.25 }),
  ]);

  revalidatePath("/tenant/payments");
  return { success: true };
}

export async function disputeTransaction(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("id, payer_id, payee_id, amount, currency, property_id, status")
    .eq("id", transactionId)
    .eq("payer_id", user.id)
    .single();

  if (txError || !tx) return { error: "Transaction not found." };
  if (tx.status !== "held_in_escrow") return { error: "Only escrow transactions can be disputed." };

  const { error } = await supabase
    .from("transactions")
    .update({ status: "disputed" })
    .eq("id", transactionId);

  if (error) return { error: "Failed to open dispute." };

  // Email landlord about the dispute
  const db = createAdminClient();
  const [{ data: landlord }, { data: tenant }, { data: property }] = await Promise.all([
    db.from("users").select("email, full_name").eq("id", tx.payee_id).single(),
    db.from("users").select("full_name").eq("id", tx.payer_id).single(),
    db.from("properties").select("title").eq("id", tx.property_id).single(),
  ]);

  if (landlord && property) {
    await emailDisputeOpened({
      landlordEmail:  landlord.email,
      landlordName:   landlord.full_name ?? "Landlord",
      tenantName:     tenant?.full_name ?? "Tenant",
      propertyTitle:  property.title,
      amount:         fmtCurrency(Number(tx.amount), tx.currency),
      adminUrl:       `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/disputes`,
    });
  }

  revalidatePath("/tenant/payments");
  return { success: true };
}
