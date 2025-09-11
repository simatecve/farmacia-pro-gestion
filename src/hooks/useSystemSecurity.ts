import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemSecuritySettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useSystemSecurity() {
  const [settings, setSettings] = useState<SystemSecuritySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_security_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching security settings:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string): string | null => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : null;
  };

  const updateSetting = async (key: string, value: string, description?: string) => {
    try {
      const existingSetting = settings.find(s => s.setting_key === key);
      
      if (existingSetting) {
        const { error } = await supabase
          .from('system_security_settings')
          .update({ 
            setting_value: value, 
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSetting.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_security_settings')
          .insert({
            setting_key: key,
            setting_value: value,
            description
          });

        if (error) throw error;
      }

      await fetchSettings();
    } catch (err) {
      console.error('Error updating security setting:', err);
      throw err;
    }
  };

  const validateCashDrawerPin = (inputPin: string): boolean => {
    const storedPin = getSetting('cash_drawer_pin');
    return storedPin ? inputPin === storedPin : inputPin === '1234'; // Default PIN
  };

  const setCashDrawerPin = async (newPin: string) => {
    await updateSetting('cash_drawer_pin', newPin, 'PIN para apertura de gaveta de dinero');
  };

  const getCashDrawerPin = (): string => {
    return getSetting('cash_drawer_pin') || '1234';
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    validateCashDrawerPin,
    setCashDrawerPin,
    getCashDrawerPin,
    refetch: fetchSettings
  };
}