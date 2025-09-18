import { useState, useEffect } from 'react';

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
      // System security settings table doesn't exist in current database
      // Using mock data for now
      const mockSettings = [
        {
          id: '1',
          setting_key: 'cash_drawer_pin',
          setting_value: '1234',
          description: 'PIN para abrir gaveta de dinero',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      setSettings(mockSettings);
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
      // Mock implementation - system_security_settings table doesn't exist
      console.log('Mock updateSetting:', { key, value, description });
      
      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.setting_key === key 
          ? { ...setting, setting_value: value, description: description || setting.description }
          : setting
      ));
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