"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { ImagePlus, X, Loader2 } from "lucide-react";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  status: string;
  address_line1: string;
  city: string;
  state: string;
  rent_amount: number;
  deposit_amount: number;
  bedrooms: number;
  bathrooms: number;
  is_furnished: boolean;
  allows_pets: boolean;
  currency: string;
  images: string[];
}

export function EditPropertyForm({ property }: { property: Property }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [title, setTitle]               = useState(property.title);
  const [description, setDescription]   = useState(property.description ?? "");
  const [status, setStatus]             = useState(property.status);
  const [propertyType, setPropertyType] = useState(property.property_type);
  const [address, setAddress]           = useState(property.address_line1);
  const [city, setCity]                 = useState(property.city);
  const [state, setState]               = useState(property.state);
  const [rent, setRent]                 = useState(String(property.rent_amount));
  const [deposit, setDeposit]           = useState(String(property.deposit_amount));
  const [bedrooms, setBedrooms]         = useState(String(property.bedrooms));
  const [bathrooms, setBathrooms]       = useState(String(property.bathrooms));
  const [furnished, setFurnished]       = useState(property.is_furnished);
  const [pets, setPets]                 = useState(property.allows_pets);
  const [images, setImages]             = useState<string[]>(property.images ?? []);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError]         = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleImageUpload(file: File) {
    setImgUploading(true);
    setImgError("");

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${property.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      setImgError(uploadError.message);
      setImgUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("property-images")
      .getPublicUrl(path);

    const newImages = [...images, publicUrl];
    setImages(newImages);

    // Persist immediately so the array is always in sync
    await supabase
      .from("properties")
      .update({ images: newImages })
      .eq("id", property.id);

    setImgUploading(false);
  }

  async function handleRemoveImage(url: string) {
    const supabase = createClient();
    const newImages = images.filter((u) => u !== url);
    setImages(newImages);
    await supabase
      .from("properties")
      .update({ images: newImages })
      .eq("id", property.id);
  }

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        title,
        description: description || null,
        property_type: propertyType,
        status,
        address_line1: address,
        city,
        state,
        rent_amount:    Number(rent),
        deposit_amount: Number(deposit) || 0,
        bedrooms:       Number(bedrooms) || 0,
        bathrooms:      Number(bathrooms) || 0,
        is_furnished:   furnished,
        allows_pets:    pets,
      })
      .eq("id", property.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">

      {/* ── Property Images ─────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <Label>Photos</Label>
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
              <img src={url} alt="Property" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={imgUploading}
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-input flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-ring hover:text-foreground transition-colors disabled:opacity-50"
          >
            {imgUploading
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : <><ImagePlus className="h-5 w-5" /><span className="text-xs">Add photo</span></>
            }
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageUpload(f);
              e.target.value = "";
            }}
          />
        </div>
        {imgError && <p className="text-xs text-red-500">{imgError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Property Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Listing Status</Label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="rented">Rented</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="property_type">Property Type</Label>
          <select id="property_type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectClass}>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="room">Room</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rent">Monthly Rent ({property.currency})</Label>
          <Input id="rent" type="number" min="1" value={rent} onChange={(e) => setRent(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deposit">Security Deposit ({property.currency})</Label>
          <Input id="deposit" type="number" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" type="number" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Street Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State / Region</Label>
          <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Furnished
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={pets} onChange={(e) => setPets(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Pets Allowed
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-600 font-medium">✓ Changes saved.</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/landlord/properties")}>
          Back to Properties
        </Button>
      </div>
    </form>
  );
}
