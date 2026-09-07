
-- Add user info columns to improvements table
ALTER TABLE public.improvements ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.improvements ADD COLUMN user_name text;
ALTER TABLE public.improvements ADD COLUMN user_phone text;
ALTER TABLE public.improvements ADD COLUMN user_email text;

-- Allow authenticated users to insert their own suggestions
CREATE POLICY "Authenticated users can insert suggestions"
ON public.improvements
FOR INSERT
TO authenticated
WITH CHECK (true);
