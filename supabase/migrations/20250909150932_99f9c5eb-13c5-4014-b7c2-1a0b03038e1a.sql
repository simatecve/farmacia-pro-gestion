-- Add foreign key constraints to establish relationships

-- Add foreign key from sale_items to sales
ALTER TABLE sale_items 
ADD CONSTRAINT fk_sale_items_sale_id 
FOREIGN KEY (sale_id) REFERENCES sales(id) 
ON DELETE CASCADE;

-- Add foreign key from sale_items to products  
ALTER TABLE sale_items 
ADD CONSTRAINT fk_sale_items_product_id 
FOREIGN KEY (product_id) REFERENCES products(id) 
ON DELETE RESTRICT;

-- Add foreign key from sales to clients (optional, can be null)
ALTER TABLE sales 
ADD CONSTRAINT fk_sales_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) 
ON DELETE SET NULL;