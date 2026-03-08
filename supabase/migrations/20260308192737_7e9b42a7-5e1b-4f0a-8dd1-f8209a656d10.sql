-- Add "servicos" key to all existing profiles' feature_blocks
-- Copy the value from "orcamentos" if it exists, otherwise default to false
UPDATE public.profiles
SET feature_blocks = feature_blocks || jsonb_build_object('servicos', COALESCE((feature_blocks->>'orcamentos')::boolean, false))
WHERE feature_blocks IS NOT NULL
  AND NOT (feature_blocks ? 'servicos');

-- Update handle_new_user to include "servicos" key
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
      "servicos": true,
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