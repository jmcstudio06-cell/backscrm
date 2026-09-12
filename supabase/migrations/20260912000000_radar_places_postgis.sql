-- ============================================================
-- Backs Radar: migra para PostGIS + dados do OpenStreetMap
-- ============================================================

-- 1. Habilita PostGIS (já disponível no Supabase, só precisa ativar)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Adiciona colunas de coordenadas na radar_places (se não existirem)
ALTER TABLE public.radar_places
  ADD COLUMN IF NOT EXISTS lat  double precision,
  ADD COLUMN IF NOT EXISTS lng  double precision,
  ADD COLUMN IF NOT EXISTS osm_id text,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'google'; -- 'google' | 'osm'

-- 3. Coluna geográfica calculada automaticamente a partir de lat/lng
ALTER TABLE public.radar_places
  ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- Popula geom para linhas já existentes que tenham lat/lng
UPDATE public.radar_places
  SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  WHERE lat IS NOT NULL AND lng IS NOT NULL AND geom IS NULL;

-- 4. Trigger para manter geom sempre sincronizado com lat/lng
CREATE OR REPLACE FUNCTION sync_radar_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_radar_geom ON public.radar_places;
CREATE TRIGGER trg_sync_radar_geom
  BEFORE INSERT OR UPDATE OF lat, lng ON public.radar_places
  FOR EACH ROW EXECUTE FUNCTION sync_radar_geom();

-- 5. Índice espacial GIST para buscas por raio (ST_DWithin) ultra-rápidas
CREATE INDEX IF NOT EXISTS idx_radar_places_geom
  ON public.radar_places USING GIST (geom);

-- 6. Índice para busca por estado + categoria (filtro comum)
CREATE INDEX IF NOT EXISTS idx_radar_places_state_cat
  ON public.radar_places (state, category);

-- 7. Índice para deduplicação por osm_id
CREATE INDEX IF NOT EXISTS idx_radar_places_osm_id
  ON public.radar_places (osm_id)
  WHERE osm_id IS NOT NULL;

-- 8. Unique constraint para OSM (além do place_id,category já existente)
-- Não duplica o mesmo lugar OSM na mesma categoria
ALTER TABLE public.radar_places
  DROP CONSTRAINT IF EXISTS uq_radar_osm_category;

ALTER TABLE public.radar_places
  ADD CONSTRAINT uq_radar_osm_category
  UNIQUE (osm_id, category)
  DEFERRABLE INITIALLY DEFERRED;

-- 9. Função de busca por raio usando PostGIS
-- Retorna locais dentro de radius_km km a partir de lat/lng
-- Só retorna locais COM telefone
CREATE OR REPLACE FUNCTION search_radar_places(
  p_lat       double precision,
  p_lng       double precision,
  p_radius_m  double precision,
  p_categories text[]
)
RETURNS TABLE (
  place_id    text,
  name        text,
  address     text,
  phone       text,
  website     text,
  rating      numeric,
  rating_count integer,
  place_type  text,
  maps_uri    text,
  lat         double precision,
  lng         double precision,
  category    text,
  distance_m  double precision
)
LANGUAGE sql STABLE AS $$
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
  WHERE
    rp.category = ANY(p_categories)
    AND rp.phone IS NOT NULL
    AND rp.geom IS NOT NULL
    AND ST_DWithin(
      rp.geom::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_m
    )
  ORDER BY distance_m ASC
  LIMIT 200;
$$;

-- Permissão para a função ser chamada pelo service_role (edge functions)
GRANT EXECUTE ON FUNCTION search_radar_places TO service_role;
GRANT EXECUTE ON FUNCTION search_radar_places TO authenticated;
