
CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking()
RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista') as user_name,
    COUNT(*) as show_count
  FROM shows s
  JOIN profiles p ON p.user_id = s.user_id
  WHERE 
    s.status IN ('confirmed', 'completed', 'scheduled')
    AND date_trunc('month', s.date::timestamp) = date_trunc('month', now())
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY show_count DESC
  LIMIT 3;
$$;
