
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
    'free',
    now(),
    99999,
    '{
      "dashboard": false,
      "agenda": false,
      "crm": true,
      "clientes": true,
      "orcamentos": true,
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
      "tutoriais": false,
      "configuracoes": false
    }'::jsonb
  );
  RETURN new;
END;
$function$;
