
CREATE TABLE public.content_plan_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day integer NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, day, month, year)
);

ALTER TABLE public.content_plan_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content plan entries"
ON public.content_plan_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content plan entries"
ON public.content_plan_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content plan entries"
ON public.content_plan_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content plan entries"
ON public.content_plan_entries FOR DELETE
USING (auth.uid() = user_id);
