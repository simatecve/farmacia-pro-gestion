-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  category_id UUID REFERENCES public.categories(id),
  unit_type TEXT NOT NULL DEFAULT 'unidad',
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 0,
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  batch_number TEXT,
  expiry_date DATE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, location_id, batch_number)
);

-- Create inventory movements table (kardex)
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste', 'transferencia', 'venta', 'compra', 'devolucion')),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  batch_number TEXT,
  expiry_date DATE,
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id),
  stock_before INTEGER NOT NULL DEFAULT 0,
  stock_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for authenticated users)
CREATE POLICY "Categories are viewable by authenticated users" ON public.categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Categories are insertable by authenticated users" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Categories are updatable by authenticated users" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Categories are deletable by authenticated users" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Locations are viewable by authenticated users" ON public.locations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Locations are insertable by authenticated users" ON public.locations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Locations are updatable by authenticated users" ON public.locations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Locations are deletable by authenticated users" ON public.locations FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Products are viewable by authenticated users" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Products are insertable by authenticated users" ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Products are updatable by authenticated users" ON public.products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Products are deletable by authenticated users" ON public.products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory is viewable by authenticated users" ON public.inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory is insertable by authenticated users" ON public.inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Inventory is updatable by authenticated users" ON public.inventory FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory is deletable by authenticated users" ON public.inventory FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory movements are viewable by authenticated users" ON public.inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory movements are insertable by authenticated users" ON public.inventory_movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Inventory movements are updatable by authenticated users" ON public.inventory_movements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Inventory movements are deletable by authenticated users" ON public.inventory_movements FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_inventory_product ON public.inventory(product_id);
CREATE INDEX idx_inventory_location ON public.inventory(location_id);
CREATE INDEX idx_inventory_expiry ON public.inventory(expiry_date);
CREATE INDEX idx_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_movements_location ON public.inventory_movements(location_id);
CREATE INDEX idx_movements_date ON public.inventory_movements(created_at);
CREATE INDEX idx_movements_type ON public.inventory_movements(movement_type);

-- Insert sample data
INSERT INTO public.categories (name, description) VALUES
  ('Medicamentos', 'Medicamentos y fármacos'),
  ('Suplementos', 'Vitaminas y suplementos nutricionales'),
  ('Cuidado Personal', 'Productos de higiene y cuidado personal'),
  ('Primeros Auxilios', 'Vendas, antisépticos y material de curación');

INSERT INTO public.locations (name, description) VALUES
  ('Estante A1', 'Estante principal - sección A1'),
  ('Estante A2', 'Estante principal - sección A2'),
  ('Refrigerador', 'Almacenamiento refrigerado'),
  ('Bodega', 'Almacén principal'),
  ('Mostrador', 'Área de venta directa');