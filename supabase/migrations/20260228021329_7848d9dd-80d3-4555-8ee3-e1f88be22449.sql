
CREATE TABLE public.improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.improvements ENABLE ROW LEVEL SECURITY;

-- Only admins can manage improvements (using has_role function)
CREATE POLICY "Admins can view improvements"
ON public.improvements FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert improvements"
ON public.improvements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update improvements"
ON public.improvements FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete improvements"
ON public.improvements FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_improvements_updated_at
BEFORE UPDATE ON public.improvements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
