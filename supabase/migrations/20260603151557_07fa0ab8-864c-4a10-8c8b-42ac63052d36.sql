GRANT SELECT, INSERT, UPDATE, DELETE ON public.budgets TO authenticated;
GRANT ALL ON public.budgets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_items TO authenticated;
GRANT ALL ON public.budget_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_types TO authenticated;
GRANT ALL ON public.performance_types TO service_role;