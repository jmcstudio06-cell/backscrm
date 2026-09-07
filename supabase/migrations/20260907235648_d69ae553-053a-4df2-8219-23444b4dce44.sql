DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_gift ON auth.users;
CREATE TRIGGER on_auth_user_created_gift
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_create_gift_on_signup();

INSERT INTO public.profiles (user_id, email, name, phone, plan, trial_start, trial_days, feature_blocks)
SELECT u.id,
       u.email,
       COALESCE(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
       u.raw_user_meta_data ->> 'phone',
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
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;