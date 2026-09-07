-- Adicionar campos de Perfil Artístico, Regras de Show e Regras Financeiras
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS artist_name text,
ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'solo',
ADD COLUMN IF NOT EXISTS music_style text,
ADD COLUMN IF NOT EXISTS base_city text,
ADD COLUMN IF NOT EXISTS action_radius integer DEFAULT 100,

-- Regras de Show
ADD COLUMN IF NOT EXISTS show_duration text DEFAULT '2 horas',
ADD COLUMN IF NOT EXISTS start_time_limit text DEFAULT '23:00',
ADD COLUMN IF NOT EXISTS delay_tolerance text DEFAULT '30 minutos',
ADD COLUMN IF NOT EXISTS has_interval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_food boolean DEFAULT false,

-- Regras Financeiras
ADD COLUMN IF NOT EXISTS min_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_percentage integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS accepted_payment text DEFAULT 'Pix, Transferência',
ADD COLUMN IF NOT EXISTS payment_deadline text DEFAULT 'No dia do show',
ADD COLUMN IF NOT EXISTS late_fee_percentage numeric DEFAULT 2;