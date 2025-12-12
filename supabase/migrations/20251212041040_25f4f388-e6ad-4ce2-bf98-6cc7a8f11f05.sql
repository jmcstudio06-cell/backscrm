-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create musicians table
CREATE TABLE public.musicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instrument TEXT,
  phone TEXT,
  email TEXT,
  rate DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.musicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own musicians" ON public.musicians FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own musicians" ON public.musicians FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own musicians" ON public.musicians FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own musicians" ON public.musicians FOR DELETE USING (auth.uid() = user_id);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  shows_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Create leads table for CRM funnel
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  event_type TEXT,
  event_date DATE,
  estimated_value DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contact', 'proposal', 'negotiation', 'closed', 'lost')),
  notes TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Create shows table (central table)
CREATE TABLE public.shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  event_type TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  address TEXT,
  cachet DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shows" ON public.shows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own shows" ON public.shows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shows" ON public.shows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shows" ON public.shows FOR DELETE USING (auth.uid() = user_id);

-- Create show_musicians table (links shows to musicians with their fee)
CREATE TABLE public.show_musicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musicians(id) ON DELETE CASCADE,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.show_musicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own show musicians" ON public.show_musicians FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_musicians.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can insert their own show musicians" ON public.show_musicians FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_musicians.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can update their own show musicians" ON public.show_musicians FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_musicians.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can delete their own show musicians" ON public.show_musicians FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_musicians.show_id AND shows.user_id = auth.uid()));

-- Create show_expenses table
CREATE TABLE public.show_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.show_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own show expenses" ON public.show_expenses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_expenses.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can insert their own show expenses" ON public.show_expenses FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_expenses.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can update their own show expenses" ON public.show_expenses FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_expenses.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can delete their own show expenses" ON public.show_expenses FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_expenses.show_id AND shows.user_id = auth.uid()));

-- Create show_checklist table
CREATE TABLE public.show_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.show_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own show checklist" ON public.show_checklist FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_checklist.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can insert their own show checklist" ON public.show_checklist FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_checklist.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can update their own show checklist" ON public.show_checklist FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_checklist.show_id AND shows.user_id = auth.uid()));
CREATE POLICY "Users can delete their own show checklist" ON public.show_checklist FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.shows WHERE shows.id = show_checklist.show_id AND shows.user_id = auth.uid()));

-- Create transactions table for financial tracking
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_id UUID REFERENCES public.shows(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'shows', 'leads', 'clients')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_musicians_updated_at BEFORE UPDATE ON public.musicians FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();