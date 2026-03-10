
-- Add "link-agenda" key to all existing profiles that don't have it yet
-- For completo plans: unblocked (false)
-- For all other plans: blocked (true)

UPDATE public.profiles
SET feature_blocks = feature_blocks || '{"link-agenda": false}'::jsonb
WHERE plan IN ('completo', 'completo_mensal', 'completo_anual')
  AND (feature_blocks IS NULL OR NOT feature_blocks ? 'link-agenda');

UPDATE public.profiles
SET feature_blocks = feature_blocks || '{"link-agenda": true}'::jsonb
WHERE (plan NOT IN ('completo', 'completo_mensal', 'completo_anual') OR plan IS NULL)
  AND feature_blocks IS NOT NULL
  AND NOT feature_blocks ? 'link-agenda';
