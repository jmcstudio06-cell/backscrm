-- Create advances/missions table
CREATE TABLE public.advances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'shows',
  due_type TEXT NOT NULL DEFAULT 'today',
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'simple',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own advances" 
ON public.advances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advances" 
ON public.advances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advances" 
ON public.advances 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advances" 
ON public.advances 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advances_updated_at
BEFORE UPDATE ON public.advances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();