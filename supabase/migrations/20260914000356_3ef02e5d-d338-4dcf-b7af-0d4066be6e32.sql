CREATE OR REPLACE FUNCTION public.search_radar_places(
  p_lat double precision,
  p_lng double precision,
  p_radius_m double precision,
  p_categories text[]
)
RETURNS TABLE (
  place_id text,
  name text,
  address text,
  phone text,
  website text,
  rating numeric,
  rating_count integer,
  place_type text,
  maps_uri text,
  lat double precision,
  lng double precision,
  category text,
  distance_m double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    rp.place_id,
    rp.name,
    rp.address,
    rp.phone,
    rp.website,
    rp.rating,
    rp.rating_count,
    rp.place_type,
    rp.maps_uri,
    rp.lat,
    rp.lng,
    rp.category,
    ST_Distance(
      rp.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_m
  FROM public.radar_places rp
  WHERE rp.category = ANY(p_categories)
    AND rp.phone IS NOT NULL
    AND rp.geom IS NOT NULL
    AND ST_DWithin(
      rp.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m
    )
  ORDER BY distance_m ASC;
$$;

REVOKE ALL ON FUNCTION public.search_radar_places(double precision, double precision, double precision, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_radar_places(double precision, double precision, double precision, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_radar_places(double precision, double precision, double precision, text[]) TO service_role;