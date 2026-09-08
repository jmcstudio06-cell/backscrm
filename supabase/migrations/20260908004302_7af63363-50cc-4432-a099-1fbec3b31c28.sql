CREATE POLICY "public_read_app_images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars','app-assets','bonus-assets'));

CREATE POLICY "authenticated_upload_app_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('avatars','app-assets','bonus-assets'));

CREATE POLICY "authenticated_update_own_app_images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('avatars','app-assets','bonus-assets') AND (owner = auth.uid() OR owner IS NULL))
WITH CHECK (bucket_id IN ('avatars','app-assets','bonus-assets'));

CREATE POLICY "authenticated_delete_own_app_images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('avatars','app-assets','bonus-assets') AND (owner = auth.uid() OR owner IS NULL));