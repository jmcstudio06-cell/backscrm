ALTER TABLE public.pending_payments
ADD COLUMN IF NOT EXISTS payer_email text,
ADD COLUMN IF NOT EXISTS gateway_event_id text,
ADD COLUMN IF NOT EXISTS gateway_status text,
ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'infinitepay',
ADD COLUMN IF NOT EXISTS provider_payload jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS pending_payments_gateway_event_id_unique
ON public.pending_payments (gateway_event_id)
WHERE gateway_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS pending_payments_user_status_created_idx
ON public.pending_payments (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS pending_payments_email_status_created_idx
ON public.pending_payments (payer_email, status, created_at DESC);

CREATE INDEX IF NOT EXISTS pending_payments_plan_status_created_idx
ON public.pending_payments (plan_key, status, created_at DESC);