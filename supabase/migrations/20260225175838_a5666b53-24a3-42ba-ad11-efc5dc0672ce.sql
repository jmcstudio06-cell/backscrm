
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
      "dashboard": true,
      "agenda": true,
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
      "tutoriais": true,
      "configuracoes": true
    }'::jsonb
  );
  RETURN new;
END;
$function$;
