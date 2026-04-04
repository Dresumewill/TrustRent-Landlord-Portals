"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (resendError) {
      setError(resendError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <h2 className="text-xl font-bold">Email sent!</h2>
          <p className="text-muted-foreground text-sm">
            A new confirmation link has been sent to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <Link href="/login" className="text-emerald-600 font-medium hover:underline text-sm">
            Back to Sign In
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Resend confirmation</CardTitle>
        <CardDescription>Enter your email to receive a new verification link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
            disabled={loading}
          >
            {loading ? "Sending..." : "Resend Email"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-emerald-600 font-medium hover:underline">
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
