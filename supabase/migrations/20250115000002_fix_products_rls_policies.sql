-- Fix RLS policies for products and related tables
-- Drop existing policies for products
DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON public.products;

-- Drop existing policies for categories
DROP POLICY IF EXISTS "Categories are viewable by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Categories are insertable by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Categories are updatable by authenticated users" ON public.categories;
DROP POLICY IF EXISTS "Categories are deletable by authenticated users" ON public.categories;

-- Drop existing policies for locations
DROP POLICY IF EXISTS "Locations are viewable by authenticated users" ON public.locations;
DROP POLICY IF EXISTS "Locations are insertable by authenticated users" ON public.locations;
DROP POLICY IF EXISTS "Locations are updatable by authenticated users" ON public.locations;
DROP POLICY IF EXISTS "Locations are deletable by authenticated users" ON public.locations;

-- Create new RLS policies for products with correct authentication check
CREATE POLICY "Products are viewable by authenticated users" ON public.products 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Products are insertable by authenticated users" ON public.products 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Products are updatable by authenticated users" ON public.products 
  FOR UPDATE TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Products are deletable by authenticated users" ON public.products 
  FOR DELETE TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Create new RLS policies for categories with correct authentication check
CREATE POLICY "Categories are viewable by authenticated users" ON public.categories 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Categories are insertable by authenticated users" ON public.categories 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Categories are updatable by authenticated users" ON public.categories 
  FOR UPDATE TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Categories are deletable by authenticated users" ON public.categories 
  FOR DELETE TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Create new RLS policies for locations with correct authentication check
CREATE POLICY "Locations are viewable by authenticated users" ON public.locations 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Locations are insertable by authenticated users" ON public.locations 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Locations are updatable by authenticated users" ON public.locations 
  FOR UPDATE TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Locations are deletable by authenticated users" ON public.locations 
  FOR DELETE TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Add missing columns to products table if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS presentation TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS concentration TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS laboratory TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);