"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { AFRICAN_CURRENCIES } from "@/lib/currencies";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Country/currency state — default Nigeria
  const [countryCode, setCountryCode]       = useState("NG");
  const [currencyCode, setCurrencyCode]     = useState("NGN");
  const [currencySymbol, setCurrencySymbol] = useState("₦");

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = AFRICAN_CURRENCIES.find((c) => c.countryCode === e.target.value);
    if (!selected) return;
    setCountryCode(selected.countryCode);
    setCurrencyCode(selected.currencyCode);
    setCurrencySymbol(selected.symbol);
  }

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
      landlord_id:    user.id,
      title:          form.get("title") as string,
      description:    form.get("description") as string,
      address_line1:  form.get("address_line1") as string,
      city:           form.get("city") as string,
      state:          form.get("state") as string,
      country:        countryCode,
      currency:       currencyCode,
      rent_amount:    Number(form.get("rent_amount")),
      deposit_amount: Number(form.get("deposit_amount") || 0),
      bedrooms:       Number(form.get("bedrooms") || 0),
      bathrooms:      Number(form.get("bathrooms") || 0),
      property_type:  form.get("property_type") as string,
      is_furnished:   form.get("is_furnished") === "on",
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

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Property Title</Label>
              <Input id="title" name="title" placeholder="e.g. Cozy 2-Bedroom Apartment in Lekki" required />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe the property..." rows={4} />
            </div>

            {/* Country + Currency (auto-filled) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  value={countryCode}
                  onChange={handleCountryChange}
                  className={selectClass}
                >
                  {AFRICAN_CURRENCIES.map((c) => (
                    <option key={c.countryCode} value={c.countryCode}>
                      {c.country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Currency</Label>
                <div className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-muted-foreground select-none">
                  <span className="font-semibold text-foreground mr-1">{currencySymbol}</span>
                  {currencyCode}
                </div>
              </div>
            </div>

            {/* Type + Rent */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="property_type">Type</Label>
                <select id="property_type" name="property_type" className={selectClass}>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rent_amount">Monthly Rent ({currencySymbol})</Label>
                <Input id="rent_amount" name="rent_amount" type="number" placeholder="150000" min="1" required />
              </div>
            </div>

            {/* Deposit */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deposit_amount">
                Security Deposit ({currencySymbol})
                <span className="ml-1 text-xs font-normal text-muted-foreground">— leave 0 to default to one month&apos;s rent</span>
              </Label>
              <Input id="deposit_amount" name="deposit_amount" type="number" placeholder="0" min="0" />
            </div>

            {/* Bedrooms + Bathrooms */}
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

            {/* Address */}
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
                <Label htmlFor="state">State / Region</Label>
                <Input id="state" name="state" placeholder="Lagos" required />
              </div>
            </div>

            {/* Furnished */}
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
