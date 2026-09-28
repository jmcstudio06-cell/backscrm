ALTER TABLE public.profiles ALTER COLUMN last_seen DROP DEFAULT;
-- Previously the registration timestamp was automatically recorded as a visit.
-- Clear only timestamps effectively identical to registration; real later visits remain intact.
UPDATE public.profiles SET last_seen = NULL WHERE last_seen IS NOT NULL AND abs(extract(epoch FROM (last_seen - created_at))) <= 2;