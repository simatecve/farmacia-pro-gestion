-- Crear tabla de presupuestos
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de items de presupuesto
CREATE TABLE public.quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas para quotes
CREATE POLICY "Quotes are viewable by authenticated users"
ON public.quotes FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Quotes are insertable by authenticated users"
ON public.quotes FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Quotes are updatable by authenticated users"
ON public.quotes FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Quotes are deletable by authenticated users"
ON public.quotes FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

-- Políticas para quote_items
CREATE POLICY "Quote items are viewable by authenticated users"
ON public.quote_items FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Quote items are insertable by authenticated users"
ON public.quote_items FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Quote items are updatable by authenticated users"
ON public.quote_items FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Quote items are deletable by authenticated users"
ON public.quote_items FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

-- Trigger para actualizar updated_at
CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para generar número de presupuesto
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    next_number INTEGER;
    quote_number TEXT;
BEGIN
    -- Obtener el próximo número secuencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 'PRES-(.*)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM quotes
    WHERE quote_number LIKE 'PRES-%';
    
    -- Formato: PRES-NNNNNNNN (ej., PRES-00000001)
    quote_number := 'PRES-' || LPAD(next_number::TEXT, 8, '0');
    
    RETURN quote_number;
END;
$$;