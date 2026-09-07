CREATE OR REPLACE FUNCTION public.ensure_profile_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  suffix integer := 1;
BEGIN
  IF NEW.slug IS NOT NULL AND length(trim(NEW.slug)) > 0 THEN
    RETURN NEW;
  END IF;

  base := public.slugify_artist_name(COALESCE(NEW.artist_name, ''));
  IF base IS NULL OR length(base) < 2 THEN
    RETURN NEW;
  END IF;

  candidate := base;
  WHILE EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.slug = candidate AND p.user_id <> NEW.user_id
  ) LOOP
    suffix := suffix + 1;
    candidate := base || '-' || suffix;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_profile_slug() FROM PUBLIC, anon, authenticated;