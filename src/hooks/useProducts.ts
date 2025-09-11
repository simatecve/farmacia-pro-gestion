import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
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
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
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
      
      // Map the data to ensure location_id exists (even if null)
      const mappedData: Product[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        sku: item.sku,
        barcode: item.barcode,
        code: item.code,
        category_id: item.category_id,
        unit_type: item.unit_type,
        presentation: item.presentation,
        concentration: item.concentration,
        laboratory: item.laboratory,
        image_url: item.image_url,
        expiry_date: item.expiry_date,
        sale_price: item.sale_price,
        purchase_price: item.purchase_price,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        requires_prescription: item.requires_prescription,
        active: item.active,
        location_id: (item as any).location_id ?? null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setProducts(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating product with data:', productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      console.log('Supabase response:', { data, error });
      
      if (error) throw error;
      
      const mappedData: Product = {
        id: data.id,
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        code: data.code,
        category_id: data.category_id,
        unit_type: data.unit_type,
        presentation: data.presentation,
        concentration: data.concentration,
        laboratory: data.laboratory,
        image_url: data.image_url,
        expiry_date: data.expiry_date,
        sale_price: data.sale_price,
        purchase_price: data.purchase_price,
        min_stock: data.min_stock,
        max_stock: data.max_stock,
        requires_prescription: data.requires_prescription,
        active: data.active,
        location_id: (data as any).location_id ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setProducts(prev => [...prev, mappedData]);
      return mappedData;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando producto');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      console.log('Updating product with id:', id, 'data:', productData);
      
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      
      console.log('Supabase update response:', { data, error });
      
      if (error) throw error;
      
      const mappedData: Product = {
        id: data.id,
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        code: data.code,
        category_id: data.category_id,
        unit_type: data.unit_type,
        presentation: data.presentation,
        concentration: data.concentration,
        laboratory: data.laboratory,
        image_url: data.image_url,
        expiry_date: data.expiry_date,
        sale_price: data.sale_price,
        purchase_price: data.purchase_price,
        min_stock: data.min_stock,
        max_stock: data.max_stock,
        requires_prescription: data.requires_prescription,
        active: data.active,
        location_id: (data as any).location_id ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setProducts(prev => prev.map(prod => prod.id === id ? mappedData : prod));
      return mappedData;
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