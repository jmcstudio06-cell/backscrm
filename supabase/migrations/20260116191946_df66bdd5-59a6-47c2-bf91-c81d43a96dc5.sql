-- Remove the automatic welcome gift trigger
DROP TRIGGER IF EXISTS on_profile_created_gift ON public.profiles;

-- Keep the function for reference but it won't be triggered automatically anymore