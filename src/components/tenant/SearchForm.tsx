"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/lib/button-variants";
import Link from "next/link";

interface SearchFormProps {
  city?: string;
  maxPrice?: string;
}

export function SearchForm({ city = "", maxPrice = "" }: SearchFormProps) {
  const router = useRouter();
  const [cityValue, setCityValue] = useState(city);
  const [priceValue, setPriceValue] = useState(maxPrice);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (cityValue) params.set("city", cityValue);
    if (priceValue) params.set("max_price", priceValue);
    router.push(`/tenant/search?${params.toString()}`);
  }

  const hasFilters = city || maxPrice;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
      <Input
        placeholder="City (e.g. Lagos)"
        value={cityValue}
        onChange={(e) => setCityValue(e.target.value)}
        className="w-full sm:w-48"
      />
      <Input
        type="number"
        placeholder="Max rent"
        value={priceValue}
        onChange={(e) => setPriceValue(e.target.value)}
        className="w-full sm:w-44"
      />
      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
        Search
      </Button>
      {hasFilters && (
        <Link href="/tenant/search" className={buttonVariants({ variant: "outline" })}>
          Clear
        </Link>
      )}
    </form>
  );
}
