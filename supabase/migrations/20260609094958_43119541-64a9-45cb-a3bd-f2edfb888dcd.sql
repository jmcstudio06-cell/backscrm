ALTER TABLE public.shows
  ADD COLUMN IF NOT EXISTS advance_received_date date,
  ADD COLUMN IF NOT EXISTS balance_due_date date;