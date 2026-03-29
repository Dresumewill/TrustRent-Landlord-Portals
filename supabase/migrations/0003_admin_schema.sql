-- ============================================================
-- TrustRent — Admin Schema Additions
-- ============================================================

-- Add 'resolved' to transaction_status (if not already present)
ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'disputed';
ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'resolved';

-- ──────────────────────────────────────────────────────────────
-- TRANSACTIONS — admin decision columns
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS admin_resolved_by  uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS admin_resolved_at  timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notes        text,
  ADD COLUMN IF NOT EXISTS dispute_evidence   jsonb DEFAULT '{}'::jsonb;

-- ──────────────────────────────────────────────────────────────
-- USERS — verification document columns
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS id_document_url   text,
  ADD COLUMN IF NOT EXISTS deed_document_url text,
  ADD COLUMN IF NOT EXISTS rejection_reason  text;

-- ──────────────────────────────────────────────────────────────
-- RLS POLICIES — Admin full access
-- ──────────────────────────────────────────────────────────────

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Users: admins can read and update all
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- Properties: admins can view all
CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all properties"
  ON public.properties FOR UPDATE
  USING (public.is_admin());

-- Applications: admins can view all
CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  USING (public.is_admin());

-- Transactions: admins can view and update all
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_admin());
