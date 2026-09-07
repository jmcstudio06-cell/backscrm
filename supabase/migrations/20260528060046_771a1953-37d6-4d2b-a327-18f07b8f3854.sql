
-- Update trial duration from 3 days to 4 hours
CREATE OR REPLACE FUNCTION public.expire_old_trials()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  expired_count integer;
  all_blocked jsonb := '{
    "dashboard": true, "agenda": true, "crm": true, "clientes": true,
    "orcamentos": true, "servicos": true, "contratos": true, "financeiro": true,
    "historico": true, "precificacao": true, "checklist": true,
    "mapeamento-palco": true, "equipe": true, "metas": true, "repertorio": true,
    "aulas": true, "avancos": true, "tutoriais": true, "configuracoes": true,
    "link-agenda": true, "bonus": true, "ideias-post": true, "metas-anuais": true
  }'::jsonb;
BEGIN
  UPDATE public.profiles
  SET 
    plan = 'expirado',
    feature_blocks = all_blocked,
    updated_at = now()
  WHERE 
    plan = 'trial'
    AND COALESCE(trial_start, created_at) < (now() - interval '4 hours');

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, phone, plan, trial_start, trial_days, feature_blocks)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    'trial',
    now(),
    0,
    '{
      "dashboard": false, "agenda": false, "crm": false, "clientes": false,
      "orcamentos": true, "servicos": true, "contratos": true, "financeiro": false,
      "historico": false, "precificacao": false, "checklist": false,
      "mapeamento-palco": true, "equipe": false, "metas": false, "repertorio": false,
      "aulas": false, "avancos": false, "tutoriais": false, "configuracoes": false
    }'::jsonb
  );
  RETURN new;
END;
$function$;
