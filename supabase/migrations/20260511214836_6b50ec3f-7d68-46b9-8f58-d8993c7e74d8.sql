
CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking()
 RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista') as user_name,
    COUNT(*) as show_count
  FROM shows s
  JOIN profiles p ON p.user_id = s.user_id
  WHERE 
    s.status IN ('confirmed', 'completed', 'scheduled')
    AND date_trunc('month', s.date::timestamp) = date_trunc('month', (now() AT TIME ZONE 'America/Sao_Paulo'))
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY show_count DESC, MAX(s.created_at) ASC
  LIMIT 3;
$function$;

CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking_for_month(target_month integer, target_year integer)
 RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
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
    COUNT(*)::bigint AS show_count
  FROM shows s
  LEFT JOIN profiles p ON p.user_id = s.user_id
  WHERE s.date::date >= month_start
    AND s.date::date <= month_end
    AND s.status IN ('confirmed', 'completed', 'scheduled')
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY COUNT(*) DESC, MAX(s.created_at) ASC
  LIMIT 10;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_yearly_show_totals(target_year integer)
 RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  ORDER BY COUNT(*) DESC, MAX(s.created_at) ASC
  LIMIT 5;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_alltime_show_totals()
 RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  ORDER BY COUNT(*) DESC, MAX(s.created_at) ASC
  LIMIT 5;
END;
$function$;

CREATE OR REPLACE FUNCTION public.archive_monthly_ranking()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  check_date date;
  month_start date;
  month_end date;
  target_month integer;
  target_year integer;
  already_archived boolean;
  archived_count integer := 0;
  r record;
  badge_position integer;
  badge_types text[] := ARRAY['gold', 'silver', 'bronze'];
  current_brasil date;
BEGIN
  current_brasil := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  check_date := '2026-01-01'::date;

  WHILE check_date < date_trunc('month', current_brasil)::date LOOP
    target_month := EXTRACT(MONTH FROM check_date);
    target_year := EXTRACT(YEAR FROM check_date);
    month_start := check_date;
    month_end := (check_date + interval '1 month' - interval '1 day')::date;

    SELECT EXISTS(
      SELECT 1 FROM public.artist_badges
      WHERE month = target_month AND year = target_year
    ) INTO already_archived;

    IF NOT already_archived THEN
      badge_position := 0;
      FOR r IN
        SELECT 
          s.user_id,
          COUNT(*) as show_count
        FROM shows s
        WHERE 
          s.status IN ('confirmed', 'completed')
          AND s.date::date >= month_start
          AND s.date::date <= month_end
        GROUP BY s.user_id
        HAVING COUNT(*) > 0
        ORDER BY COUNT(*) DESC, MAX(s.created_at) ASC
        LIMIT 3
      LOOP
        badge_position := badge_position + 1;
        INSERT INTO public.artist_badges (user_id, badge_type, month, year, show_count)
        VALUES (r.user_id, badge_types[badge_position], target_month, target_year, r.show_count);
        archived_count := archived_count + 1;
      END LOOP;
    END IF;

    check_date := check_date + interval '1 month';
  END LOOP;

  RETURN archived_count;
END;
$function$;
