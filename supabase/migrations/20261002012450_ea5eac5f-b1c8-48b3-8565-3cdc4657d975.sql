ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_paid_plan text;

COMMENT ON COLUMN public.profiles.last_paid_plan IS
  'Último plano pago conhecido, preservado quando o status muda para comprou_expirado.';

CREATE OR REPLACE FUNCTION public.preserve_last_paid_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IN (
    'mensal_profissional', 'anual_profissional',
    'mensal_empresarial', 'anual_empresarial',
    'mensal_completo', 'anual_completo',
    'mensal_executivo', 'anual_executivo'
  ) THEN
    NEW.last_paid_plan := NEW.plan;
  ELSIF NEW.last_paid_plan IS NULL AND OLD.plan IN (
    'mensal_profissional', 'anual_profissional',
    'mensal_empresarial', 'anual_empresarial',
    'mensal_completo', 'anual_completo',
    'mensal_executivo', 'anual_executivo'
  ) THEN
    NEW.last_paid_plan := OLD.plan;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS preserve_profiles_last_paid_plan ON public.profiles;
CREATE TRIGGER preserve_profiles_last_paid_plan
BEFORE INSERT OR UPDATE OF plan ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.preserve_last_paid_plan();

UPDATE public.profiles
SET last_paid_plan = plan
WHERE plan IN (
  'mensal_profissional', 'anual_profissional',
  'mensal_empresarial', 'anual_empresarial',
  'mensal_completo', 'anual_completo',
  'mensal_executivo', 'anual_executivo'
)
AND last_paid_plan IS NULL;

UPDATE public.profiles p
SET last_paid_plan = (
  SELECT pp.plan_key
  FROM public.pending_payments pp
  WHERE pp.user_id = p.user_id
    AND pp.status IN ('paid', 'approved', 'completed', 'active')
    AND pp.plan_key IN (
      'mensal_profissional', 'anual_profissional',
      'mensal_empresarial', 'anual_empresarial',
      'mensal_completo', 'anual_completo',
      'mensal_executivo', 'anual_executivo'
    )
  ORDER BY COALESCE(pp.activated_at, pp.created_at) DESC
  LIMIT 1
)
WHERE p.last_paid_plan IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.pending_payments pp
    WHERE pp.user_id = p.user_id
      AND pp.status IN ('paid', 'approved', 'completed', 'active')
      AND pp.plan_key IN (
        'mensal_profissional', 'anual_profissional',
        'mensal_empresarial', 'anual_empresarial',
        'mensal_completo', 'anual_completo',
        'mensal_executivo', 'anual_executivo'
      )
  );

UPDATE public.profiles p
SET last_paid_plan = b.plan
FROM public.profiles_backup_migracao b
WHERE b.user_id = p.user_id
  AND p.last_paid_plan IS NULL
  AND b.plan IN (
    'mensal_profissional', 'anual_profissional',
    'mensal_empresarial', 'anual_empresarial',
    'mensal_completo', 'anual_completo',
    'mensal_executivo', 'anual_executivo'
  );