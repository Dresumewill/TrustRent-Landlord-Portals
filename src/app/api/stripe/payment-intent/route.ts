import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorised" }, { status: 401 });

  const { applicationId } = await request.json() as { applicationId: string };

  const { data: application } = await supabase
    .from("applications")
    .select("*, properties(id, title, rent_amount, deposit_amount, currency, landlord_id)")
    .eq("id", applicationId)
    .eq("tenant_id", user.id)
    .single();

  if (!application || application.status !== "approved") {
    return Response.json({ error: "Application not found or not approved." }, { status: 404 });
  }

  const property = application.properties as {
    id: string; title: string; rent_amount: number;
    deposit_amount: number; currency: string; landlord_id: string;
  } | null;

  if (!property) return Response.json({ error: "Property not found." }, { status: 404 });

  const depositAmount = Number(property.deposit_amount) > 0
    ? Number(property.deposit_amount)
    : Number(property.rent_amount);

  // Stripe amounts are in the smallest currency unit (e.g. kobo for NGN, cents for USD)
  // Most African currencies use 2 decimal places
  const amountInSmallestUnit = Math.round(depositAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: property.currency.toLowerCase(),
    metadata: {
      applicationId,
      propertyId: property.id,
      tenantId: user.id,
      landlordId: property.landlord_id,
    },
    description: `TrustRent deposit for ${property.title}`,
  });

  return Response.json({ clientSecret: paymentIntent.client_secret });
}
