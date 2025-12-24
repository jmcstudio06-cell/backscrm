-- Create policy to allow admins to read all visits (correct argument order)
CREATE POLICY "Allow admins to read landing_page_visits" 
ON public.landing_page_visits 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));