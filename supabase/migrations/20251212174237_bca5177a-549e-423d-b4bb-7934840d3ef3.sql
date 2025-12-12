-- Create performance types table for budget items
CREATE TABLE public.performance_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  budget_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  client_address TEXT,
  logo_url TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_conditions TEXT,
  notes TEXT,
  terms_conditions TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budget items table
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  details TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract clauses table (reusable)
CREATE TABLE public.contract_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  show_id UUID REFERENCES public.shows(id) ON DELETE SET NULL,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  
  -- Artist/Company info
  artist_name TEXT,
  artist_document TEXT,
  artist_address TEXT,
  artist_phone TEXT,
  artist_email TEXT,
  
  -- Client info
  client_name TEXT NOT NULL,
  client_document TEXT,
  client_address TEXT,
  client_phone TEXT,
  client_email TEXT,
  
  -- Event info
  event_date DATE,
  event_time TEXT,
  event_duration TEXT,
  event_location TEXT,
  event_type TEXT,
  
  -- Financial
  total_value NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  payment_terms TEXT,
  
  -- Content
  clauses JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  status TEXT NOT NULL DEFAULT 'draft',
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_types
CREATE POLICY "Users can view their own performance types" ON public.performance_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own performance types" ON public.performance_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own performance types" ON public.performance_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own performance types" ON public.performance_types FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for budgets
CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for budget_items
CREATE POLICY "Users can view their own budget items" ON public.budget_items FOR SELECT USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can insert their own budget items" ON public.budget_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can update their own budget items" ON public.budget_items FOR UPDATE USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));
CREATE POLICY "Users can delete their own budget items" ON public.budget_items FOR DELETE USING (EXISTS (SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()));

-- RLS Policies for contract_clauses
CREATE POLICY "Users can view their own contract clauses" ON public.contract_clauses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contract clauses" ON public.contract_clauses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contract clauses" ON public.contract_clauses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contract clauses" ON public.contract_clauses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contracts
CREATE POLICY "Users can view their own contracts" ON public.contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contracts" ON public.contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contracts" ON public.contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contracts" ON public.contracts FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_performance_types_updated_at BEFORE UPDATE ON public.performance_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contract_clauses_updated_at BEFORE UPDATE ON public.contract_clauses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();