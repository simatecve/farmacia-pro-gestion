import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductWithStock {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  sale_price: number;
  current_stock: number;
  unit_type: string;
  requires_prescription: boolean;
  active: boolean;
}

export function useProductsWithStock() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsWithStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (productsError) throw productsError;

      // Then get inventory data for these products
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('product_id, current_stock');

      if (inventoryError) throw inventoryError;

      // Create a map of product stock totals
      const stockMap = new Map<string, number>();
      (inventoryData || []).forEach(item => {
        const currentStock = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, currentStock + (item.current_stock || 0));
      });

      // Combine products with their stock information
      const productsWithStock: ProductWithStock[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        sale_price: product.sale_price,
        unit_type: product.unit_type,
        requires_prescription: product.requires_prescription,
        active: product.active,
        current_stock: stockMap.get(product.id) || 0
      }));

      setProducts(productsWithStock);
    } catch (err) {
      console.error('Error fetching products with stock:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsWithStock();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProductsWithStock,
  };
}