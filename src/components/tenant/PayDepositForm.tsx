"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { payDeposit } from "@/app/actions/escrow";
import { fmtCurrency } from "@/lib/utils";

interface PayDepositFormProps {
  applicationId: string;
  propertyTitle: string;
  amount: number;
  currency?: string;
}

// Only initialise Stripe when the publishable key is configured
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// ─── Inner form (needs Stripe context) ───────────────────────────────────────

function CheckoutForm({
  applicationId,
  amount,
  currency,
  clientSecret,
}: Omit<PayDepositFormProps, "propertyTitle"> & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);
    if (!card) { setLoading(false); return; }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Record the transaction in the database
      const result = await payDeposit(applicationId, paymentIntent.id);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/tenant/payments"), 2000);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <h2 className="text-xl font-bold">Deposit Paid!</h2>
        <p className="text-muted-foreground text-sm">
          {fmtCurrency(amount, currency)} is now held securely in escrow.
          Redirecting to your payments…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Card Details</label>
        <div className="rounded-lg border border-input bg-background px-3 py-2.5">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#0f172a",
                  "::placeholder": { color: "#94a3b8" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 border border-border p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Deposit Amount</span>
        <span className="text-lg font-bold text-emerald-700">{fmtCurrency(amount, currency)}</span>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !stripe}
        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
      >
        {loading ? "Processing…" : `Pay ${fmtCurrency(amount, currency)} into Escrow`}
      </Button>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" /> Secured by Stripe · funds released only on your confirmation
      </p>
    </form>
  );
}

// ─── Outer wrapper — fetches clientSecret, provides Elements context ──────────

export function PayDepositForm(props: PayDepositFormProps) {
  const { applicationId, currency = "NGN" } = props;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePromise) return; // Stripe not configured — handled below

    fetch("/api/stripe/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    })
      .then((r) => r.json())
      .then((data: { clientSecret?: string; error?: string }) => {
        if (data.error) { setFetchError(data.error); return; }
        if (data.clientSecret) setClientSecret(data.clientSecret);
      })
      .catch(() => setFetchError("Failed to initialise payment. Please refresh and try again."));
  }, [applicationId]);

  // Stripe keys not configured — show informational card
  if (!stripePromise) {
    return (
      <Card className="max-w-md mx-auto border-amber-200 bg-amber-50">
        <CardContent className="pt-6 pb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Payments not yet configured
          </div>
          <p className="text-sm text-amber-800">
            Add <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and{" "}
            <code className="bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code> to your environment variables to enable real payments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-600" />
          Secure Escrow Payment
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Your deposit for <span className="font-medium text-foreground">{props.propertyTitle}</span> will
          be held in escrow until you confirm your move-in.
        </p>
      </CardHeader>
      <CardContent>
        {fetchError && (
          <p className="text-sm text-red-600 mb-4">{fetchError}</p>
        )}

        {!clientSecret && !fetchError && (
          <p className="text-sm text-muted-foreground py-4 text-center">Initialising payment…</p>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <CheckoutForm {...props} currency={currency} clientSecret={clientSecret} />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}
