
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
    3,
    '{
      "dashboard": false,
      "agenda": false,
      "crm": false,
      "clientes": false,
      "orcamentos": true,
      "contratos": true,
      "financeiro": false,
      "historico": false,
      "precificacao": false,
      "checklist": false,
      "mapeamento-palco": true,
      "equipe": false,
      "metas": false,
      "repertorio": false,
      "aulas": false,
      "avancos": false,
      "tutoriais": false,
      "configuracoes": false
    }'::jsonb
  );
  RETURN new;
END;
$function$;
