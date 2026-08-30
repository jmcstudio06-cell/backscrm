DROP FUNCTION IF EXISTS public.get_monthly_show_ranking_for_month(integer, integer);

CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking_for_month(target_month integer, target_year integer)
RETURNS TABLE(user_id uuid, user_name text, show_count bigint, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    COUNT(*)::bigint AS show_count,
    p.avatar_url::text AS avatar_url
  FROM shows s
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.date::date >= month_start
    AND s.date::date <= month_end
    AND s.status IN ('confirmed', 'completed', 'scheduled')
  GROUP BY s.user_id, p.artist_name, p.name, p.avatar_url
  ORDER BY COUNT(*) DESC, MAX(s.created_at) ASC
  LIMIT 10;
END;
$function$;