UPDATE public.profiles
SET 
  plan = 'mensal_profissional',
  trial_start = now(),
  trial_days = 30,
  feature_blocks = '{
    "dashboard": false, "agenda": false, "crm": false, "clientes": false,
    "orcamentos": false, "servicos": false, "contratos": true, "financeiro": false,
    "historico": true, "precificacao": false, "checklist": false,
    "mapeamento-palco": true, "equipe": false, "metas": true, "repertorio": false,
    "aulas": true, "avancos": false, "tutoriais": false, "configuracoes": false,
    "link-agenda": true, "link-instagram": false, "bonus": true, "ideias-post": false,
    "metas-anuais": true
  }'::jsonb,
  updated_at = now()
WHERE user_id = 'dc3b59e4-37a6-49ea-bd7b-f53d69de0463';

UPDATE public.pending_payments
SET status = 'approved', activated_at = now()
WHERE id = '084ab4c7-3ede-4bc0-b424-9ba89a0d1126';