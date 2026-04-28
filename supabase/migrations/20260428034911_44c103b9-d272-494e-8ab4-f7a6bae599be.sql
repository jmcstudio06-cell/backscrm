ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS booking_method TEXT NOT NULL DEFAULT 'backstage';

-- Sync to public view
CREATE OR REPLACE FUNCTION public.sync_artist_public_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    INSERT INTO public.artist_public_profiles (
      user_id, slug, artist_name, avatar_url, base_city, music_style, bio,
      instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
      media_kit_url, show_video_url, repertoire_url, booking_method
    ) VALUES (
      NEW.user_id, NEW.slug, NEW.artist_name, NEW.avatar_url, NEW.base_city, NEW.music_style, NEW.bio,
      NEW.instagram_url, NEW.youtube_url, NEW.tiktok_url, NEW.spotify_url, NEW.website_url,
      NEW.media_kit_url, NEW.show_video_url, NEW.repertoire_url, COALESCE(NEW.booking_method, 'backstage')
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
      booking_method = EXCLUDED.booking_method;
  END IF;
  RETURN NEW;
END;
$$;

ALTER TABLE public.artist_public_profiles ADD COLUMN IF NOT EXISTS booking_method TEXT DEFAULT 'backstage';

-- Backfill existing public rows
UPDATE public.artist_public_profiles apf
SET booking_method = COALESCE(p.booking_method, 'backstage')
FROM public.profiles p
WHERE apf.user_id = p.user_id;