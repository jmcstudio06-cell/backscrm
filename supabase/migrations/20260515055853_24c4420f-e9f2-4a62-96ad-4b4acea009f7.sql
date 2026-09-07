DROP TRIGGER IF EXISTS trg_sync_artist_public_profile ON public.profiles;

CREATE TRIGGER trg_sync_artist_public_profile
AFTER INSERT OR UPDATE OF
  slug, artist_name, avatar_url, base_city, music_style, project_type, bio,
  instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
  media_kit_url, show_video_url, repertoire_url,
  booking_method, booking_whatsapp
ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_artist_public_profile();

-- Backfill: re-sync existing rows that are out of date
UPDATE public.profiles SET updated_at = now()
WHERE slug IS NOT NULL
  AND (booking_method IS NOT NULL OR booking_whatsapp IS NOT NULL);