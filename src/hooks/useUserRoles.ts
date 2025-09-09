import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'manager' | 'cashier' | 'viewer';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  created_by?: string;
  active: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  roles?: UserRole[];
}

export function useUserRoles() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            id,
            role,
            created_at,
            created_by,
            active
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      // Transform the data to match our interface
      const transformedUsers: UserProfile[] = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        roles: Array.isArray(profile.user_roles) ? profile.user_roles : []
      })) || [];
      
      setUsers(transformedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserRole = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_user_role');
      if (error) throw error;
      setCurrentUserRole(data);
    } catch (err) {
      console.error('Error getting current user role:', err);
      setCurrentUserRole(null);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      // First check if the role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (existingRole) {
        return { 
          success: false, 
          error: 'El usuario ya tiene este rol asignado' 
        };
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: userId,
            role,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al asignar rol' 
      };
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      // Don't allow removing the last role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId);

      if (userRoles && userRoles.length <= 1) {
        return { 
          success: false, 
          error: 'No se puede remover el último rol del usuario' 
        };
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al remover rol' 
      };
    }
  };

  const updateProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Error al actualizar perfil' 
      };
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return currentUserRole === role || currentUserRole === 'admin';
  };

  const canManageUsers = (): boolean => {
    return hasRole('admin');
  };

  useEffect(() => {
    fetchUsers();
    getCurrentUserRole();
  }, []);

  return {
    users,
    currentUserRole,
    loading,
    error,
    fetchUsers,
    assignRole,
    removeRole,
    updateProfile,
    hasRole,
    canManageUsers,
  };
}