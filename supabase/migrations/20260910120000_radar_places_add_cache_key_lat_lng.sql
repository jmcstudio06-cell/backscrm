-- Adiciona cache_key (chave de cache por CEP+raio), lat e lng à tabela radar_places
ALTER TABLE public.radar_places
  ADD COLUMN IF NOT EXISTS cache_key text,
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric;

-- Preenche cache_key para registros antigos (usa state+city como fallback)
UPDATE public.radar_places
SET cache_key = state || '_' || replace(lower(city), ' ', '_') || '_legacy'
WHERE cache_key IS NULL;

-- Cria índice para acelerar lookup por cache_key + categoria
CREATE INDEX IF NOT EXISTS idx_radar_places_cache_key
  ON public.radar_places (cache_key, category, fetched_at);
