CREATE TABLE public.dashboard_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  badge text,
  cta_label text NOT NULL DEFAULT 'Saiba mais',
  cta_url text NOT NULL,
  image_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_ads TO authenticated;
GRANT SELECT ON public.dashboard_ads TO anon;
GRANT ALL ON public.dashboard_ads TO service_role;

ALTER TABLE public.dashboard_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ads" ON public.dashboard_ads
FOR SELECT USING (active = true);

CREATE POLICY "Admins can view all ads" ON public.dashboard_ads
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert ads" ON public.dashboard_ads
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ads" ON public.dashboard_ads
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ads" ON public.dashboard_ads
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_dashboard_ads_updated_at BEFORE UPDATE ON public.dashboard_ads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();