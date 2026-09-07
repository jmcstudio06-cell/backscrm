-- Create table for repertoire blocks
CREATE TABLE public.repertoire_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  climate TEXT NOT NULL DEFAULT 'medio',
  objective TEXT NOT NULL DEFAULT 'segurar',
  duration TEXT NOT NULL DEFAULT '20min',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for repertoire songs
CREATE TABLE public.repertoire_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id UUID NOT NULL REFERENCES public.repertoire_blocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  song_key TEXT,
  duration TEXT,
  is_main BOOLEAN NOT NULL DEFAULT false,
  checked BOOLEAN NOT NULL DEFAULT false,
  key_ok BOOLEAN NOT NULL DEFAULT false,
  chords_reviewed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.repertoire_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertoire_songs ENABLE ROW LEVEL SECURITY;

-- RLS policies for repertoire_blocks
CREATE POLICY "Users can view their own repertoire blocks"
  ON public.repertoire_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own repertoire blocks"
  ON public.repertoire_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repertoire blocks"
  ON public.repertoire_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repertoire blocks"
  ON public.repertoire_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for repertoire_songs
CREATE POLICY "Users can view their own repertoire songs"
  ON public.repertoire_songs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own repertoire songs"
  ON public.repertoire_songs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repertoire songs"
  ON public.repertoire_songs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repertoire songs"
  ON public.repertoire_songs FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_repertoire_blocks_updated_at
  BEFORE UPDATE ON public.repertoire_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_repertoire_songs_updated_at
  BEFORE UPDATE ON public.repertoire_songs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();