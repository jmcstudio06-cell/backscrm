
-- Public function to get artist products (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_artist_products(artist_user_id uuid)
RETURNS TABLE(id uuid, name text, description text, price numeric, icon text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pt.id, pt.name, pt.description, pt.price, pt.icon
  FROM public.performance_types pt
  WHERE pt.user_id = artist_user_id
  ORDER BY pt.name;
$$;
