
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_settings_setting_key_key'
  ) THEN
    ALTER TABLE public.notification_settings ADD CONSTRAINT notification_settings_setting_key_key UNIQUE (setting_key);
  END IF;
END $$;
