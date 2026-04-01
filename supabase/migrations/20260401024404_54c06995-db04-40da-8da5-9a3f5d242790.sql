
-- Fix ranking RPC to use Brazil timezone
CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking()
 RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
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
  ORDER BY show_count DESC
  LIMIT 3;
$$;

-- Function to archive previous month's top 3 as gold/silver/bronze badges
CREATE OR REPLACE FUNCTION public.archive_monthly_ranking()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  prev_month_start date;
  prev_month_end date;
  target_month integer;
  target_year integer;
  already_archived boolean;
  archived_count integer := 0;
  r record;
  badge_position integer := 0;
  badge_types text[] := ARRAY['gold', 'silver', 'bronze'];
BEGIN
  -- Calculate previous month in Brazil timezone
  prev_month_start := date_trunc('month', (now() AT TIME ZONE 'America/Sao_Paulo') - interval '1 month')::date;
  prev_month_end := (date_trunc('month', (now() AT TIME ZONE 'America/Sao_Paulo')) - interval '1 day')::date;
  target_month := EXTRACT(MONTH FROM prev_month_start);
  target_year := EXTRACT(YEAR FROM prev_month_start);

  -- Check if already archived
  SELECT EXISTS(
    SELECT 1 FROM public.artist_badges
    WHERE month = target_month AND year = target_year
  ) INTO already_archived;

  IF already_archived THEN
    RETURN 0;
  END IF;

  -- Get top 3 from previous month
  FOR r IN
    SELECT 
      s.user_id,
      COUNT(*) as show_count
    FROM shows s
    WHERE 
      s.status IN ('confirmed', 'completed')
      AND s.date::date >= prev_month_start
      AND s.date::date <= prev_month_end
    GROUP BY s.user_id
    HAVING COUNT(*) > 0
    ORDER BY show_count DESC
    LIMIT 3
  LOOP
    badge_position := badge_position + 1;
    INSERT INTO public.artist_badges (user_id, badge_type, month, year, show_count)
    VALUES (r.user_id, badge_types[badge_position], target_month, target_year, r.show_count);
    archived_count := archived_count + 1;
  END LOOP;

  RETURN archived_count;
END;
$$;
