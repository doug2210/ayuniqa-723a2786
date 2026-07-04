CREATE POLICY "Admins manage site-assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage game-assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'game-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'game-assets' AND public.has_role(auth.uid(), 'admin'));