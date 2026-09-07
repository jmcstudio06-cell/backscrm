ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS radar_state text,
  ADD COLUMN IF NOT EXISTS radar_city text,
  ADD COLUMN IF NOT EXISTS radar_cep text,
  ADD COLUMN IF NOT EXISTS radar_configured_at timestamptz;