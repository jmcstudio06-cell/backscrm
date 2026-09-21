CREATE OR REPLACE FUNCTION public.search_radar_places_by_cities(
  p_lat double precision,
  p_lng double precision,
  p_state text,
  p_cities text[],
  p_categories text[]
)
RETURNS TABLE(
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
  city text,
  state text,
  distance_m double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
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
    rp.city,
    rp.state,
    ST_Distance(
      rp.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_m
  FROM public.radar_places rp
  WHERE upper(trim(rp.state)) = upper(trim(p_state))
    AND translate(lower(trim(rp.city)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc') = ANY(
      ARRAY(
        SELECT translate(lower(trim(selected_city)), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')
        FROM unnest(p_cities) AS selected_city
      )
    )
    AND (
      rp.category = ANY(p_categories)
      OR ('casas_de_show' = ANY(p_categories) AND rp.category = 'casas_noturnas')
    )
    AND rp.phone IS NOT NULL
    AND trim(rp.phone) <> ''
    AND rp.geom IS NOT NULL
  ORDER BY distance_m ASC;
$function$;

REVOKE ALL ON FUNCTION public.search_radar_places_by_cities(double precision, double precision, text, text[], text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_radar_places_by_cities(double precision, double precision, text, text[], text[]) TO authenticated, service_role;