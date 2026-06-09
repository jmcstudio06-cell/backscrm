-- Update transactions FK to cascade on show deletion
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_show_id_fkey;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_show_id_fkey
  FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE;

-- Clean up legacy auto-generated transactions that were orphaned by previous deletes
DELETE FROM public.transactions
WHERE show_id IS NULL
  AND category = 'Show'
  AND (
    description ILIKE 'Cachê: %' OR
    description ILIKE 'Cachê antecipado: %' OR
    description ILIKE 'Cachê pendente: %'
  );