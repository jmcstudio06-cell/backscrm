
CREATE OR REPLACE FUNCTION public.get_alltime_show_totals()
RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista')::text AS user_name,
    COUNT(*)::bigint AS show_count
  FROM shows s
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.status IN ('confirmed', 'completed', 'scheduled')
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY show_count DESC
  LIMIT 5;
END;
$$;
