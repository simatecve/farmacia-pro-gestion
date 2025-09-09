import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async (locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();
      
      if (error) throw error;
      setLocations(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error creando ubicación');
    }
  };

  const updateLocation = async (id: string, locationData: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setLocations(prev => prev.map(loc => loc.id === id ? data : loc));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error actualizando ubicación');
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setLocations(prev => prev.filter(loc => loc.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Error eliminando ubicación');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    refreshLocations: fetchLocations
  };
}