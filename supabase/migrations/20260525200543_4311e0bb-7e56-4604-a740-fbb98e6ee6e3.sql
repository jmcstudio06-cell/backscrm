
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consultoria_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consultoria_day_of_week smallint,
  ADD COLUMN IF NOT EXISTS consultoria_time text,
  ADD COLUMN IF NOT EXISTS consultoria_activated_at timestamp with time zone;
