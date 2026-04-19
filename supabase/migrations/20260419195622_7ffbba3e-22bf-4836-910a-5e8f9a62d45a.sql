-- Function to expire trials older than 1 hour
CREATE OR REPLACE FUNCTION public.expire_old_trials()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE public.profiles
  SET 
    plan = 'expirado',
    updated_at = now()
  WHERE 
    plan = 'trial'
    AND COALESCE(trial_start, created_at) < (now() - interval '1 hour');

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Schedule it via pg_cron to run every 5 minutes
DO $$
BEGIN
  -- Ensure extensions
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Remove any prior schedule with same name
  PERFORM cron.unschedule('expire-old-trials-every-5min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-old-trials-every-5min');

  PERFORM cron.schedule(
    'expire-old-trials-every-5min',
    '*/5 * * * *',
    $cron$ SELECT public.expire_old_trials(); $cron$
  );
END $$;