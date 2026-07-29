
CREATE TABLE public.contract_signature_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'awaiting_artist',
  artist_signature_name TEXT,
  artist_signed_at TIMESTAMPTZ,
  artist_signature_ip TEXT,
  client_signature_name TEXT,
  client_signature_document TEXT,
  client_signature_email TEXT,
  client_signed_at TIMESTAMPTZ,
  client_signature_ip TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contract_signature_links_token ON public.contract_signature_links(token);
CREATE INDEX idx_contract_signature_links_contract ON public.contract_signature_links(contract_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_signature_links TO authenticated;
GRANT SELECT ON public.contract_signature_links TO anon;
GRANT ALL ON public.contract_signature_links TO service_role;

ALTER TABLE public.contract_signature_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own signature links"
  ON public.contract_signature_links FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public may read a link by token to display the signing page
CREATE POLICY "Public can read signature links"
  ON public.contract_signature_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TRIGGER update_contract_signature_links_updated_at
  BEFORE UPDATE ON public.contract_signature_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public RPC: fetch contract + link data by token (no auth)
CREATE OR REPLACE FUNCTION public.get_signature_link_by_token(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_row public.contract_signature_links;
  contract_row public.contracts;
BEGIN
  SELECT * INTO link_row FROM public.contract_signature_links WHERE token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT * INTO contract_row FROM public.contracts WHERE id = link_row.contract_id LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
    'link', to_jsonb(link_row),
    'contract', to_jsonb(contract_row)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_signature_link_by_token(TEXT) TO anon, authenticated;

-- Public RPC: client signs contract via token
CREATE OR REPLACE FUNCTION public.public_sign_contract(
  _token TEXT,
  _client_name TEXT,
  _client_document TEXT DEFAULT NULL,
  _client_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_row public.contract_signature_links;
  new_status TEXT;
BEGIN
  IF _client_name IS NULL OR length(trim(_client_name)) < 3 THEN
    RAISE EXCEPTION 'invalid_name';
  END IF;

  SELECT * INTO link_row FROM public.contract_signature_links WHERE token = _token LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'link_not_found';
  END IF;

  IF link_row.expires_at < now() THEN
    RAISE EXCEPTION 'link_expired';
  END IF;

  IF link_row.status = 'signed' THEN
    RAISE EXCEPTION 'already_signed';
  END IF;

  IF link_row.artist_signed_at IS NULL THEN
    RAISE EXCEPTION 'artist_not_signed';
  END IF;

  new_status := 'signed';

  UPDATE public.contract_signature_links
     SET client_signature_name = trim(_client_name),
         client_signature_document = _client_document,
         client_signature_email = _client_email,
         client_signed_at = now(),
         status = new_status,
         updated_at = now()
   WHERE id = link_row.id;

  UPDATE public.contracts
     SET status = 'signed',
         signed_at = now(),
         updated_at = now()
   WHERE id = link_row.contract_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.public_sign_contract(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
