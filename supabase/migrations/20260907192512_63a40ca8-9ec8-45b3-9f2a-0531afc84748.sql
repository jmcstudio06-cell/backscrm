CREATE OR REPLACE FUNCTION public.get_migration_tables()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  column_count integer,
  has_user_id boolean,
  rls_enabled boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores.';
  END IF;

  RETURN QUERY
  SELECT
    c.relname::text,
    COALESCE(c.reltuples, 0)::bigint,
    (SELECT count(*)::integer FROM information_schema.columns col
       WHERE col.table_schema = 'public' AND col.table_name = c.relname),
    EXISTS (SELECT 1 FROM information_schema.columns col
       WHERE col.table_schema = 'public' AND col.table_name = c.relname
         AND col.column_name = 'user_id'),
    c.relrowsecurity
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY c.relname;
END;
$$;

REVOKE ALL ON FUNCTION public.get_migration_tables() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_migration_tables() TO authenticated;