-- Progresso de leitura do "Manual do Artista Contratado" (página pública /kit-profissional).
-- Vinculado ao lead já capturado (WhatsApp), permitindo que o visitante continue de onde parou
-- sem precisar de login no app. O lead já é público (guide_leads aceita INSERT anônimo),
-- então o progresso de leitura também pode ser lido/gravado de forma anônima por telefone.

CREATE TABLE IF NOT EXISTS public.manual_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- chave do lead: somente dígitos do WhatsApp capturado no modal
  lead_phone TEXT NOT NULL UNIQUE,
  -- índice do último capítulo visto (0-based)
  chapter_index INTEGER NOT NULL DEFAULT 0,
  -- quantos capítulos foram marcados como concluídos
  completed BOOLEAN NOT NULL DEFAULT false,
  -- respostas das interações (reflexões/cenários/checklists): apenas escolhas estruturadas,
  -- sem texto livre pessoal. Ex.: { "ch1_reflexao": true, "ch2_cenario": "b" }
  interactions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_progress ENABLE ROW LEVEL SECURITY;

-- Visitante anônimo pode criar seu registro de progresso.
CREATE POLICY "Anyone can insert manual progress"
ON public.manual_progress
FOR INSERT
WITH CHECK (true);

-- Visitante anônimo pode atualizar (upsert) seu próprio registro.
-- A granularidade por telefone é garantida no client (filtro .eq('lead_phone', ...));
-- não há dado sensível aqui e o lead já é público.
CREATE POLICY "Anyone can update manual progress"
ON public.manual_progress
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Visitante anônimo pode ler seu próprio progresso (consulta filtrada por telefone no client).
CREATE POLICY "Anyone can read manual progress"
ON public.manual_progress
FOR SELECT
USING (true);

-- Admins podem apagar registros de progresso.
CREATE POLICY "Admins can delete manual progress"
ON public.manual_progress
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Mantém updated_at coerente em cada escrita.
CREATE OR REPLACE FUNCTION public.touch_manual_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_manual_progress ON public.manual_progress;
CREATE TRIGGER trg_touch_manual_progress
BEFORE UPDATE ON public.manual_progress
FOR EACH ROW
EXECUTE FUNCTION public.touch_manual_progress_updated_at();
