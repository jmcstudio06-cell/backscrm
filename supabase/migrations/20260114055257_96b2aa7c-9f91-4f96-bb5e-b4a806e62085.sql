-- Create table for user gift bonuses
CREATE TABLE public.user_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gift_type TEXT NOT NULL DEFAULT 'agenda_access',
  gift_title TEXT NOT NULL DEFAULT 'Agenda de Shows',
  gift_description TEXT DEFAULT 'Acesso por tempo indeterminado à Agenda de Shows!',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, gift_type)
);

-- Enable RLS
ALTER TABLE public.user_gifts ENABLE ROW LEVEL SECURITY;

-- Users can view their own gifts
CREATE POLICY "Users can view their own gifts"
ON public.user_gifts
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Users can update their own gifts (to claim)
CREATE POLICY "Users can claim their own gifts"
ON public.user_gifts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can insert gifts
CREATE POLICY "Admins can insert gifts"
ON public.user_gifts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update gifts
CREATE POLICY "Admins can update gifts"
ON public.user_gifts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete gifts
CREATE POLICY "Admins can delete gifts"
ON public.user_gifts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_user_gifts_updated_at
BEFORE UPDATE ON public.user_gifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();