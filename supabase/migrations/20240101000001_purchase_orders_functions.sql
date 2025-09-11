-- Function to generate purchase order number
CREATE OR REPLACE FUNCTION generate_purchase_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    order_number TEXT;
BEGIN
    -- Get the next sequential number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'PO-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-(.*)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM purchase_orders
    WHERE order_number LIKE 'PO-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%';
    
    -- Format: PO-YYYY-NNNN (e.g., PO-2024-0001)
    order_number := 'PO-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate purchase order totals
CREATE OR REPLACE FUNCTION calculate_purchase_order_totals(p_purchase_order_id UUID)
RETURNS VOID AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_tax_amount DECIMAL(10,2);
    v_total_amount DECIMAL(10,2);
    v_tax_rate DECIMAL(5,4) := 0.16; -- 16% IVA by default
BEGIN
    -- Calculate subtotal from items
    SELECT COALESCE(SUM(total_price), 0)
    INTO v_subtotal
    FROM purchase_order_items
    WHERE purchase_order_id = p_purchase_order_id;
    
    -- Calculate tax amount
    v_tax_amount := v_subtotal * v_tax_rate;
    
    -- Calculate total
    v_total_amount := v_subtotal + v_tax_amount;
    
    -- Update purchase order totals
    UPDATE purchase_orders
    SET 
        subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total_amount = v_total_amount,
        updated_at = NOW()
    WHERE id = p_purchase_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock when receiving purchase order
CREATE OR REPLACE FUNCTION receive_purchase_order_item(
    p_purchase_order_item_id UUID,
    p_received_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_product_id UUID;
    v_current_stock INTEGER;
BEGIN
    -- Get product ID from purchase order item
    SELECT product_id INTO v_product_id
    FROM purchase_order_items
    WHERE id = p_purchase_order_item_id;
    
    -- Update received quantity
    UPDATE purchase_order_items
    SET 
        received_quantity = p_received_quantity,
        updated_at = NOW()
    WHERE id = p_purchase_order_item_id;
    
    -- Update product stock
    UPDATE products
    SET 
        stock = stock + p_received_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;
    
    -- Create inventory movement record
    INSERT INTO inventory_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes
    ) VALUES (
        v_product_id,
        'entrada',
        p_received_quantity,
        'purchase_order',
        p_purchase_order_item_id,
        'Recepción de orden de compra'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to mark purchase order as received
CREATE OR REPLACE FUNCTION mark_purchase_order_received(p_purchase_order_id UUID)
RETURNS VOID AS $$
DECLARE
    v_all_received BOOLEAN;
BEGIN
    -- Check if all items have been fully received
    SELECT NOT EXISTS (
        SELECT 1 FROM purchase_order_items
        WHERE purchase_order_id = p_purchase_order_id
        AND received_quantity < quantity
    ) INTO v_all_received;
    
    -- Update purchase order status if all items received
    IF v_all_received THEN
        UPDATE purchase_orders
        SET 
            status = 'received',
            received_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = p_purchase_order_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION trigger_generate_purchase_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_purchase_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_order_number_trigger
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_purchase_order_number();

-- Trigger to recalculate totals when items change
CREATE OR REPLACE FUNCTION trigger_recalculate_purchase_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate totals for the affected purchase order
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_purchase_order_totals(OLD.purchase_order_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_purchase_order_totals(NEW.purchase_order_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_order_items_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_purchase_order_totals();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_purchase_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_purchase_order_totals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION receive_purchase_order_item(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_purchase_order_received(UUID) TO authenticated;