-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Medicamentos', 'Productos farmacéuticos'),
('Cuidado Personal', 'Productos de higiene y cuidado'),
('Vitaminas', 'Suplementos vitamínicos'),
('Primeros Auxilios', 'Productos para primeros auxilios')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, sku, barcode, sale_price, purchase_price, min_stock, max_stock, unit_type, presentation, concentration, laboratory, active, category_id) 
SELECT 
    p.name, p.description, p.sku, p.barcode, p.sale_price, p.purchase_price, 
    p.min_stock, p.max_stock, p.unit_type, p.presentation, p.concentration, p.laboratory, p.active,
    c.id
FROM (VALUES
    ('Ibuprofeno 400mg', 'Antiinflamatorio y analgésico', 'IBU400', '7501234567890', 12.50, 8.00, 10, 100, 'unidad', 'Tabletas', '400mg', 'Laboratorio ABC', true, 'Medicamentos'),
    ('Paracetamol 500mg', 'Analgésico y antipirético', 'PAR500', '7501234567891', 8.75, 5.50, 15, 150, 'unidad', 'Tabletas', '500mg', 'Laboratorio XYZ', true, 'Medicamentos'),
    ('Vitamina C 1000mg', 'Suplemento vitamínico', 'VITC1000', '7501234567892', 25.00, 18.00, 5, 50, 'unidad', 'Tabletas', '1000mg', 'Vitaminas Plus', true, 'Vitaminas'),
    ('Alcohol 70%', 'Antiséptico', 'ALC70', '7501234567893', 15.00, 10.00, 20, 200, 'unidad', 'Frasco 250ml', '70%', 'Antisépticos SA', true, 'Primeros Auxilios'),
    ('Shampoo Anticaspa', 'Cuidado capilar', 'SHA001', '7501234567894', 35.50, 25.00, 8, 80, 'unidad', 'Frasco 400ml', 'N/A', 'Cuidado Total', true, 'Cuidado Personal'),
    ('Aspirina 500mg', 'Analgésico antiinflamatorio', 'ASP500', '7501234567895', 18.25, 12.00, 12, 120, 'unidad', 'Tabletas', '500mg', 'Bayer Pharma', true, 'Medicamentos'),
    ('Vendas Elásticas', 'Material de curación', 'VEN001', '7501234567896', 22.00, 15.00, 10, 100, 'unidad', 'Rollo 5cm x 4.5m', 'N/A', 'Medic Supplies', true, 'Primeros Auxilios'),
    ('Complejo B', 'Vitaminas del complejo B', 'COMB001', '7501234567897', 45.00, 32.00, 6, 60, 'unidad', 'Tabletas', 'Multivitamínico', 'Vitaminas Plus', true, 'Vitaminas')
) AS p(name, description, sku, barcode, sale_price, purchase_price, min_stock, max_stock, unit_type, presentation, concentration, laboratory, active, category_name)
JOIN categories c ON c.name = p.category_name
ON CONFLICT (sku) DO NOTHING;

-- Insert default location if not exists
INSERT INTO locations (name, description) VALUES
('Farmacia Principal', 'Ubicación principal de la farmacia')
ON CONFLICT DO NOTHING;

-- Insert inventory for products (only current_stock, available_stock is generated)
INSERT INTO inventory (product_id, location_id, current_stock)
SELECT p.id, l.id, 50
FROM products p
CROSS JOIN locations l
WHERE l.name = 'Farmacia Principal'
ON CONFLICT (product_id, location_id) DO NOTHING;

-- Insert CONSUMIDOR FINAL client
INSERT INTO clients (name, email, phone, address, identification_number, gender, notes) VALUES
('CONSUMIDOR FINAL', '0000000@0000000.com', '0000000', '0000000', '0000000', 'N/A', 'Cliente por defecto para ventas sin cliente específico')
ON CONFLICT DO NOTHING;

-- Insert sample clients
INSERT INTO clients (name, email, phone, address, identification_number, gender, notes) VALUES
('María Elena González Pérez', 'maria.gonzalez@email.com', '+593 123-4567', 'Av. Principal 123, Centro Comercial Plaza', '1234567890123', 'Femenino', 'Cliente frecuente'),
('Juan Carlos Rodríguez', 'juan.rodriguez@email.com', '+593 987-6543', 'Calle Secundaria 456, Sector Norte', '9876543210987', 'Masculino', 'Cliente con descuento especial'),
('Ana Sofía Martínez', 'ana.martinez@email.com', '+593 555-1234', 'Av. Los Andes 789, Urbanización El Bosque', '5555123456789', 'Femenino', 'Cliente VIP'),
('Carlos Alberto Vargas', 'carlos.vargas@email.com', '+593 333-9999', 'Calle Las Flores 321, Barrio La Esperanza', '3333999988881', 'Masculino', 'Cliente empresarial')
ON CONFLICT DO NOTHING;