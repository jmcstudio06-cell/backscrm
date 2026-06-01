
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consultoria_preferred_days jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS consultoria_preferred_period text,
  ADD COLUMN IF NOT EXISTS next_consultoria_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_consultoria_type text DEFAULT 'consultoria',
  ADD COLUMN IF NOT EXISTS next_consultoria_notes text;
