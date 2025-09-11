import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Temporary disabled hook since purchase_orders table doesn't exist
export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  supplier_name?: string;
  items_count?: number;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers(name),
          purchase_order_items(count)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching purchase orders:', fetchError);
        setError(fetchError.message);
        return;
      }

      const ordersWithDetails = data?.map(order => ({
        ...order,
        supplier_name: order.suppliers?.name || 'Sin proveedor',
        items_count: order.purchase_order_items?.[0]?.count || 0
      })) || [];

      setOrders(ordersWithDetails);
    } catch (err) {
      console.error('Error in fetchOrders:', err);
      setError('Error al cargar las órdenes de compra');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const { data, error: createError } = await supabase
        .from('purchase_orders')
        .insert({
          supplier_id: orderData.supplier_id,
          order_date: orderData.order_date,
          expected_delivery_date: orderData.expected_delivery_date,
          status: orderData.status || 'pending',
          notes: orderData.notes,
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating purchase order:', createError);
        return { success: false, error: createError.message };
      }

      // Create order items if provided
      if (orderData.items && orderData.items.length > 0) {
        const itemsToInsert = orderData.items.map((item: any) => ({
          purchase_order_id: data.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating purchase order items:', itemsError);
          return { success: false, error: itemsError.message };
        }
      }

      await fetchOrders();
      return { success: true, data };
    } catch (err) {
      console.error('Error in createOrder:', err);
      return { success: false, error: 'Error al crear la orden de compra' };
    }
  };

  const updateOrder = async (id: string, orderData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const { data, error: updateError } = await supabase
        .from('purchase_orders')
        .update(orderData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating purchase order:', updateError);
        return { success: false, error: updateError.message };
      }

      await fetchOrders();
      return { success: true, data };
    } catch (err) {
      console.error('Error in updateOrder:', err);
      return { success: false, error: 'Error al actualizar la orden de compra' };
    }
  };

  const deleteOrder = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: deleteError } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting purchase order:', deleteError);
        return { success: false, error: deleteError.message };
      }

      await fetchOrders();
      return { success: true };
    } catch (err) {
      console.error('Error in deleteOrder:', err);
      return { success: false, error: 'Error al eliminar la orden de compra' };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  };
}