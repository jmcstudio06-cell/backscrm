
-- Migrate essencial (3 months) -> mensal_completo (30 days)
UPDATE public.profiles 
SET plan = 'mensal_completo', 
    trial_days = 30,
    trial_start = now()
WHERE plan = 'essencial';

-- Migrate completo (6 months) -> anual_completo (365 days)  
UPDATE public.profiles 
SET plan = 'anual_completo',
    trial_days = 365,
    trial_start = now()
WHERE plan = 'completo';

-- Migrate base -> mensal_starter
UPDATE public.profiles 
SET plan = 'mensal_starter',
    trial_days = 30
WHERE plan = 'base';

-- Migrate mensal -> mensal_starter
UPDATE public.profiles 
SET plan = 'mensal_starter',
    trial_days = 30
WHERE plan = 'mensal';

-- Migrate anual -> anual_completo
UPDATE public.profiles 
SET plan = 'anual_completo',
    trial_days = 365
WHERE plan = 'anual';
