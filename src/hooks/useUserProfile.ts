import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { type AppRole } from './useUserRoles';

export interface UserProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  roles: AppRole[];
  currentRole: AppRole | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user profile with roles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          updated_at,
          user_roles(
            role,
            active
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Get current user role using RPC function
      const { data: currentRole, error: roleError } = await supabase
        .rpc('get_current_user_role');

      if (roleError) {
        console.warn('Error getting current role:', roleError);
      }

      // Extract active roles
      const activeRoles = profileData.user_roles
        ?.filter((ur: any) => ur.active)
        ?.map((ur: any) => ur.role) || [];

      const userProfile: UserProfileData = {
        id: profileData.id,
        email: profileData.email || user.email || '',
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        roles: activeRoles,
        currentRole: currentRole || (activeRoles.length > 0 ? activeRoles[0] : null)
      };

      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfileData, 'full_name' | 'avatar_url'>>) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchUserProfile();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al actualizar perfil'
      };
    }
  };

  const getDisplayName = () => {
    if (!profile) return 'Usuario';
    return profile.full_name || profile.email.split('@')[0] || 'Usuario';
  };

  const getInitials = () => {
    if (!profile) return 'U';
    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return profile.email.charAt(0).toUpperCase();
  };

  const getRoleDisplayName = (role: AppRole) => {
    const roleNames = {
      admin: 'Administrador',
      manager: 'Gerente',
      cashier: 'Cajero',
      viewer: 'Visualizador'
    };
    return roleNames[role] || role;
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchUserProfile,
    getDisplayName,
    getInitials,
    getRoleDisplayName
  };
}