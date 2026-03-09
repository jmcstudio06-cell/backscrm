-- Public table to expose only safe artist data for the public booking page
CREATE TABLE IF NOT EXISTS public.artist_public_profiles (
  user_id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  artist_name text NULL,
  avatar_url text NULL,
  base_city text NULL,
  music_style text NULL,
  project_type text NULL,
  bio text NULL,
  instagram_url text NULL,
  youtube_url text NULL,
  tiktok_url text NULL,
  spotify_url text NULL,
  website_url text NULL,
  media_kit_url text NULL,
  show_video_url text NULL,
  repertoire_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_public_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out visitors) can read public artist profiles
DO $$ BEGIN
  CREATE POLICY "Public can read artist public profiles"
  ON public.artist_public_profiles
  FOR SELECT
  TO public
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Keep artist_public_profiles synced from profiles (runs as table owner, bypassing RLS)
CREATE OR REPLACE FUNCTION public.sync_artist_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only sync when we have a slug (public URL key)
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.artist_public_profiles (
    user_id,
    slug,
    artist_name,
    avatar_url,
    base_city,
    music_style,
    project_type,
    bio,
    instagram_url,
    youtube_url,
    tiktok_url,
    spotify_url,
    website_url,
    media_kit_url,
    show_video_url,
    repertoire_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.user_id,
    NEW.slug,
    NEW.artist_name,
    NEW.avatar_url,
    NEW.base_city,
    NEW.music_style,
    NEW.project_type,
    NEW.bio,
    NEW.instagram_url,
    NEW.youtube_url,
    NEW.tiktok_url,
    NEW.spotify_url,
    NEW.website_url,
    NEW.media_kit_url,
    NEW.show_video_url,
    NEW.repertoire_url,
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    slug = EXCLUDED.slug,
    artist_name = EXCLUDED.artist_name,
    avatar_url = EXCLUDED.avatar_url,
    base_city = EXCLUDED.base_city,
    music_style = EXCLUDED.music_style,
    project_type = EXCLUDED.project_type,
    bio = EXCLUDED.bio,
    instagram_url = EXCLUDED.instagram_url,
    youtube_url = EXCLUDED.youtube_url,
    tiktok_url = EXCLUDED.tiktok_url,
    spotify_url = EXCLUDED.spotify_url,
    website_url = EXCLUDED.website_url,
    media_kit_url = EXCLUDED.media_kit_url,
    show_video_url = EXCLUDED.show_video_url,
    repertoire_url = EXCLUDED.repertoire_url,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_artist_public_profile ON public.profiles;
CREATE TRIGGER trg_sync_artist_public_profile
AFTER INSERT OR UPDATE OF slug, artist_name, avatar_url, base_city, music_style, project_type, bio,
  instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_artist_public_profile();
