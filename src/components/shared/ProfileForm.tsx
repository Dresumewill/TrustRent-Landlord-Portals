"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Camera, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  avatar_url: string | null;
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName]   = useState(profile.full_name ?? "");
  const [phone, setPhone]         = useState(profile.phone ?? "");
  const [bio, setBio]             = useState(profile.bio ?? "");
  const [city, setCity]           = useState(profile.city ?? "");
  const [state, setState]         = useState(profile.state ?? "");
  const [country, setCountry]     = useState(profile.country ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [loading, setLoading]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleAvatarUpload(file: File) {
    setAvatarUploading(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setError(uploadErr.message);
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl);
    await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", profile.id);
    setAvatarUploading(false);
  }

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const supabase = createClient();
    const { error: updateErr } = await supabase
      .from("users")
      .update({
        full_name:  fullName || null,
        phone:      phone || null,
        bio:        bio || null,
        city:       city || null,
        state:      state || null,
        country:    country || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setSaved(true);
    }
    setLoading(false);
  }

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile.email[0].toUpperCase();

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-xl flex items-center justify-center">
              {initials}
            </div>
          )}
          <button
            type="button"
            disabled={avatarUploading}
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50"
          >
            {avatarUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleAvatarUpload(f);
              e.target.value = "";
            }}
          />
        </div>
        <div>
          <p className="font-semibold">{profile.full_name ?? "Your Name"}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Click the camera icon to change your photo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            placeholder="Adaora Okonkwo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={3}
          placeholder="Tell landlords or tenants a little about yourself…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Lagos" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">State / Region</Label>
          <Input id="state" placeholder="Lagos" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" placeholder="Nigeria" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-600 font-medium">✓ Profile updated.</p>}

      <div className="pt-1">
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
