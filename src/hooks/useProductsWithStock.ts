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
      
      // Fetch products with their inventory data using a better approach
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          current_stock,
          product:products!inner(
            id,
            name,
            sku,
            barcode,
            sale_price,
            unit_type,
            requires_prescription,
            active
          )
        `)
        .eq('product.active', true)
        .order('product.name');

      if (inventoryError) throw inventoryError;

      // Group by product and sum stock from all locations
      const productMap = new Map<string, ProductWithStock>();
      
      (inventoryData || []).forEach(item => {
        const product = item.product;
        const existingProduct = productMap.get(product.id);
        
        if (existingProduct) {
          existingProduct.current_stock += item.current_stock || 0;
        } else {
          productMap.set(product.id, {
            id: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            sale_price: product.sale_price,
            unit_type: product.unit_type,
            requires_prescription: product.requires_prescription,
            active: product.active,
            current_stock: item.current_stock || 0
          });
        }
      });

      const productsWithStock: ProductWithStock[] = Array.from(productMap.values());

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