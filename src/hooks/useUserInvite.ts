import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from './useUserRoles';

export function useUserInvite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteUser = async (email: string, fullName: string, role: AppRole = 'viewer') => {
    try {
      setLoading(true);
      setError(null);

      // Use the database function to invite user
      const { data, error } = await supabase.rpc('invite_user', {
        user_email: email,
        user_full_name: fullName,
        user_role: role
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return { success: true, message: result.message || 'Usuario invitado correctamente' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al invitar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    inviteUser,
    loading,
    error
  };
}