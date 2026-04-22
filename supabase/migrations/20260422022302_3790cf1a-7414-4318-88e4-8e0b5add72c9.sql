UPDATE public.shows
SET status = CASE lower(trim(status))
  WHEN 'confirmado' THEN 'confirmed'
  WHEN 'confirmed' THEN 'confirmed'
  WHEN 'pendente' THEN 'pending'
  WHEN 'pending' THEN 'pending'
  WHEN 'agendado' THEN 'scheduled'
  WHEN 'scheduled' THEN 'scheduled'
  WHEN 'negociacao' THEN 'negotiation'
  WHEN 'negociação' THEN 'negotiation'
  WHEN 'negotiation' THEN 'negotiation'
  WHEN 'realizado' THEN 'completed'
  WHEN 'finalizado' THEN 'completed'
  WHEN 'completed' THEN 'completed'
  WHEN 'cancelado' THEN 'cancelled'
  WHEN 'cancelled' THEN 'cancelled'
  ELSE status
END
WHERE status IS NOT NULL
  AND lower(trim(status)) IN (
    'confirmado','confirmed','pendente','pending','agendado','scheduled',
    'negociacao','negociação','negotiation','realizado','finalizado','completed','cancelado','cancelled'
  );