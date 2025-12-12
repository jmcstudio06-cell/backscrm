-- Create lead_history table to track stage changes
CREATE TABLE public.lead_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lead history" 
ON public.lead_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM leads WHERE leads.id = lead_history.lead_id AND leads.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own lead history" 
ON public.lead_history 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM leads WHERE leads.id = lead_history.lead_id AND leads.user_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_lead_history_lead_id ON public.lead_history(lead_id);
CREATE INDEX idx_lead_history_changed_at ON public.lead_history(changed_at DESC);