-- Function to auto-complete shows after their date has passed
CREATE OR REPLACE FUNCTION public.auto_complete_past_shows()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer;
BEGIN
  -- Update shows where date has passed and status is not cancelled or already completed
  UPDATE public.shows
  SET 
    status = 'completed',
    updated_at = now()
  WHERE 
    date < CURRENT_DATE
    AND status IN ('scheduled', 'confirmed', 'pending', 'negotiation')
    AND status != 'cancelled';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$function$;