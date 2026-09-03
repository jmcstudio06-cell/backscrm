CREATE OR REPLACE FUNCTION public.slugify_artist_name(_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(translate(_name,
          'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
          'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn')),
        '[^a-z0-9]+', '-', 'g'),
      '-+', '-', 'g')
  );
$$;

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

  base := public.slugify_artist_name(COALESCE(NEW.artist_name, NEW.name, ''));
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

DROP TRIGGER IF EXISTS trg_ensure_profile_slug ON public.profiles;
CREATE TRIGGER trg_ensure_profile_slug
BEFORE INSERT OR UPDATE OF artist_name, name, slug ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_profile_slug();