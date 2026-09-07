CREATE TABLE public.radar_places (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id text NOT NULL,
  state text NOT NULL,
  city text NOT NULL,
  category text NOT NULL,
  name text NOT NULL,
  address text,
  phone text,
  website text,
  rating numeric,
  rating_count integer,
  place_type text,
  maps_uri text,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (place_id, category)
);

GRANT SELECT ON public.radar_places TO authenticated;
GRANT ALL ON public.radar_places TO service_role;

ALTER TABLE public.radar_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view radar places"
ON public.radar_places FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_radar_places_lookup ON public.radar_places (state, city, category);