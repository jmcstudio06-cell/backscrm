
DROP TRIGGER IF EXISTS trg_sync_artist_public_profile ON public.profiles;

CREATE TRIGGER trg_sync_artist_public_profile
AFTER INSERT OR UPDATE OF
  slug, artist_name, avatar_url, base_city, music_style, project_type, bio,
  instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
  media_kit_url, show_video_url, repertoire_url, booking_method, booking_whatsapp,
  link_bg_image_url, link_cover_type,
  budget_link_enabled, budget_headline, budget_intro, budget_bg_image_url,
  budget_cover_type, budget_video_url, budget_cover_image_url, budget_whatsapp,
  budget_packages, budget_reviews
ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_artist_public_profile();

-- Backfill existing public profiles with current budget/link fields
UPDATE public.artist_public_profiles a
SET
  link_bg_image_url = p.link_bg_image_url,
  link_cover_type = COALESCE(p.link_cover_type, 'photo'),
  budget_link_enabled = COALESCE(p.budget_link_enabled, true),
  budget_headline = p.budget_headline,
  budget_intro = p.budget_intro,
  budget_bg_image_url = p.budget_bg_image_url,
  budget_cover_type = COALESCE(p.budget_cover_type, 'photo'),
  budget_video_url = p.budget_video_url,
  budget_cover_image_url = p.budget_cover_image_url,
  budget_whatsapp = p.budget_whatsapp,
  budget_packages = COALESCE(p.budget_packages, '[]'::jsonb),
  budget_reviews = COALESCE(p.budget_reviews, '[]'::jsonb)
FROM public.profiles p
WHERE a.user_id = p.user_id;
