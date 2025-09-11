import { useState, useEffect } from 'react';

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

// Disabled hook - purchase_orders table not in database schema
export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return empty data since tables don't exist
  const fetchOrders = async () => {
    setLoading(false);
    setOrders([]);
    setError(null);
  };

  const createOrder = async (_orderData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
    return { 
      success: false, 
      error: 'Purchase orders functionality is not available - tables not configured in database' 
    };
  };

  const updateOrder = async (_id: string, _orderData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
    return { 
      success: false, 
      error: 'Purchase orders functionality is not available - tables not configured in database' 
    };
  };

  const deleteOrder = async (_id: string): Promise<{ success: boolean; error?: string }> => {
    return { 
      success: false, 
      error: 'Purchase orders functionality is not available - tables not configured in database' 
    };
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