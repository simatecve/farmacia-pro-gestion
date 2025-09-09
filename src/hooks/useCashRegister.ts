import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CashRegisterSession {
  id: string;
  user_id: string;
  register_name: string;
  opening_amount: number;
  closing_amount?: number;
  total_sales: number;
  total_cash: number;
  total_card: number;
  total_other: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  notes?: string;
}

export function useCashRegister() {
  const [sessions, setSessions] = useState<CashRegisterSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CashRegisterSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cash_register_sessions')
        .select('*')
        .order('opened_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
      
      const openSession = data?.find(session => session.status === 'open');
      setCurrentSession(openSession || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones de caja');
    } finally {
      setLoading(false);
    }
  };

  const openRegister = async (openingAmount: number, registerName: string = 'Principal') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('cash_register_sessions')
        .insert([{
          user_id: user.user.id,
          register_name: registerName,
          opening_amount: openingAmount
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchSessions();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al abrir caja';
      return { data: null, error: errorMessage };
    }
  };

  const closeRegister = async (sessionId: string, closingAmount: number, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('cash_register_sessions')
        .update({
          closing_amount: closingAmount,
          status: 'closed',
          closed_at: new Date().toISOString(),
          notes
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      await fetchSessions();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar caja';
      return { data: null, error: errorMessage };
    }
  };

  const updateSessionSales = async (sessionId: string, saleAmount: number, paymentMethod: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) throw new Error('Sesión no encontrada');

      const updates: any = {
        total_sales: session.total_sales + saleAmount
      };

      switch (paymentMethod) {
        case 'cash':
          updates.total_cash = session.total_cash + saleAmount;
          break;
        case 'card':
          updates.total_card = session.total_card + saleAmount;
          break;
        default:
          updates.total_other = session.total_other + saleAmount;
      }

      const { error } = await supabase
        .from('cash_register_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      await fetchSessions();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar ventas';
      return { error: errorMessage };
    }
  };

  const refreshSessions = () => {
    fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    currentSession,
    loading,
    error,
    openRegister,
    closeRegister,
    updateSessionSales,
    refreshSessions,
  };
}