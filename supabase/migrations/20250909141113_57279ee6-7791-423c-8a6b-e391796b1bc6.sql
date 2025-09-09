-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  identification_number TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'femenino', 'otro')),
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  total_purchases NUMERIC NOT NULL DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty_transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem')),
  points INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_campaigns table
CREATE TABLE public.client_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('promotional', 'reminder', 'birthday', 'loyalty')),
  target_criteria JSONB,
  message_template TEXT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_reminders table
CREATE TABLE public.client_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('medication', 'appointment', 'refill', 'birthday')),
  title TEXT NOT NULL,
  message TEXT,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table (for client purchase history)
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  sale_number TEXT NOT NULL UNIQUE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Clients are viewable by authenticated users" ON public.clients FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Clients are insertable by authenticated users" ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Clients are updatable by authenticated users" ON public.clients FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Clients are deletable by authenticated users" ON public.clients FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for suppliers
CREATE POLICY "Suppliers are viewable by authenticated users" ON public.suppliers FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Suppliers are insertable by authenticated users" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Suppliers are updatable by authenticated users" ON public.suppliers FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Suppliers are deletable by authenticated users" ON public.suppliers FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for loyalty_transactions
CREATE POLICY "Loyalty transactions are viewable by authenticated users" ON public.loyalty_transactions FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Loyalty transactions are insertable by authenticated users" ON public.loyalty_transactions FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Loyalty transactions are updatable by authenticated users" ON public.loyalty_transactions FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Loyalty transactions are deletable by authenticated users" ON public.loyalty_transactions FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for client_campaigns
CREATE POLICY "Client campaigns are viewable by authenticated users" ON public.client_campaigns FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Client campaigns are insertable by authenticated users" ON public.client_campaigns FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Client campaigns are updatable by authenticated users" ON public.client_campaigns FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Client campaigns are deletable by authenticated users" ON public.client_campaigns FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for client_reminders
CREATE POLICY "Client reminders are viewable by authenticated users" ON public.client_reminders FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Client reminders are insertable by authenticated users" ON public.client_reminders FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Client reminders are updatable by authenticated users" ON public.client_reminders FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Client reminders are deletable by authenticated users" ON public.client_reminders FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for sales
CREATE POLICY "Sales are viewable by authenticated users" ON public.sales FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Sales are insertable by authenticated users" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sales are updatable by authenticated users" ON public.sales FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Sales are deletable by authenticated users" ON public.sales FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for sale_items
CREATE POLICY "Sale items are viewable by authenticated users" ON public.sale_items FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Sale items are insertable by authenticated users" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Sale items are updatable by authenticated users" ON public.sale_items FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Sale items are deletable by authenticated users" ON public.sale_items FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create triggers for automatic timestamps
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_campaigns_updated_at BEFORE UPDATE ON public.client_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();