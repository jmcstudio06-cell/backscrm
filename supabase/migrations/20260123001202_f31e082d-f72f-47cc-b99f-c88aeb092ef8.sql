-- Renomear coluna para refletir nova lógica: horas após cadastro do usuário
ALTER TABLE public.bonuses RENAME COLUMN unlock_delay_hours TO unlock_after_hours;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.bonuses.unlock_after_hours IS 'Hours after user registration when this bonus becomes available. E.g., 24 = 24h after signup, 720 = 30 days after signup';