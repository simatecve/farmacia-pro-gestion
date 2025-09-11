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
  category?: {
    id: string;
    name: string;
  };
  locations?: Array<{
    location_name: string;
    stock: number;
  }>;
}

export function useProductsWithStock() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsWithStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all active products with category information
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('active', true)
        .order('name');

      if (productsError) throw productsError;

      // Then get inventory data with location information
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          product_id, 
          current_stock,
          locations (
            name
          )
        `);

      if (inventoryError) throw inventoryError;

      // Create maps for stock totals and locations
      const stockMap = new Map<string, number>();
      const locationsMap = new Map<string, Array<{ location_name: string; stock: number }>>();
      
      (inventoryData || []).forEach(item => {
        const currentStock = stockMap.get(item.product_id) || 0;
        stockMap.set(item.product_id, currentStock + (item.current_stock || 0));
        
        // Group locations by product
        if (item.current_stock > 0 && item.locations?.name) {
          const productLocations = locationsMap.get(item.product_id) || [];
          productLocations.push({
            location_name: item.locations.name,
            stock: item.current_stock
          });
          locationsMap.set(item.product_id, productLocations);
        }
      });

      // Combine products with their stock and location information
      const productsWithStock: ProductWithStock[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        sale_price: product.sale_price,
        unit_type: product.unit_type,
        requires_prescription: product.requires_prescription,
        active: product.active,
        current_stock: stockMap.get(product.id) || 0,
        locations: locationsMap.get(product.id) || [],
        category: product.categories ? {
          id: product.categories.id,
          name: product.categories.name
        } : undefined
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