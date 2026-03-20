UPDATE public.profiles 
SET plan = 'mensal_completo',
    trial_start = now(),
    trial_days = 30,
    feature_blocks = '{"dashboard": false, "agenda": false, "crm": false, "clientes": false, "orcamentos": false, "servicos": false, "contratos": false, "financeiro": false, "historico": false, "precificacao": false, "checklist": false, "mapeamento-palco": false, "equipe": false, "metas": false, "repertorio": false, "aulas": false, "avancos": false, "tutoriais": false, "configuracoes": false, "link-agenda": false}'::jsonb
WHERE user_id = 'd74be016-8e2e-4516-adc9-a9b12f2fcf8c';

UPDATE public.profiles 
SET plan = 'mensal_starter',
    trial_start = now(),
    trial_days = 30,
    feature_blocks = '{"dashboard": false, "agenda": false, "crm": true, "clientes": true, "orcamentos": true, "servicos": false, "contratos": true, "financeiro": false, "historico": true, "precificacao": false, "checklist": true, "mapeamento-palco": true, "equipe": true, "metas": true, "repertorio": true, "aulas": true, "avancos": false, "tutoriais": false, "configuracoes": false, "link-agenda": true}'::jsonb
WHERE user_id = '67d37458-85c0-45cd-a9af-3aab9fd0d3e7';

UPDATE public.pending_payments 
SET status = 'activated', activated_at = now()
WHERE user_id IN ('d74be016-8e2e-4516-adc9-a9b12f2fcf8c', '67d37458-85c0-45cd-a9af-3aab9fd0d3e7')
AND status = 'pending';