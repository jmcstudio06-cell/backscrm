
CREATE OR REPLACE FUNCTION public.get_artist_products(artist_user_id uuid)
 RETURNS TABLE(id uuid, name text, description text, price numeric, icon text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT pt.id, pt.name, pt.description, pt.price, pt.icon
  FROM public.performance_types pt
  WHERE pt.user_id = artist_user_id
    AND pt.visible_online = true
  ORDER BY pt.name;
$function$;
