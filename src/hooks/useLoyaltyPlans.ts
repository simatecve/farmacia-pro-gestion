import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LoyaltyPlan {
  id: string;
  name: string;
  description?: string;
  points_per_currency: number;
  currency_per_point: number;
  min_purchase_for_points: number;
  points_expiry_days?: number;
  welcome_points: number;
  birthday_points: number;
  referral_points: number;
  tier_requirements?: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLoyaltyPlans() {
  const [plans, setPlans] = useState<LoyaltyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<LoyaltyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loyalty_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
      
      const active = data?.find(plan => plan.active);
      setActivePlan(active || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes de fidelización');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<LoyaltyPlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('loyalty_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      await fetchPlans();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear plan';
      return { data: null, error: errorMessage };
    }
  };

  const updatePlan = async (id: string, planData: Partial<Omit<LoyaltyPlan, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('loyalty_plans')
        .update(planData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchPlans();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar plan';
      return { data: null, error: errorMessage };
    }
  };

  const activatePlan = async (id: string) => {
    try {
      // Desactivar todos los planes primero
      await supabase
        .from('loyalty_plans')
        .update({ active: false })
        .neq('id', 'never-matches');

      // Activar el plan seleccionado
      const { data, error } = await supabase
        .from('loyalty_plans')
        .update({ active: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchPlans();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al activar plan';
      return { data: null, error: errorMessage };
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loyalty_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPlans();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar plan';
      return { error: errorMessage };
    }
  };

  const calculatePointsForPurchase = (amount: number, plan?: LoyaltyPlan) => {
    const currentPlan = plan || activePlan;
    if (!currentPlan || amount < currentPlan.min_purchase_for_points) {
      return 0;
    }
    return Math.floor(amount * currentPlan.points_per_currency);
  };

  const calculateAmountForPoints = (points: number, plan?: LoyaltyPlan) => {
    const currentPlan = plan || activePlan;
    if (!currentPlan) return 0;
    return points * currentPlan.currency_per_point;
  };

  const refreshPlans = () => {
    fetchPlans();
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    activePlan,
    loading,
    error,
    createPlan,
    updatePlan,
    activatePlan,
    deletePlan,
    calculatePointsForPurchase,
    calculateAmountForPoints,
    refreshPlans,
  };
}