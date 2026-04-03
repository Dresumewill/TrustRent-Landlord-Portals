"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function payDeposit(applicationId: string, stripePaymentIntentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*, properties(id, title, rent_amount, deposit_amount, landlord_id)")
    .eq("id", applicationId)
    .eq("tenant_id", user.id)
    .single();

  if (appError || !application) return { error: "Application not found." };
  if (application.status !== "approved") {
    return { error: "Application must be approved before paying deposit." };
  }

  const property = application.properties as {
    id: string; title: string;
    rent_amount: number; deposit_amount: number; landlord_id: string;
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
    transaction_type: "deposit",
    status:           "held_in_escrow",
    reference:        stripePaymentIntentId ?? `manual_${Date.now()}`,
    provider:         stripePaymentIntentId ? "stripe" : "manual",
  });

  if (txError) return { error: "Failed to record transaction." };

  revalidatePath("/tenant/payments");
  revalidatePath("/tenant/applications");
  return { success: true };
}

export async function confirmMoveIn(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("id, payer_id, status")
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

  revalidatePath("/tenant/payments");
  return { success: true };
}

export async function disputeTransaction(transactionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tx, error: txError } = await supabase
    .from("transactions")
    .select("id, payer_id, status")
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

  revalidatePath("/tenant/payments");
  return { success: true };
}
