
CREATE OR REPLACE FUNCTION public.get_full_monthly_show_ranking(target_month integer, target_year integer)
 RETURNS TABLE(user_id uuid, user_name text, user_email text, show_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  month_start date;
  month_end date;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'access denied';
  END IF;

  month_start := make_date(target_year, target_month, 1);
  month_end := (month_start + interval '1 month' - interval '1 day')::date;

  RETURN QUERY
  SELECT
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista')::text AS user_name,
    p.email::text AS user_email,
    COUNT(*)::bigint AS show_count
  FROM shows s
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.date::date >= month_start
    AND s.date::date <= month_end
    AND s.status IN ('confirmed', 'completed', 'scheduled')
  GROUP BY s.user_id, p.artist_name, p.name, p.email
  HAVING COUNT(*) >= 1
  ORDER BY COUNT(*) DESC, MAX(s.created_at) ASC;
END;
$function$;
