-- Add tax_id column to products table
ALTER TABLE products ADD COLUMN tax_id UUID REFERENCES tax_settings(id);

-- Add index for better performance
CREATE INDEX idx_products_tax_id ON products(tax_id);

-- Add comment to document the column
COMMENT ON COLUMN products.tax_id IS 'Reference to tax_settings table for product-specific tax rates';