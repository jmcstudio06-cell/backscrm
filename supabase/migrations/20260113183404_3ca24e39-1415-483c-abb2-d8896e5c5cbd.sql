-- Create storage bucket for bonus assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('bonus-assets', 'bonus-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone authenticated to upload to bonus-assets
CREATE POLICY "Admins can upload bonus assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bonus-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow public read access
CREATE POLICY "Anyone can view bonus assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bonus-assets');

-- Allow admins to delete
CREATE POLICY "Admins can delete bonus assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bonus-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);