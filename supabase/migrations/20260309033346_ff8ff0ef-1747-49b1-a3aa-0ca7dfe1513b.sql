
ALTER TABLE public.performance_types
  ADD COLUMN IF NOT EXISTS visible_online boolean NOT NULL DEFAULT true;
