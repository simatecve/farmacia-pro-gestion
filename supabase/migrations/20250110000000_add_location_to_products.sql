-- Add location_id column to products table with foreign key to locations
ALTER TABLE public.products 
ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Add comment to explain the location_id field
COMMENT ON COLUMN public.products.location_id IS 'Reference to the location where the product is stored';

-- Create index for better performance
CREATE INDEX idx_products_location_id ON public.products(location_id);