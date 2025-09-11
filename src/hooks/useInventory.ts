import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;
  batch_number: string | null;
  expiry_date: string | null;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    sku: string | null;
    unit_type: string;
  };
  location?: {
    id: string;
    name: string;
  };
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  location_id: string;
  movement_type: 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'venta' | 'compra' | 'devolucion';
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  batch_number: string | null;
  expiry_date: string | null;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  user_id: string | null;
  stock_before: number;
  stock_after: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku: string | null;
  };
  location?: {
    id: string;
    name: string;
  };
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(id, name, sku, barcode, description, unit_type, sale_price, categories(id, name)),
          location:locations(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando inventario');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async (productId?: string) => {
    try {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          product:products(id, name, sku),
          location:locations(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMovements((data as InventoryMovement[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando movimientos');
    }
  };

  const createMovement = async (movementData: Omit<InventoryMovement, 'id' | 'created_at' | 'product' | 'location'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([movementData])
        .select(`
          *,
          product:products(id, name, sku),
          location:locations(id, name)
        `)
        .single();
      
      if (error) throw error;
      setMovements(prev => [data as InventoryMovement, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando movimiento');
    }
  };

  const updateInventoryStock = async (
    productId: string,
    locationId: string,
    batchNumber: string | null,
    newStock: number,
    reservedStock: number = 0
  ) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .upsert({
          product_id: productId,
          location_id: locationId,
          batch_number: batchNumber,
          current_stock: newStock,
          reserved_stock: reservedStock
        })
        .select(`
          *,
          product:products(id, name, sku, unit_type),
          location:locations(id, name)
        `)
        .single();
      
      if (error) throw error;
      
      setInventory(prev => {
        const existing = prev.find(
          item => item.product_id === productId && 
                  item.location_id === locationId && 
                  item.batch_number === batchNumber
        );
        
        if (existing) {
          return prev.map(item => 
            item.id === existing.id ? data : item
          );
        } else {
          return [...prev, data];
        }
      });
      
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error actualizando inventario');
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, []);

  return {
    inventory,
    movements,
    loading,
    error,
    createMovement,
    updateInventoryStock,
    refreshInventory: fetchInventory,
    refreshMovements: fetchMovements
  };
}