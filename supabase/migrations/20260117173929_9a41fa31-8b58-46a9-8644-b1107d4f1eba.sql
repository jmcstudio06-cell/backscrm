-- Create gift campaign settings in app_settings if not exists
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('gift_auto_campaign_active', 'false')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger function to auto-create gift on signup when campaign is active
CREATE OR REPLACE FUNCTION public.auto_create_gift_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  campaign_active boolean;
BEGIN
  -- Check if campaign is active
  SELECT (setting_value = 'true') INTO campaign_active
  FROM public.app_settings
  WHERE setting_key = 'gift_auto_campaign_active';
  
  -- If campaign is active, create a gift for the new user
  IF campaign_active = true THEN
    INSERT INTO public.user_gifts (user_id, gift_type, gift_title, gift_description, is_enabled, enabled_at, expires_at)
    VALUES (
      NEW.user_id,
      'agenda_access',
      'Agenda Ilimitada',
      'Acesso completo à agenda por tempo indeterminado',
      true,
      now(),
      now() + interval '10 minutes'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_created_auto_gift ON public.profiles;
CREATE TRIGGER on_profile_created_auto_gift
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_gift_on_signup();