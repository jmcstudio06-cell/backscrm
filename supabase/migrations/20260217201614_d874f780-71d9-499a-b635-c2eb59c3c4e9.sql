
CREATE TABLE public.guide_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guide_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert guide leads"
ON public.guide_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view guide leads"
ON public.guide_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete guide leads"
ON public.guide_leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
