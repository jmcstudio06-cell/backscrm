-- Create a table for content/learning materials
CREATE TABLE public.contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT NOT NULL DEFAULT 'outra',
  type TEXT NOT NULL DEFAULT 'link',
  featured BOOLEAN DEFAULT false,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own contents" 
ON public.contents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contents" 
ON public.contents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contents" 
ON public.contents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contents" 
ON public.contents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contents_updated_at
BEFORE UPDATE ON public.contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();