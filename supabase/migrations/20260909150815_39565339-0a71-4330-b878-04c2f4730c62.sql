CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.expire_due_plans()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total integer := 0;
  n integer := 0;
  all_blocked jsonb := '{
    "dashboard": true, "agenda": true, "crm": true, "clientes": true,
    "orcamentos": true, "servicos": true, "contratos": true, "financeiro": true,
    "historico": true, "precificacao": true, "checklist": true,
    "mapeamento-palco": true, "equipe": true, "metas": true, "repertorio": true,
    "aulas": true, "avancos": true, "tutoriais": true, "configuracoes": true,
    "link-agenda": true, "link-instagram": true, "link-orcamento": true,
    "assinatura-digital": true, "backs-radar": true, "usuarios": true,
    "bonus": true, "ideias-post": true, "metas-anuais": true
  }'::jsonb;
BEGIN
  -- Trial de 3 horas -> expirado
  UPDATE public.profiles
  SET plan = 'expirado',
      feature_blocks = all_blocked,
      updated_at = now()
  WHERE plan = 'trial'
    AND COALESCE(trial_start, created_at) < (now() - interval '3 hours');
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;

  -- Planos pagos com prazo encerrado -> comprou_expirado
  UPDATE public.profiles
  SET plan = 'comprou_expirado',
      feature_blocks = all_blocked,
      updated_at = now()
  WHERE plan IS NOT NULL
    AND plan NOT IN ('trial', 'expirado', 'comprou_expirado', 'parceiros')
    AND trial_start IS NOT NULL
    AND COALESCE(trial_days, 30) > 0
    AND trial_start < (now() - (COALESCE(trial_days, 30) || ' days')::interval);
  GET DIAGNOSTICS n = ROW_COUNT;
  total := total + n;

  RETURN total;
END;
$function$;

SELECT cron.unschedule(jobname)
FROM cron.job
WHERE jobname IN ('expire-old-trials-hourly', 'expire-due-plans-hourly');

SELECT cron.schedule(
  'expire-due-plans-hourly',
  '5 * * * *',
  $$ SELECT public.expire_due_plans(); $$
);

SELECT public.expire_due_plans();