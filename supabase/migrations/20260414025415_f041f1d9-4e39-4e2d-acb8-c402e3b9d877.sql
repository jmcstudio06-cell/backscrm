
-- Insert missing January 2026 badges
INSERT INTO public.artist_badges (user_id, badge_type, month, year, show_count)
VALUES
  ('910347d3-1f22-4922-8adf-cb61012d1ba6', 'gold', 1, 2026, 32),
  ('c69a000c-815b-44a3-a300-96a5d61a37db', 'silver', 1, 2026, 11),
  ('a9e8da1d-12be-4dd4-9f24-78640d0587fb', 'bronze', 1, 2026, 10);

-- Update archive function to backfill all missing months
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
  
  -- Start from Jan 2026, check every month up to previous month
  check_date := '2026-01-01'::date;
  
  WHILE check_date < date_trunc('month', current_brasil)::date LOOP
    target_month := EXTRACT(MONTH FROM check_date);
    target_year := EXTRACT(YEAR FROM check_date);
    month_start := check_date;
    month_end := (check_date + interval '1 month' - interval '1 day')::date;

    -- Check if already archived
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
        ORDER BY show_count DESC
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
