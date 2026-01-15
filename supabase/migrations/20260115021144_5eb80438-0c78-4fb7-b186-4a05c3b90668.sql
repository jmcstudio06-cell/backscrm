-- Create function to automatically create gift when user signs up
CREATE OR REPLACE FUNCTION public.create_welcome_gift()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a welcome gift with 10 minutes expiry
  INSERT INTO public.user_gifts (
    user_id,
    gift_type,
    gift_title,
    gift_description,
    is_enabled,
    enabled_at,
    expires_at
  ) VALUES (
    NEW.user_id,
    'agenda_access',
    'AGENDA DE SHOWS',
    'Acesso por tempo indeterminado à Agenda de Shows!',
    true,
    now(),
    now() + INTERVAL '10 minutes'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after profile is created
DROP TRIGGER IF EXISTS create_welcome_gift_trigger ON public.profiles;
CREATE TRIGGER create_welcome_gift_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_welcome_gift();