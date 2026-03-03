CREATE OR REPLACE FUNCTION public.auto_complete_past_shows()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer;
BEGIN
  -- Auto-complete apenas shows CONFIRMADOS cujo dia já passou
  UPDATE public.shows
  SET 
    status = 'completed',
    updated_at = now()
  WHERE 
    date < CURRENT_DATE
    AND status = 'confirmed';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$;