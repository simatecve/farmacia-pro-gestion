import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InviteResult {
  success: boolean;
  error?: string;
  instructions?: string;
  requiresSignup?: boolean;
}

interface CreateUserResult {
  success: boolean;
  error?: string;
  message?: string;
}

export function useUserInvite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (email: string, fullName: string, roles: string[]): Promise<CreateUserResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('create_user_profile_by_admin', {
        user_email: email,
        full_name: fullName,
        user_roles: roles
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: data?.message || 'Usuario creado exitosamente'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (email: string, roles: string[]): Promise<InviteResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('invite_user', {
        user_email: email,
        user_roles: roles
      });

      if (error) {
        // Si hay error, proporcionar instrucciones manuales
        return {
          success: false,
          error: error.message,
          instructions: `Para invitar a ${email}:\n\n1. Ve al panel de administración de Supabase\n2. Navega a Authentication > Users\n3. Haz clic en "Invite a user"\n4. Ingresa el email: ${email}\n5. Después de que se registre, asigna los roles: ${roles.join(', ')}`
        };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      return {
        success: false,
        error: errorMessage,
        instructions: `Para invitar a ${email} manualmente:\n\n1. Ve al panel de administración de Supabase\n2. Navega a Authentication > Users\n3. Haz clic en "Invite a user"\n4. Ingresa el email: ${email}\n5. Después de que se registre, asigna los roles: ${roles.join(', ')}`
      };
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (email: string, roles: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('assign_user_role', {
        user_email: email,
        user_roles: roles
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return { success: true, message: result.message || 'Roles asignados correctamente' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar roles';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    inviteUser,
    assignRole,
    loading,
    error
  };
}