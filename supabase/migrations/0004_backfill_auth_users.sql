-- ============================================================
-- TrustRent — Backfill public.users from auth.users
-- Fixes: foreign key constraint violations for users who signed
-- up before the handle_new_user trigger was applied.
-- ============================================================

INSERT INTO public.users (id, email, full_name, avatar_url, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.raw_user_meta_data->>'avatar_url',
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'tenant')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);
