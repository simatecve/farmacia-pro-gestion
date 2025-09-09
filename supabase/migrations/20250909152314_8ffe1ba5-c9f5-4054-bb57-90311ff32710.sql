-- Update inventory to add stock to all products
UPDATE public.inventory 
SET 
  current_stock = 50,
  available_stock = 50
WHERE current_stock = 0 OR current_stock IS NULL;