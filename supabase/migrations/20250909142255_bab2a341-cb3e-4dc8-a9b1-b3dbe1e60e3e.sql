-- Create audit_logs table for system auditing
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash_register_sessions table for POS operations
CREATE TABLE public.cash_register_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  register_name TEXT NOT NULL DEFAULT 'Principal',
  opening_amount NUMERIC NOT NULL DEFAULT 0,
  closing_amount NUMERIC,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_cash NUMERIC NOT NULL DEFAULT 0,
  total_card NUMERIC NOT NULL DEFAULT 0,
  total_other NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'points_multiplier')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_purchase_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  applicable_products JSONB,
  applicable_categories JSONB,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts_receivable table
CREATE TABLE public.accounts_receivable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  sale_id UUID,
  amount NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  balance NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create refunds table
CREATE TABLE public.refunds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL,
  client_id UUID,
  user_id UUID NOT NULL,
  refund_amount NUMERIC NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_method TEXT NOT NULL CHECK (refund_method IN ('cash', 'card', 'store_credit', 'points')),
  items_refunded JSONB NOT NULL,
  approved_by UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty_plans table for points configuration
CREATE TABLE public.loyalty_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_per_currency NUMERIC NOT NULL DEFAULT 1,
  currency_per_point NUMERIC NOT NULL DEFAULT 0.01,
  min_purchase_for_points NUMERIC NOT NULL DEFAULT 0,
  points_expiry_days INTEGER DEFAULT 365,
  welcome_points INTEGER NOT NULL DEFAULT 0,
  birthday_points INTEGER NOT NULL DEFAULT 0,
  referral_points INTEGER NOT NULL DEFAULT 0,
  tier_requirements JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table for tracking payment methods
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'points', 'credit')),
  amount NUMERIC NOT NULL,
  reference_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
CREATE POLICY "Audit logs are viewable by authenticated users" ON public.audit_logs FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Audit logs are insertable by authenticated users" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for cash_register_sessions
CREATE POLICY "Cash register sessions are viewable by authenticated users" ON public.cash_register_sessions FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Cash register sessions are insertable by authenticated users" ON public.cash_register_sessions FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Cash register sessions are updatable by authenticated users" ON public.cash_register_sessions FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for promotions
CREATE POLICY "Promotions are viewable by authenticated users" ON public.promotions FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Promotions are insertable by authenticated users" ON public.promotions FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Promotions are updatable by authenticated users" ON public.promotions FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Promotions are deletable by authenticated users" ON public.promotions FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for accounts_receivable
CREATE POLICY "Accounts receivable are viewable by authenticated users" ON public.accounts_receivable FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Accounts receivable are insertable by authenticated users" ON public.accounts_receivable FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Accounts receivable are updatable by authenticated users" ON public.accounts_receivable FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Accounts receivable are deletable by authenticated users" ON public.accounts_receivable FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for refunds
CREATE POLICY "Refunds are viewable by authenticated users" ON public.refunds FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Refunds are insertable by authenticated users" ON public.refunds FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Refunds are updatable by authenticated users" ON public.refunds FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for loyalty_plans
CREATE POLICY "Loyalty plans are viewable by authenticated users" ON public.loyalty_plans FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Loyalty plans are insertable by authenticated users" ON public.loyalty_plans FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Loyalty plans are updatable by authenticated users" ON public.loyalty_plans FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Loyalty plans are deletable by authenticated users" ON public.loyalty_plans FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Create RLS policies for payments
CREATE POLICY "Payments are viewable by authenticated users" ON public.payments FOR SELECT TO authenticated USING (auth.role() = 'authenticated');
CREATE POLICY "Payments are insertable by authenticated users" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Payments are updatable by authenticated users" ON public.payments FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

-- Create triggers for automatic timestamps
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON public.accounts_receivable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loyalty_plans_updated_at BEFORE UPDATE ON public.loyalty_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values
    ) VALUES (
      auth.uid(),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      auth.uid(),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
CREATE TRIGGER audit_clients_trigger AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_products_trigger AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_sales_trigger AFTER INSERT OR UPDATE OR DELETE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_inventory_trigger AFTER INSERT OR UPDATE OR DELETE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();