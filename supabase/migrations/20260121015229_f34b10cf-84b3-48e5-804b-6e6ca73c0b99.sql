-- Criar tabela para armazenar as solicitações de análise de gestão artística
CREATE TABLE public.artist_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  shows_per_month TEXT NOT NULL,
  who_manages TEXT NOT NULL,
  difficulties TEXT[] NOT NULL,
  lost_opportunities TEXT NOT NULL,
  history_reflection TEXT,
  availability TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.artist_analyses ENABLE ROW LEVEL SECURITY;

-- Política para qualquer pessoa poder inserir (formulário público)
CREATE POLICY "Anyone can submit analysis request"
ON public.artist_analyses
FOR INSERT
WITH CHECK (true);

-- Política para admins visualizarem todas as análises
CREATE POLICY "Admins can view all analyses"
ON public.artist_analyses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Política para admins atualizarem status
CREATE POLICY "Admins can update analyses"
ON public.artist_analyses
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Política para admins deletarem
CREATE POLICY "Admins can delete analyses"
ON public.artist_analyses
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_artist_analyses_updated_at
BEFORE UPDATE ON public.artist_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();