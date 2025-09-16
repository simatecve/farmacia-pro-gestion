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
  registro_sanitario: string | null;
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
      
      const mapped: ProductSimple[] = ((data as any[]) || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
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
        location_id: item.location_id ?? null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      setProducts(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Partial<ProductSimple>) => {
    try {
      const clean: any = { ...productData };
      delete clean.category;
      delete clean.location;
      const { data, error } = await supabase
        .from('products')
        .insert([clean as any])
        .select()
        .single();
      
      if (error) throw error;
      
      const mapped: ProductSimple = {
        id: (data as any).id,
        name: (data as any).name,
        description: (data as any).description,
         barcode: (data as any).barcode,
        code: (data as any).code,
        category_id: (data as any).category_id,
        unit_type: (data as any).unit_type,
        presentation: (data as any).presentation,
        concentration: (data as any).concentration,
        laboratory: (data as any).laboratory,
        image_url: (data as any).image_url,
        expiry_date: (data as any).expiry_date,
        sale_price: (data as any).sale_price,
        purchase_price: (data as any).purchase_price,
        min_stock: (data as any).min_stock,
        max_stock: (data as any).max_stock,
        requires_prescription: (data as any).requires_prescription,
        active: (data as any).active,
        location_id: (data as any).location_id ?? null,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
      };
      
      setProducts(prev => [...prev, mapped]);
      return mapped;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando producto');
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductSimple>) => {
    try {
      const clean: any = { ...productData };
      delete clean.category;
      delete clean.location;
      const { data, error } = await supabase
        .from('products')
        .update(clean as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const mapped: ProductSimple = {
        id: (data as any).id,
        name: (data as any).name,
        description: (data as any).description,

        barcode: (data as any).barcode,
        code: (data as any).code,
        category_id: (data as any).category_id,
        unit_type: (data as any).unit_type,
        presentation: (data as any).presentation,
        concentration: (data as any).concentration,
        laboratory: (data as any).laboratory,
        image_url: (data as any).image_url,
        expiry_date: (data as any).expiry_date,
        sale_price: (data as any).sale_price,
        purchase_price: (data as any).purchase_price,
        min_stock: (data as any).min_stock,
        max_stock: (data as any).max_stock,
        requires_prescription: (data as any).requires_prescription,
        active: (data as any).active,
        location_id: (data as any).location_id ?? null,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
      };
      
      setProducts(prev => prev.map(prod => prod.id === id ? mapped : prod));
      return mapped;
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