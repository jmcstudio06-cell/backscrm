
-- Public function to get occupied dates for an artist (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_artist_occupied_dates(artist_user_id uuid)
RETURNS TABLE(show_date date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT date
  FROM public.shows
  WHERE user_id = artist_user_id
    AND status IN ('confirmed', 'scheduled', 'completed')
    AND date >= CURRENT_DATE;
$$;
