REVOKE EXECUTE ON FUNCTION public.expire_due_plans() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_due_plans() TO postgres, service_role;