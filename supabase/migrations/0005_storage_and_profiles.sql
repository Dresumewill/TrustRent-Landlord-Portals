-- ============================================================
-- TrustRent — Storage Buckets + Extra Profile Columns
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- USERS — extra document URL columns
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS utility_bill_url   text,
  ADD COLUMN IF NOT EXISTS tax_clearance_url  text;

-- ──────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ──────────────────────────────────────────────────────────────

-- Private bucket for landlord identity documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'landlord-documents',
  'landlord-documents',
  false,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Public bucket for property listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,   -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,   -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- STORAGE RLS — landlord-documents (private)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "Landlords can upload own documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'landlord-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Landlords can overwrite own documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'landlord-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Landlords and admins can view landlord documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'landlord-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- STORAGE RLS — property-images (public)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can update own property images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- ──────────────────────────────────────────────────────────────
-- STORAGE RLS — avatars (public)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
