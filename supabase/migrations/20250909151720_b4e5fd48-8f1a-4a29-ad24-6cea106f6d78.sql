-- Insert more sample products to ensure we have inventory
INSERT INTO products (name, description, sku, barcode, sale_price, purchase_price, min_stock, max_stock, unit_type, presentation, concentration, laboratory, active) 
VALUES 
('Acetaminofén 500mg', 'Analgésico y antipirético', 'ACE500', '7501234567898', 6.50, 4.00, 20, 200, 'unidad', 'Tabletas', '500mg', 'Farma Corp', true),
('Omeprazol 20mg', 'Inhibidor de la bomba de protones', 'OME20', '7501234567899', 18.75, 12.50, 10, 100, 'unidad', 'Cápsulas', '20mg', 'Gastro Lab', true),
('Loratadina 10mg', 'Antihistamínico', 'LOR10', '7501234567900', 15.25, 9.75, 15, 150, 'unidad', 'Tabletas', '10mg', 'Allergy Plus', true);

-- Update inventory for all products
UPDATE inventory SET current_stock = 25 WHERE current_stock < 25;