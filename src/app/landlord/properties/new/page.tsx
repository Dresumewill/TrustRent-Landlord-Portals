"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("properties").insert({
      landlord_id: user.id,
      title: form.get("title") as string,
      description: form.get("description") as string,
      address_line1: form.get("address_line1") as string,
      city: form.get("city") as string,
      state: form.get("state") as string,
      rent_amount: Number(form.get("rent_amount")),
      deposit_amount: Number(form.get("deposit_amount") || 0),
      bedrooms: Number(form.get("bedrooms") || 0),
      bathrooms: Number(form.get("bathrooms") || 0),
      property_type: form.get("property_type") as string,
      is_furnished: form.get("is_furnished") === "on",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/landlord/properties");
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Add New Property</h1>
      <p className="text-muted-foreground mb-8">Fill in the details to create a new listing.</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Property Title</Label>
              <Input id="title" name="title" placeholder="e.g. Cozy 2-Bedroom Apartment in Lekki" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe the property..." rows={4} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="property_type">Type</Label>
                <select
                  id="property_type"
                  name="property_type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rent_amount">Monthly Rent (₦)</Label>
                <Input id="rent_amount" name="rent_amount" type="number" placeholder="150000" min="1" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" name="bedrooms" type="number" placeholder="2" min="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" name="bathrooms" type="number" placeholder="1" min="0" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address_line1">Street Address</Label>
              <Input id="address_line1" name="address_line1" placeholder="123 Trust Avenue" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Lagos" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" placeholder="Lagos" required />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_furnished" name="is_furnished" className="h-4 w-4 rounded border-input" />
              <Label htmlFor="is_furnished">Furnished</Label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                {loading ? "Saving..." : "Create Listing"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
