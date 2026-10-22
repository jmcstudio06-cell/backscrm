-- The hourly automation job pointed to the old project (nwewheihdqfwsobompnp), which no longer exists.
-- Re-create it by name against the current project. The function itself rejects any caller that is not
-- the service key or an admin, so a missing/wrong vault secret fails closed (401) instead of sending.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'run-automated-notifications-hourly') THEN
    PERFORM cron.unschedule('run-automated-notifications-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'run-automated-notifications-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rbeqekyklbdaeswlfruw.supabase.co/functions/v1/run-automated-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
