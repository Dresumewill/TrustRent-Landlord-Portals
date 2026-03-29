"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { payDeposit } from "@/app/actions/escrow";
import { fmtAmount } from "@/lib/utils";

interface PayDepositFormProps {
  applicationId: string;
  propertyTitle: string;
  amount: number;
}

export function PayDepositForm({ applicationId, propertyTitle, amount }: PayDepositFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mock card fields (display only — no real Stripe in this demo)
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await payDeposit(applicationId);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/tenant/payments"), 2000);
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h2 className="text-xl font-bold">Deposit Paid!</h2>
          <p className="text-muted-foreground text-sm">
            ₦{fmtAmount(amount)} is now held securely in escrow.
            Redirecting to your payments…
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
          Your deposit for <span className="font-medium text-foreground">{propertyTitle}</span> will
          be held in escrow until you confirm your move-in.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mock card UI */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Card Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ""))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Expiry</label>
              <input
                type="text"
                placeholder="MM / YY"
                maxLength={7}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">CVV</label>
              <input
                type="text"
                placeholder="123"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-border p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deposit Amount</span>
            <span className="text-lg font-bold text-emerald-700">₦{fmtAmount(amount)}</span>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
          >
            {loading ? "Processing…" : `Pay ₦${fmtAmount(amount)} into Escrow`}
          </Button>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Secured by mock Stripe · funds released only on your confirmation
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
