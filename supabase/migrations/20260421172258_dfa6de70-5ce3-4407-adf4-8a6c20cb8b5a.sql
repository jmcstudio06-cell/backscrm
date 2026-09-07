-- 1) Garantir que transactions e shows sejam publicados via realtime
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.shows REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shows;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 2) Reparo retroativo: criar transação de cachê para todos os shows
--    com status 'confirmed' que ainda não possuem income vinculado.
INSERT INTO public.transactions (user_id, show_id, type, amount, category, description, date, is_advance_payment)
SELECT 
  s.user_id,
  s.id,
  'income',
  s.cachet,
  'Show',
  'Cachê: ' || s.title,
  s.date,
  false
FROM public.shows s
WHERE s.status = 'confirmed'
  AND s.cachet > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.transactions t 
    WHERE t.show_id = s.id AND t.type = 'income'
  );