-- Add new columns to musicians table for additional info
ALTER TABLE public.musicians 
ADD COLUMN IF NOT EXISTS member_type TEXT DEFAULT 'freelancer',
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_request_date DATE DEFAULT NULL;

-- Create index for member_type filtering
CREATE INDEX IF NOT EXISTS idx_musicians_member_type ON public.musicians(member_type);