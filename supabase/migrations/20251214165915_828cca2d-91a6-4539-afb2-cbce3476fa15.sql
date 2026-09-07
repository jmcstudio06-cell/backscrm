-- Create storage bucket for app assets (logo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for admins to upload logos
CREATE POLICY "Admins can upload app assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'app-assets' AND 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create storage policy for admins to update app assets
CREATE POLICY "Admins can update app assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'app-assets' AND 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create storage policy for admins to delete app assets
CREATE POLICY "Admins can delete app assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'app-assets' AND 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create storage policy for anyone to view app assets (public)
CREATE POLICY "Anyone can view app assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'app-assets');

-- Add unique constraint on user_feature_blocks if it doesn't exist
ALTER TABLE public.user_feature_blocks 
DROP CONSTRAINT IF EXISTS unique_user_feature;

ALTER TABLE public.user_feature_blocks 
ADD CONSTRAINT unique_user_feature UNIQUE (user_id, feature_key);