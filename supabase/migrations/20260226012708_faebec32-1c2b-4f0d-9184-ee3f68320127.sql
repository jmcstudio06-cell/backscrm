
-- Add slug column to profiles for public booking URL
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles (slug);

-- Create booking_requests table
CREATE TABLE public.booking_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id uuid NOT NULL,
  product_id uuid REFERENCES public.performance_types(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  client_name text NOT NULL,
  client_phone text NOT NULL,
  event_city text,
  event_location text,
  observations text,
  product_name text
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a booking request (public page, no auth)
CREATE POLICY "Anyone can submit booking requests"
ON public.booking_requests
FOR INSERT
WITH CHECK (true);

-- Artists can view their own booking requests
CREATE POLICY "Artists can view their own booking requests"
ON public.booking_requests
FOR SELECT
USING (artist_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Artists can update their own booking requests (approve/reject)
CREATE POLICY "Artists can update their own booking requests"
ON public.booking_requests
FOR UPDATE
USING (artist_id = auth.uid());

-- Artists can delete their own booking requests
CREATE POLICY "Artists can delete their own booking requests"
ON public.booking_requests
FOR DELETE
USING (artist_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_booking_requests_updated_at
BEFORE UPDATE ON public.booking_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
