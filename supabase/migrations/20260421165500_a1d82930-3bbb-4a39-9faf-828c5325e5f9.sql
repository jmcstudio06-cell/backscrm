CREATE OR REPLACE FUNCTION public.expire_old_trials()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  expired_count integer;
  all_blocked jsonb := '{
    "dashboard": true,
    "agenda": true,
    "crm": true,
    "clientes": true,
    "orcamentos": true,
    "servicos": true,
    "contratos": true,
    "financeiro": true,
    "historico": true,
    "precificacao": true,
    "checklist": true,
    "mapeamento-palco": true,
    "equipe": true,
    "metas": true,
    "repertorio": true,
    "aulas": true,
    "avancos": true,
    "tutoriais": true,
    "configuracoes": true,
    "link-agenda": true,
    "bonus": true,
    "ideias-post": true,
    "metas-anuais": true
  }'::jsonb;
BEGIN
  UPDATE public.profiles
  SET 
    plan = 'expirado',
    feature_blocks = all_blocked,
    updated_at = now()
  WHERE 
    plan = 'trial'
    AND COALESCE(trial_start, created_at) < (now() - interval '1 hour');

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$function$;