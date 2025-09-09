import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (filters?: { table_name?: string; action?: string; limit?: number }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const refreshLogs = () => {
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs({ limit: 100 });
  }, []);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    refreshLogs,
  };
}