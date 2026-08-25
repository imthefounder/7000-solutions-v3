-- ============================================================
-- 7000 Solutions Platform v3.0 — Migration 003
-- In-depth content: long descriptions + step-by-step build guides
-- ============================================================

-- Longer, editorial description for the solution detail page
ALTER TABLE public.solutions ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Step-by-step implementation guide per solution
CREATE TABLE IF NOT EXISTS public.solution_guides (
  solution_id UUID PRIMARY KEY REFERENCES public.solutions(id) ON DELETE CASCADE,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{ "title": "...", "detail": "..." }, ...]
  estimated_cost TEXT,
  timeline TEXT,
  partners JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["City Dept of X", ...]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.solution_guides ENABLE ROW LEVEL SECURITY;

-- Anyone can read guides (public catalog)
DROP POLICY IF EXISTS "Anyone can read guides" ON public.solution_guides;
CREATE POLICY "Anyone can read guides" ON public.solution_guides FOR SELECT USING (true);
