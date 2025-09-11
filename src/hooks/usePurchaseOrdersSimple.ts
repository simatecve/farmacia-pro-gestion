import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function usePurchaseOrdersSimple() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simple query without complex joins since purchase_orders table doesn't exist in types
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .limit(1);

      if (error && error.message.includes('purchase_orders')) {
        // Table doesn't exist, return empty array
        setOrders([]);
        return;
      }

      // For now, return empty array until purchase_orders table is properly set up
      setOrders([]);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}