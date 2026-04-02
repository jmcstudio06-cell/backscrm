
CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking_for_month(target_month int, target_year int)
RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  month_start date;
  month_end date;
BEGIN
  month_start := make_date(target_year, target_month, 1);
  month_end := (month_start + interval '1 month' - interval '1 day')::date;

  RETURN QUERY
  SELECT
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista')::text AS user_name,
    COUNT(*)::bigint AS show_count
  FROM shows s
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.date::date >= month_start
    AND s.date::date <= month_end
    AND s.status IN ('confirmed', 'completed', 'scheduled')
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY show_count DESC
  LIMIT 10;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_yearly_show_totals(target_year int)
RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_start date;
  year_end date;
BEGIN
  year_start := make_date(target_year, 1, 1);
  year_end := make_date(target_year, 12, 31);

  RETURN QUERY
  SELECT
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista')::text AS user_name,
    COUNT(*)::bigint AS show_count
  FROM shows s
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.date::date >= year_start
    AND s.date::date <= year_end
    AND s.status IN ('confirmed', 'completed', 'scheduled')
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY show_count DESC
  LIMIT 5;
END;
$$;
