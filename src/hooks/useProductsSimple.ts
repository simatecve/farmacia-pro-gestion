import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSimple {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  code: string | null;
  category_id: string | null;
  unit_type: string;
  presentation: string | null;
  concentration: string | null;
  laboratory: string | null;
  image_url: string | null;
  expiry_date: string | null;
  sale_price: number;
  purchase_price: number;
  min_stock: number;
  max_stock: number;
  requires_prescription: boolean;
  active: boolean;
  location_id: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
}

export function useProductsSimple() {
  const [products, setProducts] = useState<ProductSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Partial<ProductSimple>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando producto');
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductSimple>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prev => prev.map(prod => prod.id === id ? data : prod));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error actualizando producto');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProducts(prev => prev.filter(prod => prod.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error eliminando producto');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  };
}