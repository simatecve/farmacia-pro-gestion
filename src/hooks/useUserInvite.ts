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
      const primaryRole = (roles?.[0] as 'admin' | 'manager' | 'cashier' | 'viewer' | undefined) ?? 'viewer';
      const { error } = await supabase.rpc('invite_user', {
        user_email: email,
        user_full_name: fullName,
        user_role: primaryRole,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Invitación enviada al usuario'
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
      const primaryRole = (roles?.[0] as 'admin' | 'manager' | 'cashier' | 'viewer' | undefined) ?? 'viewer';
      const { error } = await supabase.rpc('invite_user', {
        user_email: email,
        user_role: primaryRole,
      });

      if (error) {
        // Si hay error, proporcionar instrucciones manuales
        return {
          success: false,
          error: error.message,
          instructions: `Para invitar a ${email}:\n\n1. Ve al panel de administración de Supabase\n2. Navega a Authentication > Users\n3. Haz clic en "Invite a user"\n4. Ingresa el email: ${email}\n5. Después de que se registre, asigna el rol: ${primaryRole}`
        };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      return {
        success: false,
        error: errorMessage,
        instructions: `Para invitar a ${email} manualmente:\n\n1. Ve al panel de administración de Supabase\n2. Navega a Authentication > Users\n3. Haz clic en "Invite a user"\n4. Ingresa el email: ${email}`
      };
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (_email: string, _roles: string[]) => {
    // La función RPC para asignar roles directamente no está disponible.
    // Devolvemos una respuesta informativa para el administrador.
    return {
      success: false,
      error: 'Asignación directa de roles no disponible. Use la tabla user_roles o panel de administración.'
    };
  };

  return {
    createUser,
    inviteUser,
    assignRole,
    loading,
    error
  };
}