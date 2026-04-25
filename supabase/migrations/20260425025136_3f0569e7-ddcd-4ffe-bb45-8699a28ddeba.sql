-- Ativar plano profissional para o usuário que pagou hoje
UPDATE public.profiles
SET 
  plan = 'mensal_profissional',
  trial_start = now(),
  trial_days = 30,
  feature_blocks = '{
    "dashboard": false,
    "agenda": false,
    "crm": false,
    "clientes": false,
    "orcamentos": false,
    "servicos": false,
    "contratos": false,
    "financeiro": false,
    "historico": true,
    "precificacao": true,
    "checklist": false,
    "mapeamento-palco": true,
    "equipe": false,
    "metas": true,
    "repertorio": false,
    "aulas": true,
    "avancos": true,
    "tutoriais": false,
    "configuracoes": false,
    "link-agenda": true
  }'::jsonb,
  updated_at = now()
WHERE user_id = 'cddd9c73-0a68-4f70-b5f4-2640dbd71e17';

-- Marcar o pagamento pendente como ativado
UPDATE public.pending_payments
SET 
  status = 'activated',
  activated_at = now()
WHERE id = '98b4215e-eee8-4ed2-a6bf-3c2cf218e9d7';