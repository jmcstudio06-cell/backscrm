-- Create stage_mappings table for technical rider
CREATE TABLE public.stage_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  show_id UUID REFERENCES public.shows(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Novo Mapeamento',
  
  -- Event identification
  artist_name TEXT,
  event_name TEXT,
  event_date DATE,
  event_location TEXT,
  technical_contact TEXT,
  technical_phone TEXT,
  
  -- Stage layout (JSON with position data for draggable elements)
  stage_layout JSONB DEFAULT '[]'::jsonb,
  
  -- Input list (JSON array of channels)
  input_list JSONB DEFAULT '[]'::jsonb,
  
  -- Materials checklist (JSON object with boolean values)
  materials_checklist JSONB DEFAULT '{
    "microfones": false,
    "pedestais": false,
    "di_box": false,
    "cabos": false,
    "retornos_palco": false,
    "monitores": false,
    "mesa_som": false,
    "energia_eletrica": false,
    "iluminacao_basica": false
  }'::jsonb,
  
  -- General observations
  observations TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stage_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stage mappings" 
ON public.stage_mappings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stage mappings" 
ON public.stage_mappings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stage mappings" 
ON public.stage_mappings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stage mappings" 
ON public.stage_mappings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stage_mappings_updated_at
BEFORE UPDATE ON public.stage_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();