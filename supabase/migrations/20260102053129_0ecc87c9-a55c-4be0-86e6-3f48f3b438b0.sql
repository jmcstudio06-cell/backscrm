-- Update handle_new_user function to set trial plan and create feature blocks automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with trial plan
  INSERT INTO public.profiles (user_id, email, name, phone, plan, trial_start, trial_days)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    'trial',
    now(),
    3
  );
  
  -- Create feature blocks for trial users
  -- Block: orcamentos, contratos, precificacao, checklist, mapeamento-palco
  INSERT INTO public.user_feature_blocks (user_id, feature_key, blocked) VALUES
    (new.id, 'dashboard', false),
    (new.id, 'agenda', false),
    (new.id, 'crm', false),
    (new.id, 'clientes', false),
    (new.id, 'orcamentos', true),
    (new.id, 'contratos', true),
    (new.id, 'financeiro', false),
    (new.id, 'historico', false),
    (new.id, 'precificacao', true),
    (new.id, 'checklist', true),
    (new.id, 'mapeamento-palco', true),
    (new.id, 'equipe', false),
    (new.id, 'metas', false),
    (new.id, 'repertorio', false),
    (new.id, 'aulas', false),
    (new.id, 'tutoriais', false),
    (new.id, 'configuracoes', false);
  
  RETURN new;
END;
$function$;