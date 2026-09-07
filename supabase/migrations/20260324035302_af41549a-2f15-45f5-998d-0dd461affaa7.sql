
CREATE TABLE public.artist_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL DEFAULT 'top1_monthly',
  month integer NOT NULL,
  year integer NOT NULL,
  show_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type, month, year)
);

ALTER TABLE public.artist_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view badges"
  ON public.artist_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only service role can insert badges"
  ON public.artist_badges FOR INSERT
  TO authenticated
  WITH CHECK (false);
