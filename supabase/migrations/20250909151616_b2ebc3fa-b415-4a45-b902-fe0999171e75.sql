-- First, let's ensure we have the CONSUMIDOR FINAL client
INSERT INTO clients (name, email, phone, address, identification_number, gender, notes) 
VALUES ('CONSUMIDOR FINAL', '0000000@0000000.com', '0000000', '0000000', '0000000', 'N/A', 'Cliente por defecto para ventas sin cliente específico')
ON CONFLICT (identification_number) DO NOTHING;

-- Insert more sample products to ensure we have inventory
INSERT INTO products (name, description, sku, barcode, sale_price, purchase_price, min_stock, max_stock, unit_type, presentation, concentration, laboratory, active) 
VALUES 
('Acetaminofén 500mg', 'Analgésico y antipirético', 'ACE500', '7501234567898', 6.50, 4.00, 20, 200, 'unidad', 'Tabletas', '500mg', 'Farma Corp', true),
('Omeprazol 20mg', 'Inhibidor de la bomba de protones', 'OME20', '7501234567899', 18.75, 12.50, 10, 100, 'unidad', 'Cápsulas', '20mg', 'Gastro Lab', true),
('Loratadina 10mg', 'Antihistamínico', 'LOR10', '7501234567900', 15.25, 9.75, 15, 150, 'unidad', 'Tabletas', '10mg', 'Allergy Plus', true)
ON CONFLICT (sku) DO NOTHING;

-- Ensure we have inventory for all products
INSERT INTO inventory (product_id, location_id, current_stock)
SELECT p.id, l.id, 25
FROM products p
CROSS JOIN locations l
WHERE l.name = 'Farmacia Principal'
ON CONFLICT (product_id, location_id) DO UPDATE SET current_stock = 25;