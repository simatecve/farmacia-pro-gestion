-- Update inventory to add stock to all products (only current_stock)
UPDATE public.inventory 
SET current_stock = 50
WHERE current_stock = 0 OR current_stock IS NULL;