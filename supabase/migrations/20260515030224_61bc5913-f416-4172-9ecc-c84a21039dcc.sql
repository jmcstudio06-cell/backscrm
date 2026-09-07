ALTER TABLE public.artist_public_profiles ADD COLUMN IF NOT EXISTS booking_whatsapp TEXT;

CREATE OR REPLACE FUNCTION public.sync_artist_public_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    INSERT INTO public.artist_public_profiles (
      user_id, slug, artist_name, avatar_url, base_city, music_style, bio,
      instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
      media_kit_url, show_video_url, repertoire_url, booking_method, booking_whatsapp
    ) VALUES (
      NEW.user_id, NEW.slug, NEW.artist_name, NEW.avatar_url, NEW.base_city, NEW.music_style, NEW.bio,
      NEW.instagram_url, NEW.youtube_url, NEW.tiktok_url, NEW.spotify_url, NEW.website_url,
      NEW.media_kit_url, NEW.show_video_url, NEW.repertoire_url, COALESCE(NEW.booking_method, 'backstage'),
      NEW.booking_whatsapp
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
      booking_whatsapp = EXCLUDED.booking_whatsapp;
  END IF;
  RETURN NEW;
END;
$$;

UPDATE public.artist_public_profiles apf
SET booking_whatsapp = p.booking_whatsapp
FROM public.profiles p
WHERE apf.user_id = p.user_id AND p.booking_whatsapp IS NOT NULL;