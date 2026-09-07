SELECT cron.unschedule('run-automated-notifications-hourly');
SELECT cron.schedule(
  'run-automated-notifications-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nwewheihdqfwsobompnp.supabase.co/functions/v1/run-automated-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);