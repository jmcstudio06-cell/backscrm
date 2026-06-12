ALTER TABLE public.guide_leads
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS shows_per_month text,
  ADD COLUMN IF NOT EXISTS source text;