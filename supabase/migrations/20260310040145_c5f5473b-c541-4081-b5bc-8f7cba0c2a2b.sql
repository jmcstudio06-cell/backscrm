
-- Fix only Larissa Santos profile
UPDATE public.profiles
SET artist_name = 'Larissa Santos',
    slug = 'larissasantos'
WHERE user_id = '3f0ff059-7554-43c7-9ac3-c32b288e6d38' AND slug IS NULL;
