-- Drop existing restrictive policies on contents
DROP POLICY IF EXISTS "Users can view their own contents" ON public.contents;
DROP POLICY IF EXISTS "Users can create their own contents" ON public.contents;
DROP POLICY IF EXISTS "Users can update their own contents" ON public.contents;
DROP POLICY IF EXISTS "Users can delete their own contents" ON public.contents;

-- Create new policies: everyone can view, only admins can manage
CREATE POLICY "Contents are viewable by everyone" 
ON public.contents 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can create contents" 
ON public.contents 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contents" 
ON public.contents 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contents" 
ON public.contents 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));