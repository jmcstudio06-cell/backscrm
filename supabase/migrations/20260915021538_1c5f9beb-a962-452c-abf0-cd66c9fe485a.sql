CREATE OR REPLACE FUNCTION public.sync_radar_geom()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  ELSE
    NEW.geom = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_radar_geom ON public.radar_places;
CREATE TRIGGER trg_sync_radar_geom
BEFORE INSERT OR UPDATE OF lat, lng ON public.radar_places
FOR EACH ROW
EXECUTE FUNCTION public.sync_radar_geom();

UPDATE public.radar_places
SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL;

REVOKE ALL ON FUNCTION public.sync_radar_geom() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_radar_geom() FROM anon;
REVOKE ALL ON FUNCTION public.sync_radar_geom() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_radar_geom() TO service_role;