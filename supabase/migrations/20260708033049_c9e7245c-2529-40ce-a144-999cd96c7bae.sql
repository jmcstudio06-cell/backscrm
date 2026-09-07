
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS link_bg_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS link_cover_type TEXT DEFAULT 'photo';
ALTER TABLE public.artist_public_profiles ADD COLUMN IF NOT EXISTS link_bg_image_url TEXT;
ALTER TABLE public.artist_public_profiles ADD COLUMN IF NOT EXISTS link_cover_type TEXT DEFAULT 'photo';

CREATE OR REPLACE FUNCTION public.sync_artist_public_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    INSERT INTO public.artist_public_profiles (
      user_id, slug, artist_name, avatar_url, base_city, music_style, bio,
      instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
      media_kit_url, show_video_url, repertoire_url, booking_method, booking_whatsapp,
      link_bg_image_url, link_cover_type
    ) VALUES (
      NEW.user_id, NEW.slug, NEW.artist_name, NEW.avatar_url, NEW.base_city, NEW.music_style, NEW.bio,
      NEW.instagram_url, NEW.youtube_url, NEW.tiktok_url, NEW.spotify_url, NEW.website_url,
      NEW.media_kit_url, NEW.show_video_url, NEW.repertoire_url, COALESCE(NEW.booking_method, 'backstage'),
      NEW.booking_whatsapp, NEW.link_bg_image_url, COALESCE(NEW.link_cover_type, 'photo')
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
      link_cover_type = EXCLUDED.link_cover_type;
  END IF;
  RETURN NEW;
END;
$$;

UPDATE public.artist_public_profiles apf
SET link_bg_image_url = p.link_bg_image_url,
    link_cover_type = COALESCE(p.link_cover_type, 'photo')
FROM public.profiles p
WHERE apf.user_id = p.user_id;
