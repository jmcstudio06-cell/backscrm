-- Radar contact data is served only through the server-side plan check.
REVOKE SELECT ON public.radar_places FROM authenticated, anon;
DROP POLICY IF EXISTS "Authenticated users can view radar places" ON public.radar_places;
REVOKE ALL ON FUNCTION public.search_radar_places_by_cities(double precision, double precision, text, text[], text[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.search_radar_places(double precision, double precision, double precision, text[]) FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.radar_places TO service_role;
GRANT EXECUTE ON FUNCTION public.search_radar_places_by_cities(double precision, double precision, text, text[], text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.search_radar_places(double precision, double precision, double precision, text[]) TO service_role;