import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySettings {
  id: string;
  name: string;
  company_name?: string;
  legal_name?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  currency: string;
  currency_symbol: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TaxSettings {
  id: string;
  name: string;
  rate: number;
  is_default: boolean;
  active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceSettings {
  id: string;
  device_type: string;
  device_name: string;
  connection_type: string;
  connection_config?: any;
  is_default: boolean;
  active: boolean;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface PrintSettings {
  id: string;
  paper_width: number;
  paper_type: string;
  print_logo: boolean;
  print_barcode: boolean;
  footer_text?: string;
  copies: number;
  auto_print: boolean;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings[]>([]);
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings[]>([]);
  const [printSettings, setPrintSettings] = useState<PrintSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setCompanySettings(data);
    } catch (err) {
      console.error('Error fetching company settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchTaxSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_settings')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      
      setTaxSettings(data || []);
    } catch (err) {
      console.error('Error fetching tax settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchDeviceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('device_settings')
        .select('*')
        .eq('active', true)
        .order('device_type');

      if (error) throw error;
      
      setDeviceSettings(data || []);
    } catch (err) {
      console.error('Error fetching device settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchPrintSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('print_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setPrintSettings(data);
    } catch (err) {
      console.error('Error fetching print settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const updateCompanySettings = async (data: Partial<CompanySettings>) => {
    try {
      if (!companySettings) {
        const { data: newData, error } = await supabase
          .from('company_settings')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        setCompanySettings(newData);
      } else {
        const { data: updatedData, error } = await supabase
          .from('company_settings')
          .update(data)
          .eq('id', companySettings.id)
          .select()
          .single();

        if (error) throw error;
        setCompanySettings(updatedData);
      }
    } catch (err) {
      console.error('Error updating company settings:', err);
      throw err;
    }
  };

  const createTaxSetting = async (data: Omit<TaxSettings, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('tax_settings')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTaxSettings();
      return newData;
    } catch (err) {
      console.error('Error creating tax setting:', err);
      throw err;
    }
  };

  const updateTaxSetting = async (id: string, data: Partial<TaxSettings>) => {
    try {
      const { error } = await supabase
        .from('tax_settings')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      await fetchTaxSettings();
    } catch (err) {
      console.error('Error updating tax setting:', err);
      throw err;
    }
  };

  const deleteTaxSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTaxSettings();
    } catch (err) {
      console.error('Error deleting tax setting:', err);
      throw err;
    }
  };

  const createDeviceSetting = async (data: Omit<DeviceSettings, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newData, error } = await supabase
        .from('device_settings')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      await fetchDeviceSettings();
      return newData;
    } catch (err) {
      console.error('Error creating device setting:', err);
      throw err;
    }
  };

  const updateDeviceSetting = async (id: string, data: Partial<DeviceSettings>) => {
    try {
      const { error } = await supabase
        .from('device_settings')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      await fetchDeviceSettings();
    } catch (err) {
      console.error('Error updating device setting:', err);
      throw err;
    }
  };

  const deleteDeviceSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('device_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDeviceSettings();
    } catch (err) {
      console.error('Error deleting device setting:', err);
      throw err;
    }
  };

  const updatePrintSettings = async (data: Partial<PrintSettings>) => {
    try {
      if (!printSettings) {
        const { data: newData, error } = await supabase
          .from('print_settings')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        setPrintSettings(newData);
      } else {
        const { data: updatedData, error } = await supabase
          .from('print_settings')
          .update(data)
          .eq('id', printSettings.id)
          .select()
          .single();

        if (error) throw error;
        setPrintSettings(updatedData);
      }
    } catch (err) {
      console.error('Error updating print settings:', err);
      throw err;
    }
  };

  const fetchAllSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchCompanySettings(),
        fetchTaxSettings(),
        fetchDeviceSettings(),
        fetchPrintSettings()
      ]);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  return {
    companySettings,
    taxSettings,
    deviceSettings,
    printSettings,
    loading,
    error,
    updateCompanySettings,
    createTaxSetting,
    updateTaxSetting,
    deleteTaxSetting,
    createDeviceSetting,
    updateDeviceSetting,
    deleteDeviceSetting,
    updatePrintSettings,
    refetch: fetchAllSettings,
  };
}