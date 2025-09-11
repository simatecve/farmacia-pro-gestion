import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SaleItem {
  id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface Sale {
  id?: string;
  sale_number: string;
  client_id?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_method?: string;
  status: string;
  notes?: string;
  created_at: string;
  items?: SaleItem[];
}

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSales = async (limit = 50) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedSales = (data as any)?.map((sale: any) => ({
        ...sale,
        items: sale.sale_items?.map((item: any) => ({
          ...item,
          product_name: item.products?.name
        }))
      })) || [];

      setSales(formattedSales);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: Omit<Sale, 'id' | 'created_at'> & { points_redeemed?: number }, items: SaleItem[]) => {
    setLoading(true);
    try {
      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;

      // Handle loyalty points if client is selected
      if (saleData.client_id) {
        try {
          // Get current client data
          const { data: currentClient } = await supabase
            .from('clients')
            .select('loyalty_points, total_purchases')
            .eq('id', saleData.client_id)
            .single();

          let updatedPoints = currentClient?.loyalty_points || 0;
          
          // Handle points redemption first
          if (saleData.points_redeemed && saleData.points_redeemed > 0) {
            updatedPoints -= saleData.points_redeemed;
            
            // Create redemption transaction
            await supabase
              .from('loyalty_transactions')
              .insert([{
                client_id: saleData.client_id,
                transaction_type: 'redeem',
                points: -saleData.points_redeemed,
                description: `Puntos canjeados en compra - ${saleData.sale_number}`,
                reference_id: sale.id,
                reference_type: 'sale'
              }]);
          }

          // Get active loyalty plan for earning points
          const { data: loyaltyPlan } = await supabase
            .from('loyalty_plans')
            .select('*')
            .eq('active', true)
            .single();

          if (loyaltyPlan) {
            const pointsEarned = Math.floor(saleData.total_amount * loyaltyPlan.points_per_currency);
            
            if (pointsEarned > 0) {
              updatedPoints += pointsEarned;
              
              // Create earning transaction
              await supabase
                .from('loyalty_transactions')
                .insert([{
                  client_id: saleData.client_id,
                  transaction_type: 'earn',
                  points: pointsEarned,
                  description: `Puntos ganados por compra - ${saleData.sale_number}`,
                  reference_id: sale.id,
                  reference_type: 'sale'
                }]);

            }
          }
          
          // Update client points and purchase data
          await supabase
            .from('clients')
            .update({ 
              loyalty_points: updatedPoints,
              total_purchases: (currentClient?.total_purchases || 0) + saleData.total_amount,
              last_purchase_date: new Date().toISOString()
            })
            .eq('id', saleData.client_id);
        } catch (loyaltyError) {
          console.error('Error processing loyalty points:', loyaltyError);
          // Don't fail the entire sale if loyalty points fail
        }
      }

      // Create sale items
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update inventory and create movements for each item
      for (const item of items) {
        try {
          // Get current inventory for the product (using first available location)
          const { data: inventoryData } = await supabase
            .from('inventory')
            .select('*')
            .eq('product_id', item.product_id)
            .order('current_stock', { ascending: false })
            .limit(1)
            .single();

          if (inventoryData) {
            const stockBefore = inventoryData.current_stock;
            const stockAfter = stockBefore - item.quantity;

            if (stockAfter < 0) {
              console.warn(`Stock insuficiente para producto ${item.product_id}. Stock actual: ${stockBefore}, cantidad solicitada: ${item.quantity}`);
              // Continuar con la venta pero registrar stock negativo
            }

            // Update inventory stock
            await supabase
              .from('inventory')
              .update({ current_stock: stockAfter })
              .eq('id', inventoryData.id);

            // Create inventory movement
            await supabase
              .from('inventory_movements')
              .insert({
                product_id: item.product_id,
                location_id: inventoryData.location_id,
                movement_type: 'venta',
                quantity: -item.quantity, // Negative for sales
                unit_cost: item.unit_price,
                total_cost: item.total_price,
                stock_before: stockBefore,
                stock_after: stockAfter,
                reference_type: 'sale',
                reference_id: sale.id,
                notes: `Venta ${saleData.sale_number}`
              });
          }
        } catch (inventoryError) {
          console.error(`Error updating inventory for product ${item.product_id}:`, inventoryError);
          // Don't fail the entire sale if inventory update fails
        }
      }

      // Create payment record if payment method is provided
      if (saleData.payment_method) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            sale_id: sale.id,
            amount: saleData.total_amount,
            payment_method: saleData.payment_method
          }]);

        if (paymentError) throw paymentError;
      }

      toast({
        title: "Éxito",
        description: "Venta registrada correctamente"
      });

      await fetchSales();
      return sale;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSalesByDateRange = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (name)
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateSaleNumber = () => {
    const date = new Date();
    const timestamp = date.getTime();
    return `VTA-${timestamp.toString().slice(-8)}`;
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    createSale,
    fetchSales,
    getSalesByDateRange,
    generateSaleNumber
  };
};