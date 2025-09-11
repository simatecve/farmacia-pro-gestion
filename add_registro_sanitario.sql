-- SQL para agregar el campo registro_sanitario a la tabla products
-- Ejecutar este comando en la base de datos de Supabase

ALTER TABLE products 
ADD COLUMN registro_sanitario TEXT;

-- Comentario opcional para agregar un índice si se necesita búsqueda rápida
-- CREATE INDEX idx_products_registro_sanitario ON products(registro_sanitario);

-- Verificar que el campo se agregó correctamente
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'registro_sanitario';