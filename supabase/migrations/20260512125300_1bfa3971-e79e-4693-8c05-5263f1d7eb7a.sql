
-- Add stage tracking column for budgets kanban
ALTER TABLE public.budgets
ADD COLUMN IF NOT EXISTS stage_changed_at timestamptz NOT NULL DEFAULT now();

-- Migrate existing statuses to new kanban stages
UPDATE public.budgets SET status = 'created' WHERE status IN ('draft', 'pending');
UPDATE public.budgets SET status = 'sold' WHERE status = 'approved';
UPDATE public.budgets SET status = 'archived' WHERE status = 'rejected';

-- Auto-archive function (orçamentos > 30 dias na etapa)
CREATE OR REPLACE FUNCTION public.auto_archive_old_budgets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.budgets
  SET status = 'archived',
      stage_changed_at = now(),
      updated_at = now()
  WHERE status <> 'archived'
    AND stage_changed_at < (now() - interval '30 days');
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
