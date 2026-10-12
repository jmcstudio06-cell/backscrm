ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text, ADD COLUMN IF NOT EXISTS monthly_show_range text;
CREATE OR REPLACE FUNCTION public.capture_signup_artist_info() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE meta jsonb;
BEGIN
 IF TG_OP = 'INSERT' THEN
 SELECT raw_user_meta_data INTO meta FROM auth.users WHERE id=NEW.user_id;
 NEW.city := COALESCE(NEW.city, meta->>'city');
 NEW.state := COALESCE(NEW.state, meta->>'state');
 NEW.monthly_show_range := COALESCE(NEW.monthly_show_range, meta->>'monthly_show_range');
 END IF;
 IF NEW.city IS NOT NULL THEN
 NEW.city := btrim(NEW.city);
 IF length(NEW.city)<2 OR length(NEW.city)>100 OR NEW.city !~ '^[[:alpha:][:space:]''.-]+$' THEN RAISE EXCEPTION 'Cidade inválida'; END IF;
 END IF;
 IF NEW.state IS NOT NULL THEN
 NEW.state:=upper(btrim(NEW.state));
 IF NEW.state <> ALL(ARRAY['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']) THEN RAISE EXCEPTION 'Estado inválido'; END IF;
 END IF;
 IF NEW.monthly_show_range IS NOT NULL AND NEW.monthly_show_range <> ALL(ARRAY['0 a 2','2 a 5','5 a 10','10 a 15','Mais de 15']) THEN RAISE EXCEPTION 'Média de shows inválida'; END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.capture_signup_artist_info() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER capture_signup_artist_info BEFORE INSERT OR UPDATE OF city,state,monthly_show_range ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.capture_signup_artist_info();