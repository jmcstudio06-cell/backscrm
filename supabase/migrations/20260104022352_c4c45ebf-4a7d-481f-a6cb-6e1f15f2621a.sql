-- ================================================
-- OTIMIZAÇÃO 1: Consolidar user_feature_blocks
-- Migrar de múltiplos registros para JSON compacto
-- ================================================

-- 1. Adicionar coluna JSON para features (temporário durante migração)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS feature_blocks jsonb DEFAULT '{
  "dashboard": false,
  "agenda": false,
  "crm": false,
  "clientes": false,
  "orcamentos": true,
  "contratos": true,
  "financeiro": false,
  "historico": false,
  "precificacao": true,
  "checklist": true,
  "mapeamento-palco": true,
  "equipe": false,
  "metas": false,
  "repertorio": false,
  "aulas": false,
  "tutoriais": false,
  "configuracoes": false
}'::jsonb;

-- 2. Migrar dados existentes para o novo formato JSON
UPDATE public.profiles p
SET feature_blocks = (
  SELECT jsonb_object_agg(ufb.feature_key, ufb.blocked)
  FROM public.user_feature_blocks ufb
  WHERE ufb.user_id = p.user_id
)
WHERE EXISTS (
  SELECT 1 FROM public.user_feature_blocks ufb WHERE ufb.user_id = p.user_id
);

-- 3. Atualizar função handle_new_user para usar o novo formato
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile with trial plan and feature blocks as JSON
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
      "precificacao": true,
      "checklist": true,
      "mapeamento-palco": true,
      "equipe": false,
      "metas": false,
      "repertorio": false,
      "aulas": false,
      "tutoriais": false,
      "configuracoes": false
    }'::jsonb
  );
  
  RETURN new;
END;
$function$;

-- ================================================
-- OTIMIZAÇÃO 2: Limpeza automática de landing_page_visits
-- Manter apenas últimos 30 dias
-- ================================================

-- 1. Criar função para limpar visitas antigas
CREATE OR REPLACE FUNCTION public.cleanup_old_landing_visits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.landing_page_visits
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND converted = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- 2. Adicionar RLS para permitir delete por admins
CREATE POLICY "Admins can delete landing page visits"
ON public.landing_page_visits
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Criar índice para melhorar performance de limpeza
CREATE INDEX IF NOT EXISTS idx_landing_visits_created_at 
ON public.landing_page_visits (created_at)
WHERE converted = false;