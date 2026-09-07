-- Consultoria sessions table
CREATE TABLE public.consultoria_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,

  -- Status do fluxo
  status text NOT NULL DEFAULT 'draft', -- draft | submitted | in_review | published

  -- Preenchido pelo cantor
  shows_realizados integer DEFAULT 0,
  faturamento numeric DEFAULT 0,
  despesas numeric DEFAULT 0,
  leads_recebidos integer DEFAULT 0,
  leads_convertidos integer DEFAULT 0,
  meta_shows integer DEFAULT 0,
  meta_faturamento numeric DEFAULT 0,
  ticket_medio numeric DEFAULT 0,
  principais_cidades text,
  observacoes_cantor text,

  -- Preenchido pelo admin (visível ao cantor após published)
  pontos_fortes text,
  pontos_melhoria text,
  proximos_passos text,
  anotacoes_admin text,

  published_at timestamptz,
  submitted_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, month, year)
);

CREATE INDEX idx_consultoria_user ON public.consultoria_sessions(user_id, year DESC, month DESC);
CREATE INDEX idx_consultoria_status ON public.consultoria_sessions(status);

ALTER TABLE public.consultoria_sessions ENABLE ROW LEVEL SECURITY;

-- Cantor: ver próprias sessões (sempre)
CREATE POLICY "Users view own consultoria"
ON public.consultoria_sessions FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Cantor: criar próprias sessões
CREATE POLICY "Users insert own consultoria"
ON public.consultoria_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Cantor: atualizar próprias enquanto não publicadas. Admin: pode tudo.
CREATE POLICY "Users update own consultoria when not published"
ON public.consultoria_sessions FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
  OR (auth.uid() = user_id AND status <> 'published')
);

-- Admin: deletar
CREATE POLICY "Admins delete consultoria"
ON public.consultoria_sessions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER set_consultoria_updated_at
BEFORE UPDATE ON public.consultoria_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();