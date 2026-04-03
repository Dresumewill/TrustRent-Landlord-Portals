"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface Props {
  propertyId: string;
  depositAmount: number;
  currency: string;
  alreadyApplied: boolean;
}

const EMPLOYMENT_OPTIONS = [
  { value: "employed", label: "Employed (full-time)" },
  { value: "self_employed", label: "Self-employed" },
  { value: "part_time", label: "Employed (part-time)" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
  { value: "unemployed", label: "Unemployed" },
];

export function ApplyForm({ propertyId, alreadyApplied }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [moveInDate, setMoveInDate] = useState("");
  const [numOccupants, setNumOccupants] = useState("1");
  const [employment, setEmployment] = useState("employed");
  const [income, setIncome] = useState("");
  const [message, setMessage] = useState("");

  if (alreadyApplied) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-5 pb-5">
          <p className="text-sm font-medium text-emerald-700">
            ✓ You have already applied to this property. Track your application in{" "}
            <a href="/tenant/applications" className="underline">My Applications</a>.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="pt-5 pb-5">
          <p className="text-sm font-medium text-emerald-700">
            ✓ Application submitted! The landlord will be in touch.{" "}
            <a href="/tenant/applications" className="underline">View your applications.</a>
          </p>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { error: insertError } = await supabase.from("applications").insert({
      property_id: propertyId,
      tenant_id: user.id,
      move_in_date: moveInDate || null,
      num_occupants: Number(numOccupants),
      employment_status: employment,
      monthly_income: income ? Number(income) : null,
      message: message || null,
      trust_score_at_apply: null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Apply for This Property</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="move_in_date">Desired Move-In Date</Label>
              <Input
                id="move_in_date"
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="num_occupants">Number of Occupants</Label>
              <Input
                id="num_occupants"
                type="number"
                min="1"
                max="20"
                value={numOccupants}
                onChange={(e) => setNumOccupants(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="employment">Employment Status</Label>
              <select
                id="employment"
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {EMPLOYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="income">Monthly Income (optional)</Label>
              <Input
                id="income"
                type="number"
                min="0"
                placeholder="e.g. 500000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message to Landlord (optional)</Label>
            <textarea
              id="message"
              rows={3}
              placeholder="Introduce yourself and explain why you'd be a great tenant..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 placeholder:text-muted-foreground"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
