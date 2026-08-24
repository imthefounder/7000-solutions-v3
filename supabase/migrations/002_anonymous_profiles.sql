-- ============================================================
-- 7000 Solutions Platform v3.0 — Migration 002
-- Anonymous prototype mode: feedback/teaching/karma work without
-- sign-in via a per-browser visitor id.
-- ============================================================

-- Anonymous profiles can't reference auth.users (FK), so drop the link.
-- The auth signup trigger still creates profile rows for real users;
-- this just allows standalone rows for anonymous visitors.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Create a profile row for an anonymous visitor (idempotent).
CREATE OR REPLACE FUNCTION public.ensure_anonymous_profile(anon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (anon_id)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Find a student by email, creating a profile row on first use
-- (used by the teaching flow; SECURITY DEFINER so anonymous callers
-- can look up / create students without reading other profiles).
CREATE OR REPLACE FUNCTION public.find_or_create_profile_by_email(target_email TEXT)
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (gen_random_uuid(), lower(target_email))
  ON CONFLICT (email) DO NOTHING;
  RETURN QUERY
  SELECT p.id, p.email
  FROM public.profiles p
  WHERE lower(p.email) = lower(target_email)
  LIMIT 1;
END;
$$;

-- Idempotent seeding: unique (title, city) — NULL city normalized to ''
-- so national solutions dedupe too.
CREATE UNIQUE INDEX IF NOT EXISTS solutions_title_city_key
  ON public.solutions (title, COALESCE(city, ''));

-- Grant execution to anonymous + authenticated roles
GRANT EXECUTE ON FUNCTION public.ensure_anonymous_profile(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_or_create_profile_by_email(TEXT) TO anon, authenticated;
