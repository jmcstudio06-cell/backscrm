-- Tabela para armazenar o setup de equipamentos do artista
CREATE TABLE public.artist_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'som',
  purchase_value NUMERIC NOT NULL DEFAULT 0,
  purchase_date DATE,
  lifespan_shows INTEGER DEFAULT 500,
  lifespan_months INTEGER DEFAULT 60,
  depreciation_method TEXT NOT NULL DEFAULT 'shows',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artist_equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own equipment"
  ON public.artist_equipment FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own equipment"
  ON public.artist_equipment FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipment"
  ON public.artist_equipment FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own equipment"
  ON public.artist_equipment FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_artist_equipment_updated_at
  BEFORE UPDATE ON public.artist_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();