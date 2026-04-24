CREATE INDEX IF NOT EXISTS idx_shows_user_id_date ON public.shows (user_id, date);
CREATE INDEX IF NOT EXISTS idx_shows_user_id_status ON public.shows (user_id, status);