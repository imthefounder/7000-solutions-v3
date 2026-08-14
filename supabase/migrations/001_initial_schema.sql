-- ============================================================
-- 7000 Solutions Platform v3.0 — Supabase Migration
-- Run in: Supabase Dashboard → SQL Editor (or `supabase db push`)
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Solutions table (with location)
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_usage TEXT,
  impact TEXT[],
  embedding VECTOR(1536),
  city TEXT,                      -- 'Detroit' or 'St. Louis' or null for national
  location GEOMETRY(POINT, 4326), -- for proximity queries
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',       -- 'user', 'city_official', 'admin'
  city TEXT,
  organization TEXT,
  karma_balance INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Feedback tracking
CREATE TABLE IF NOT EXISTS solution_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (solution_id, user_id)
);

-- Teaching events (Watch-Build-Teach)
CREATE TABLE IF NOT EXISTS teaching_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Karma transactions log
CREATE TABLE IF NOT EXISTS karma_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;

-- Read-only for all
DROP POLICY IF EXISTS "Anyone can read solutions" ON solutions;
CREATE POLICY "Anyone can read solutions" ON solutions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own feedback" ON solution_feedback;
CREATE POLICY "Users can read own feedback" ON solution_feedback FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON solution_feedback;
CREATE POLICY "Users can insert own feedback" ON solution_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON solution_feedback;
CREATE POLICY "Users can update own feedback" ON solution_feedback FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read teaching events" ON teaching_events;
CREATE POLICY "Anyone can read teaching events" ON teaching_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own teaching" ON teaching_events;
CREATE POLICY "Users can insert own teaching" ON teaching_events FOR INSERT WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Users can read own karma" ON karma_transactions;
CREATE POLICY "Users can read own karma" ON karma_transactions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Functions
-- ============================================================

-- Vector similarity search
CREATE OR REPLACE FUNCTION match_solutions(query_embedding VECTOR(1536), match_threshold FLOAT, match_count INT)
RETURNS TABLE (
  id UUID,
  sprint TEXT,
  category TEXT,
  title TEXT,
  description TEXT,
  ai_usage TEXT,
  impact TEXT[],
  city TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.sprint,
    s.category,
    s.title,
    s.description,
    s.ai_usage,
    s.impact,
    s.city,
    1 - (s.embedding <=> query_embedding) AS similarity
  FROM solutions s
  WHERE 1 - (s.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Spatial proximity search (optional)
CREATE OR REPLACE FUNCTION nearby_solutions(lat FLOAT, lng FLOAT, radius_meters INT, limit_count INT)
RETURNS TABLE (id UUID, title TEXT, distance FLOAT)
LANGUAGE SQL
AS $$
  SELECT id, title,
         ST_Distance(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)) AS distance
  FROM solutions
  WHERE location IS NOT NULL
    AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326), radius_meters)
  ORDER BY distance
  LIMIT limit_count;
$$;

-- Award karma tokens and log the transaction (SECURITY DEFINER so the
-- RLS "read own karma" policy doesn't block the insert)
CREATE OR REPLACE FUNCTION add_karma(target_user_id UUID, amount INT, reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET karma_balance = COALESCE(karma_balance, 0) + amount
  WHERE id = target_user_id;

  INSERT INTO karma_transactions (user_id, amount, reason)
  VALUES (target_user_id, amount, reason);
END;
$$;

-- Find a user's profile id by email (used by TeachingForm; SECURITY DEFINER
-- so regular users can look up students without reading other profiles)
CREATE OR REPLACE FUNCTION find_profile_by_email(target_email TEXT)
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email
  FROM profiles p
  WHERE lower(p.email) = lower(target_email)
  LIMIT 1;
END;
$$;
