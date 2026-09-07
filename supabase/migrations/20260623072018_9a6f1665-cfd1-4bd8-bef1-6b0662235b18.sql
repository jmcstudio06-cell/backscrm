CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created_desc
ON public.user_notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date_created_desc
ON public.transactions (user_id, date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_goals_user_created_desc
ON public.goals (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clients_user_created_desc
ON public.clients (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shows_status_date_user_created
ON public.shows (status, date, user_id, created_at);

CREATE OR REPLACE FUNCTION public.get_monthly_show_ranking()
RETURNS TABLE(user_id uuid, user_name text, show_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH bounds AS (
    SELECT
      date_trunc('month', (now() AT TIME ZONE 'America/Sao_Paulo'))::date AS month_start,
      (date_trunc('month', (now() AT TIME ZONE 'America/Sao_Paulo')) + interval '1 month')::date AS month_end
  )
  SELECT 
    s.user_id,
    COALESCE(p.artist_name, p.name, 'Artista') as user_name,
    COUNT(*) as show_count
  FROM public.shows s
  JOIN public.profiles p ON p.user_id = s.user_id
  CROSS JOIN bounds b
  WHERE 
    s.status IN ('confirmed', 'completed', 'scheduled')
    AND s.date >= b.month_start
    AND s.date < b.month_end
  GROUP BY s.user_id, p.artist_name, p.name
  ORDER BY show_count DESC, MAX(s.created_at) ASC
  LIMIT 3;
$function$;