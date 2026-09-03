REVOKE ALL ON FUNCTION public.ensure_profile_slug() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.slugify_artist_name(text) FROM PUBLIC, anon, authenticated;