-- Insert inventory records for products that don't have inventory yet
-- Using the main storage location (Bodega) as default location
INSERT INTO public.inventory (product_id, location_id, current_stock, available_stock, reserved_stock)
SELECT 
    p.id as product_id,
    '556a9540-618b-453c-a688-8a157c43dcc7'::uuid as location_id, -- Bodega location
    50 as current_stock,
    50 as available_stock,
    0 as reserved_stock
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM inventory i 
    WHERE i.product_id = p.id 
    AND i.location_id = '556a9540-618b-453c-a688-8a157c43dcc7'::uuid
);