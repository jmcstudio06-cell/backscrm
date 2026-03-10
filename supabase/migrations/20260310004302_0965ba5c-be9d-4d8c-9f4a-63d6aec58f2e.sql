
-- Fix link-agenda for all "completo" tier plans (mensal_completo, anual_completo, etc.)
UPDATE public.profiles
SET feature_blocks = feature_blocks || '{"link-agenda": false}'::jsonb
WHERE plan ILIKE '%completo%'
  AND feature_blocks->>'link-agenda' = 'true';
