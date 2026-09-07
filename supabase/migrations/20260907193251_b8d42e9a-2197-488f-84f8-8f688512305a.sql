CREATE OR REPLACE FUNCTION public.admin_read_query(sql_query text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  clean_query text;
  lowered text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores.';
  END IF;

  clean_query := btrim(rtrim(btrim(sql_query), ';'));
  lowered := lower(clean_query);

  IF lowered !~ '^(select|with)\s' THEN
    RAISE EXCEPTION 'Apenas consultas de leitura (SELECT/WITH) sao permitidas.';
  END IF;

  IF lowered ~ ';' THEN
    RAISE EXCEPTION 'Apenas uma consulta por vez.';
  END IF;

  IF lowered ~ '\m(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|vacuum|call|do|set|reset|comment|security\s+definer|pg_read_file|pg_ls_dir|dblink)\M' THEN
    RAISE EXCEPTION 'Comando nao permitido nesta consulta.';
  END IF;

  IF lowered ~ '\m(auth|vault|storage|pg_catalog|pg_shadow|pg_authid)\s*\.' THEN
    RAISE EXCEPTION 'Consulta a esquemas protegidos nao e permitida.';
  END IF;

  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || clean_query || ' LIMIT 5000) t' INTO result;
  RETURN COALESCE(result, '[]'::json);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_read_query(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_read_query(text) TO authenticated;