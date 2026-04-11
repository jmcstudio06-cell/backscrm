
-- Add PIX key to musicians
ALTER TABLE public.musicians ADD COLUMN pix_key text DEFAULT NULL;

-- Add advance payment flag to transactions
ALTER TABLE public.transactions ADD COLUMN is_advance_payment boolean NOT NULL DEFAULT false;
