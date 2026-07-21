
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS budget_gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_brands  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_videos  jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.artist_public_profiles
  ADD COLUMN IF NOT EXISTS budget_gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_brands  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS budget_videos  jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.sync_artist_public_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    INSERT INTO public.artist_public_profiles (
      user_id, slug, artist_name, avatar_url, base_city, music_style, bio,
      instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
      media_kit_url, show_video_url, repertoire_url, booking_method, booking_whatsapp,
      link_bg_image_url, link_cover_type,
      budget_link_enabled, budget_headline, budget_intro, budget_bg_image_url,
      budget_cover_type, budget_video_url, budget_cover_image_url, budget_whatsapp,
      budget_packages, budget_reviews, budget_gallery, budget_brands, budget_videos
    ) VALUES (
      NEW.user_id, NEW.slug, NEW.artist_name, NEW.avatar_url, NEW.base_city, NEW.music_style, NEW.bio,
      NEW.instagram_url, NEW.youtube_url, NEW.tiktok_url, NEW.spotify_url, NEW.website_url,
      NEW.media_kit_url, NEW.show_video_url, NEW.repertoire_url, COALESCE(NEW.booking_method, 'backstage'),
      NEW.booking_whatsapp, NEW.link_bg_image_url, COALESCE(NEW.link_cover_type, 'photo'),
      COALESCE(NEW.budget_link_enabled, true), NEW.budget_headline, NEW.budget_intro, NEW.budget_bg_image_url,
      COALESCE(NEW.budget_cover_type, 'photo'), NEW.budget_video_url, NEW.budget_cover_image_url, NEW.budget_whatsapp,
      COALESCE(NEW.budget_packages, '[]'::jsonb), COALESCE(NEW.budget_reviews, '[]'::jsonb),
      COALESCE(NEW.budget_gallery, '[]'::jsonb), COALESCE(NEW.budget_brands, '[]'::jsonb),
      COALESCE(NEW.budget_videos, '[]'::jsonb)
    )
    ON CONFLICT (user_id) DO UPDATE SET
      slug = EXCLUDED.slug,
      artist_name = EXCLUDED.artist_name,
      avatar_url = EXCLUDED.avatar_url,
      base_city = EXCLUDED.base_city,
      music_style = EXCLUDED.music_style,
      bio = EXCLUDED.bio,
      instagram_url = EXCLUDED.instagram_url,
      youtube_url = EXCLUDED.youtube_url,
      tiktok_url = EXCLUDED.tiktok_url,
      spotify_url = EXCLUDED.spotify_url,
      website_url = EXCLUDED.website_url,
      media_kit_url = EXCLUDED.media_kit_url,
      show_video_url = EXCLUDED.show_video_url,
      repertoire_url = EXCLUDED.repertoire_url,
      booking_method = EXCLUDED.booking_method,
      booking_whatsapp = EXCLUDED.booking_whatsapp,
      link_bg_image_url = EXCLUDED.link_bg_image_url,
      link_cover_type = EXCLUDED.link_cover_type,
      budget_link_enabled = EXCLUDED.budget_link_enabled,
      budget_headline = EXCLUDED.budget_headline,
      budget_intro = EXCLUDED.budget_intro,
      budget_bg_image_url = EXCLUDED.budget_bg_image_url,
      budget_cover_type = EXCLUDED.budget_cover_type,
      budget_video_url = EXCLUDED.budget_video_url,
      budget_cover_image_url = EXCLUDED.budget_cover_image_url,
      budget_whatsapp = EXCLUDED.budget_whatsapp,
      budget_packages = EXCLUDED.budget_packages,
      budget_reviews = EXCLUDED.budget_reviews,
      budget_gallery = EXCLUDED.budget_gallery,
      budget_brands = EXCLUDED.budget_brands,
      budget_videos = EXCLUDED.budget_videos;
  END IF;
  RETURN NEW;
END;
$function$;

-- Backfill: para perfis existentes com slug, refazer o sync
UPDATE public.profiles SET updated_at = now() WHERE slug IS NOT NULL;
