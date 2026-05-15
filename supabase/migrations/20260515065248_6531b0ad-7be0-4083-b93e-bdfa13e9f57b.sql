-- Deactivate stale duplicate push subscriptions: for each endpoint, keep only
-- the most recently updated active row; deactivate others (older user rows).
WITH ranked AS (
  SELECT id,
         endpoint,
         is_active,
         ROW_NUMBER() OVER (
           PARTITION BY endpoint
           ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
         ) AS rn
  FROM public.user_push_subscriptions
  WHERE is_active = true
)
UPDATE public.user_push_subscriptions p
SET is_active = false,
    updated_at = now()
FROM ranked r
WHERE p.id = r.id
  AND r.rn > 1;