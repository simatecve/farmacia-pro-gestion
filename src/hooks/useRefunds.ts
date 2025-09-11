import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RefundItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
}

export interface Refund {
  id: string;
  sale_id: string;
  client_id?: string;
  refund_reason: string;
  refund_method: string;
  refund_amount: number;
  items_refunded: RefundItem[];
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  approved_by?: string;
  processed_at?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  sale_number: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  client_id?: string;
  client?: {
    name: string;
  };
  sale_items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      name: string;
      sku?: string;
    };
  }[];
}

export function useRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedRefunds = (data || []).map(refund => ({
        ...refund,
        items_refunded: Array.isArray(refund.items_refunded) ? refund.items_refunded as unknown as RefundItem[] : [],
        status: refund.status as 'pending' | 'approved' | 'rejected'
      }));
      setRefunds(formattedRefunds);
    } catch (err) {
      console.error('Error fetching refunds:', err);
      setError(err instanceof Error ? err.message : 'Error fetching refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          sale_number,
          total_amount,
          payment_method,
          created_at,
          client_id,
          clients (
            name
          ),
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              sku
            )
          )
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedSales = (data || []).map(sale => ({
        ...sale,
        client: sale.clients as any,
        sale_items: sale.sale_items.map(item => ({
          ...item,
          product: item.products as any
        }))
      }));
      setSales(formattedSales);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const createRefund = async (refundData: {
    sale_id: string;
    client_id?: string;
    refund_reason: string;
    refund_method: string;
    refund_amount: number;
    items_refunded: RefundItem[];
  }) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('refunds')
        .insert({
          ...refundData,
          items_refunded: refundData.items_refunded as any,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create inventory movements to return stock
      for (const item of refundData.items_refunded) {
        // Get default location for inventory return
        const { data: locations } = await supabase
          .from('locations')
          .select('id')
          .limit(1);

        if (locations && locations.length > 0) {
          // Get current stock before movement
          const { data: currentInventory } = await supabase
            .from('inventory')
            .select('current_stock')
            .eq('product_id', item.product_id)
            .eq('location_id', locations[0].id)
            .single();

          const stockBefore = currentInventory?.current_stock || 0;
          const stockAfter = stockBefore + item.quantity;

          // Create inventory movement
          await supabase
            .from('inventory_movements')
            .insert({
              product_id: item.product_id,
              location_id: locations[0].id,
              movement_type: 'devolucion',
              quantity: item.quantity,
              unit_cost: item.unit_price,
              total_cost: item.total_price,
              stock_before: stockBefore,
              stock_after: stockAfter,
              reference_type: 'refund',
              reference_id: data.id,
              notes: `Devolución de venta ${refundData.sale_id}`
            });

          // Update inventory stock
          await supabase
            .from('inventory')
            .upsert({
              product_id: item.product_id,
              location_id: locations[0].id,
              current_stock: stockAfter,
              available_stock: stockAfter
            });
        }
      }

      toast({
        title: "Devolución creada",
        description: "La devolución ha sido registrada exitosamente.",
      });

      await fetchRefunds();
      return data;
    } catch (err) {
      console.error('Error creating refund:', err);
      setError(err instanceof Error ? err.message : 'Error creating refund');
      toast({
        title: "Error",
        description: "No se pudo crear la devolución.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRefund = async (refundId: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: 'approved',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: "Devolución aprobada",
        description: "La devolución ha sido aprobada.",
      });

      await fetchRefunds();
    } catch (err) {
      console.error('Error approving refund:', err);
      toast({
        title: "Error",
        description: "No se pudo aprobar la devolución.",
        variant: "destructive",
      });
    }
  };

  const rejectRefund = async (refundId: string) => {
    try {
      const { error } = await supabase
        .from('refunds')
        .update({
          status: 'rejected',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', refundId);

      if (error) throw error;

      toast({
        title: "Devolución rechazada",
        description: "La devolución ha sido rechazada.",
      });

      await fetchRefunds();
    } catch (err) {
      console.error('Error rejecting refund:', err);
      toast({
        title: "Error",
        description: "No se pudo rechazar la devolución.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRefunds();
    fetchSales();
  }, []);

  return {
    refunds,
    sales,
    loading,
    error,
    createRefund,
    approveRefund,
    rejectRefund,
    fetchRefunds,
    fetchSales
  };
}