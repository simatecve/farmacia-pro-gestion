import { useState } from 'react';

// Disabled hook since purchase_orders table doesn't exist
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
  const [orders] = useState<PurchaseOrder[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>('Purchase orders functionality is disabled - tables not found');

  const createOrder = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    return { success: false, error: 'Purchase orders functionality is disabled' };
  };

  const updateOrder = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    return { success: false, error: 'Purchase orders functionality is disabled' };
  };

  const receiveOrderItem = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Purchase orders functionality is disabled' };
  };

  const markOrderAsReceived = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Purchase orders functionality is disabled' };
  };

  const deleteOrder = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Purchase orders functionality is disabled' };
  };

  const fetchOrders = async () => {
    // No-op
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    receiveOrderItem,
    markOrderAsReceived,
    refetch: fetchOrders,
  };
}