-- Create notification settings table for automation configurations
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB DEFAULT '{}',
  notification_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification history table
CREATE TABLE public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  notification_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' or automation type
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'active', 'inactive'
  users_reached INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user push subscriptions table
CREATE TABLE public.user_push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings (admin only)
CREATE POLICY "Admins can view notification settings"
ON public.notification_settings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage notification settings"
ON public.notification_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_history (admin only)
CREATE POLICY "Admins can view notification history"
ON public.notification_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage notification history"
ON public.notification_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_push_subscriptions
CREATE POLICY "Users can manage their own subscriptions"
ON public.user_push_subscriptions FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.user_push_subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_push_subscriptions_updated_at
BEFORE UPDATE ON public.user_push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default automation settings
INSERT INTO public.notification_settings (setting_key, is_enabled, notification_text, config) VALUES
('show_reminder', false, '🎤 Seu show "{show_title}" é amanhã! Não esqueça de conferir o checklist.', '{"hours_before": 24}'),
('pending_payment', false, '💰 Você tem cachês pendentes! Confira os shows realizados que ainda não foram pagos.', '{}'),
('monthly_goal', false, '🎯 Você está quase lá! Faltam apenas {remaining} shows para bater sua meta do mês.', '{}'),
('inactivity', false, '👋 Sentimos sua falta! Volte para organizar sua carreira e não perder oportunidades.', '{"days_inactive": 7}');