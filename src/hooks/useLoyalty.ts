import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LoyaltyTransaction {
  id: string;
  client_id: string;
  transaction_type: string;
  points: number;
  reference_id?: string;
  reference_type?: string;
  description?: string;
  created_at: string;
  client?: {
    name: string;
  };
}

export function useLoyalty() {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (clientId?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('loyalty_transactions')
        .select(`
          *,
          client:clients(name)
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar transacciones de fidelización');
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (clientId: string, points: number, description?: string, referenceId?: string, referenceType?: string) => {
    try {
      // Crear transacción
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert([{
          client_id: clientId,
          transaction_type: 'earn',
          points,
          description,
          reference_id: referenceId,
          reference_type: referenceType
        }]);

      if (transactionError) throw transactionError;

      // Actualizar puntos del cliente
      const { data: currentClient } = await supabase
        .from('clients')
        .select('loyalty_points')
        .eq('id', clientId)
        .single();
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          loyalty_points: (currentClient?.loyalty_points || 0) + points
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      await fetchTransactions();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar puntos';
      return { error: errorMessage };
    }
  };

  const redeemPoints = async (clientId: string, points: number, description?: string) => {
    try {
      // Verificar que el cliente tiene suficientes puntos
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('loyalty_points')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      if (client.loyalty_points < points) {
        throw new Error('El cliente no tiene suficientes puntos');
      }

      // Crear transacción
      const { error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert([{
          client_id: clientId,
          transaction_type: 'redeem',
          points: -points,
          description
        }]);

      if (transactionError) throw transactionError;

      // Actualizar puntos del cliente
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          loyalty_points: client.loyalty_points - points
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      await fetchTransactions();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al canjear puntos';
      return { error: errorMessage };
    }
  };

  const refreshTransactions = () => {
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    addPoints,
    redeemPoints,
    refreshTransactions,
    fetchTransactions,
  };
}