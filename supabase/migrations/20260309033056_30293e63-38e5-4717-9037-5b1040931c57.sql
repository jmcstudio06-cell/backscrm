
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS booking_show_products boolean NOT NULL DEFAULT true;

ALTER TABLE public.artist_public_profiles
  ADD COLUMN IF NOT EXISTS booking_show_products boolean NOT NULL DEFAULT true;

-- Update sync trigger to include new column
CREATE OR REPLACE FUNCTION public.sync_artist_public_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.artist_public_profiles (
    user_id, slug, artist_name, avatar_url, base_city, music_style, project_type,
    bio, instagram_url, youtube_url, tiktok_url, spotify_url, website_url,
    media_kit_url, show_video_url, repertoire_url,
    booking_max_dates, booking_discount_percent, booking_min_dates_discount, booking_show_products,
    created_at, updated_at
  ) VALUES (
    NEW.user_id, NEW.slug, NEW.artist_name, NEW.avatar_url, NEW.base_city,
    NEW.music_style, NEW.project_type, NEW.bio, NEW.instagram_url, NEW.youtube_url,
    NEW.tiktok_url, NEW.spotify_url, NEW.website_url, NEW.media_kit_url,
    NEW.show_video_url, NEW.repertoire_url,
    NEW.booking_max_dates, NEW.booking_discount_percent, NEW.booking_min_dates_discount, NEW.booking_show_products,
    COALESCE(NEW.created_at, now()), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    slug = EXCLUDED.slug, artist_name = EXCLUDED.artist_name, avatar_url = EXCLUDED.avatar_url,
    base_city = EXCLUDED.base_city, music_style = EXCLUDED.music_style, project_type = EXCLUDED.project_type,
    bio = EXCLUDED.bio, instagram_url = EXCLUDED.instagram_url, youtube_url = EXCLUDED.youtube_url,
    tiktok_url = EXCLUDED.tiktok_url, spotify_url = EXCLUDED.spotify_url, website_url = EXCLUDED.website_url,
    media_kit_url = EXCLUDED.media_kit_url, show_video_url = EXCLUDED.show_video_url,
    repertoire_url = EXCLUDED.repertoire_url,
    booking_max_dates = EXCLUDED.booking_max_dates,
    booking_discount_percent = EXCLUDED.booking_discount_percent,
    booking_min_dates_discount = EXCLUDED.booking_min_dates_discount,
    booking_show_products = EXCLUDED.booking_show_products,
    updated_at = now();

  RETURN NEW;
END;
$function$;
