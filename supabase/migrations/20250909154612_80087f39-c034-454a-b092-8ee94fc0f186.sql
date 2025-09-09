-- Create company_settings table for business information
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Mi Empresa',
  legal_name TEXT,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'MXN',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  timezone TEXT NOT NULL DEFAULT 'America/Mexico_City',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tax_settings table for tax configuration
CREATE TABLE public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rate NUMERIC(5,4) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create device_settings table for peripherals configuration
CREATE TABLE public.device_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_type TEXT NOT NULL, -- 'printer', 'cash_drawer', 'barcode_reader', 'scale'
  device_name TEXT NOT NULL,
  connection_type TEXT NOT NULL, -- 'usb', 'network', 'bluetooth', 'serial'
  connection_config JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create print_settings table for receipt printing configuration
CREATE TABLE public.print_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_width INTEGER NOT NULL DEFAULT 80, -- mm
  paper_type TEXT NOT NULL DEFAULT 'thermal',
  print_logo BOOLEAN NOT NULL DEFAULT true,
  print_barcode BOOLEAN NOT NULL DEFAULT false,
  footer_text TEXT,
  copies INTEGER NOT NULL DEFAULT 1,
  auto_print BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all configuration tables
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all configuration tables
CREATE POLICY "Company settings are viewable by authenticated users" 
ON public.company_settings FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Company settings are insertable by authenticated users" 
ON public.company_settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Company settings are updatable by authenticated users" 
ON public.company_settings FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Tax settings are viewable by authenticated users" 
ON public.tax_settings FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Tax settings are insertable by authenticated users" 
ON public.tax_settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Tax settings are updatable by authenticated users" 
ON public.tax_settings FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Tax settings are deletable by authenticated users" 
ON public.tax_settings FOR DELETE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Device settings are viewable by authenticated users" 
ON public.device_settings FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Device settings are insertable by authenticated users" 
ON public.device_settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Device settings are updatable by authenticated users" 
ON public.device_settings FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Device settings are deletable by authenticated users" 
ON public.device_settings FOR DELETE 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Print settings are viewable by authenticated users" 
ON public.print_settings FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Print settings are insertable by authenticated users" 
ON public.print_settings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Print settings are updatable by authenticated users" 
ON public.print_settings FOR UPDATE 
USING (auth.role() = 'authenticated'::text);

-- Create triggers for updated_at
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at
BEFORE UPDATE ON public.tax_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_settings_updated_at
BEFORE UPDATE ON public.device_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_print_settings_updated_at
BEFORE UPDATE ON public.print_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.company_settings (name, currency, currency_symbol) VALUES 
('Daalef Farmacia', 'MXN', '$');

INSERT INTO public.tax_settings (name, rate, is_default, description) VALUES 
('IVA', 0.16, true, 'Impuesto al Valor Agregado 16%');

INSERT INTO public.print_settings (paper_width, paper_type, print_logo, footer_text) VALUES 
(80, 'thermal', true, 'Gracias por su compra - Daalef Farmacia');