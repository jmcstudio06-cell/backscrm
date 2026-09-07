-- Create annual goals table for marketing-style goals
CREATE TABLE public.annual_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER DEFAULT 0,
  year INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'marketing',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.annual_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own annual goals" 
ON public.annual_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own annual goals" 
ON public.annual_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annual goals" 
ON public.annual_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annual goals" 
ON public.annual_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_annual_goals_updated_at
BEFORE UPDATE ON public.annual_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add last_seen column to profiles for tracking inactivity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create landing_page_visits table for insights
CREATE TABLE public.landing_page_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/landing',
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS - only admins can view
ALTER TABLE public.landing_page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view landing page visits" 
ON public.landing_page_visits 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert landing page visits" 
ON public.landing_page_visits 
FOR INSERT 
WITH CHECK (true);