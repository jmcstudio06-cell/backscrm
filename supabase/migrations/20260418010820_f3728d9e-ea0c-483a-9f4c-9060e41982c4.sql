DROP INDEX IF EXISTS public.pending_payments_gateway_event_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS pending_payments_gateway_event_id_unique
ON public.pending_payments (gateway_event_id)
WHERE gateway_event_id IS NOT NULL AND btrim(gateway_event_id) <> '';