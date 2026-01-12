-- Tabela de bônus (gerenciada pelo admin)
CREATE TABLE public.bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'video', -- video, link, download, lesson
  content_url TEXT,
  thumbnail TEXT,
  completion_rule TEXT NOT NULL DEFAULT 'click', -- click, watch_50, watch_100, download
  unlock_delay_hours INTEGER NOT NULL DEFAULT 24,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  reward_title TEXT,
  reward_description TEXT,
  reward_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso do usuário
CREATE TABLE public.user_bonus_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bonus_id UUID NOT NULL REFERENCES public.bonuses(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, bonus_id)
);

-- Enable RLS
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonus_progress ENABLE ROW LEVEL SECURITY;

-- Policies para bonuses (todos podem ver, só admin pode modificar)
CREATE POLICY "Everyone can view active bonuses"
ON public.bonuses
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert bonuses"
ON public.bonuses
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bonuses"
ON public.bonuses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bonuses"
ON public.bonuses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies para user_bonus_progress
CREATE POLICY "Users can view their own progress"
ON public.user_bonus_progress
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own progress"
ON public.user_bonus_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_bonus_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_bonuses_updated_at
BEFORE UPDATE ON public.bonuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();