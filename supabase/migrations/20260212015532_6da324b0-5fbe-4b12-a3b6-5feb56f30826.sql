
-- Insert new notification setting types (if not exist)
INSERT INTO public.notification_settings (setting_key, is_enabled, config, notification_text)
VALUES 
  ('goal_reminder', false, '{"interval_days": 10}'::jsonb, '🎯 {user_name}, como estão suas metas? Faz {interval_days} dias que não confere. Bora manter o foco!'),
  ('low_performance', false, '{}'::jsonb, '📉 {user_name}, seu desempenho está abaixo do esperado. Que tal agendar mais shows?')
ON CONFLICT DO NOTHING;

-- Also ensure existing settings exist
INSERT INTO public.notification_settings (setting_key, is_enabled, config, notification_text)
VALUES 
  ('show_reminder', false, '{"hours_before": 24}'::jsonb, '🎤 {user_name}, seu show "{show_title}" é amanhã! Tudo pronto?'),
  ('pending_payment', false, '{}'::jsonb, '💰 {user_name}, você tem cachês pendentes. Confira no financeiro!'),
  ('monthly_goal', false, '{}'::jsonb, '📊 {user_name}, sua meta mensal precisa de atenção!'),
  ('inactivity', false, '{"days_inactive": 7}'::jsonb, '👋 {user_name}, sentimos sua falta! Que tal dar uma olhada na sua agenda?')
ON CONFLICT DO NOTHING;

-- Create function to cleanup old notification history (48h)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.notification_history
  WHERE sent_at < NOW() - INTERVAL '48 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
