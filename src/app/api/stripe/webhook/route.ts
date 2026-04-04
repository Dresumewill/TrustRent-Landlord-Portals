import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { emailDepositPaid } from "@/lib/email";
import { fmtCurrency } from "@/lib/utils";

// Disable body parsing so we can read the raw body for Stripe signature verification
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey     = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const sig    = request.headers.get("stripe-signature");
  const body   = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  const db = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;

    const { applicationId, propertyId, tenantId, landlordId } = pi.metadata as {
      applicationId: string;
      propertyId:    string;
      tenantId:      string;
      landlordId:    string;
    };

    if (!applicationId || !propertyId || !tenantId || !landlordId) {
      // Not a TrustRent deposit — ignore
      return new Response("OK", { status: 200 });
    }

    // Idempotency: skip if transaction already recorded (e.g. from client-side fallback)
    const { data: existing } = await db
      .from("transactions")
      .select("id")
      .eq("reference", pi.id)
      .maybeSingle();

    if (!existing) {
      const currency = pi.currency.toUpperCase();
      const amount   = pi.amount_received / 100; // Stripe uses smallest unit

      await db.from("transactions").insert({
        property_id:      propertyId,
        application_id:   applicationId,
        payer_id:         tenantId,
        payee_id:         landlordId,
        amount,
        currency,
        transaction_type: "deposit",
        status:           "held_in_escrow",
        reference:        pi.id,
        provider:         "stripe",
        provider_response: pi as unknown as Record<string, unknown>,
      });
    }

    // Send email to landlord
    const [{ data: landlord }, { data: tenant }, { data: property }] = await Promise.all([
      db.from("users").select("email, full_name").eq("id", landlordId).single(),
      db.from("users").select("full_name").eq("id", tenantId).single(),
      db.from("properties").select("title, deposit_amount, rent_amount, currency").eq("id", propertyId).single(),
    ]);

    if (landlord && tenant && property) {
      const depositAmt = Number(property.deposit_amount) > 0
        ? Number(property.deposit_amount)
        : Number(property.rent_amount);

      await emailDepositPaid({
        landlordEmail:  landlord.email,
        landlordName:   landlord.full_name ?? "Landlord",
        tenantName:     tenant.full_name ?? "Tenant",
        propertyTitle:  property.title,
        depositAmount:  fmtCurrency(depositAmt, property.currency),
        appUrl:         `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/landlord/transactions`,
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await db
      .from("transactions")
      .update({ status: "failed", provider_response: pi as unknown as Record<string, unknown> })
      .eq("reference", pi.id)
      .eq("status", "pending");
  }

  if (event.type === "payment_intent.canceled") {
    const pi = event.data.object as Stripe.PaymentIntent;
    // Remove any pending/escrow record so the tenant can retry
    await db
      .from("transactions")
      .delete()
      .eq("reference", pi.id)
      .in("status", ["pending", "held_in_escrow"]);
  }

  return new Response("OK", { status: 200 });
}
