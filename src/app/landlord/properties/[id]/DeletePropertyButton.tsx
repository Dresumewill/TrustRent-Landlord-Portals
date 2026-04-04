"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProperty } from "@/app/actions/properties";

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    const result = await deleteProperty(propertyId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setConfirming(false);
      return;
    }
    router.push("/landlord/properties");
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete Property
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-red-600 font-medium">
        Are you sure? This cannot be undone.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setConfirming(false); setError(""); }}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
