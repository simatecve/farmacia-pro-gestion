import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { ROLES, type UserRole, RoleManager } from '@/lib/roles';

export interface AuthUser extends User {
  profile?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    roles: UserRole[];
    active_roles: UserRole[];
  };
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManagerOrAbove: () => boolean;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setError = (error: string | null) => updateState({ error });
  const setLoading = (loading: boolean) => updateState({ loading });

  // Asignar rol por defecto si no tiene ninguno
  const assignDefaultRole = async (userId: string): Promise<UserRole> => {
    try {
      const defaultRole: UserRole = ROLES.VIEWER;
      
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: defaultRole,
          active: true,
        });

      if (error) {
        console.error('Error assigning default role:', error);
        return defaultRole;
      }

      return defaultRole;
    } catch (error) {
      console.error('Error in assignDefaultRole:', error);
      return ROLES.VIEWER;
    }
  };

  // Obtener perfil completo del usuario con roles
  const getUserProfile = async (userId: string): Promise<AuthUser['profile'] | null> => {
    try {
      // Obtener perfil básico
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Obtener roles del usuario
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, active')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        // Si no hay roles, asignar rol por defecto
        const defaultRole = await assignDefaultRole(userId);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          roles: [defaultRole],
          active_roles: [defaultRole],
        };
      }

      // Si no tiene roles, asignar rol por defecto
      if (!userRoles || userRoles.length === 0) {
        const defaultRole = await assignDefaultRole(userId);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          roles: [defaultRole],
          active_roles: [defaultRole],
        };
      }

      // Procesar roles
      const allRoles = userRoles.map(ur => ur.role as UserRole);
      const activeRoles = userRoles.filter(ur => ur.active).map(ur => ur.role as UserRole);

      return {
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        roles: allRoles,
        active_roles: activeRoles,
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await getUserProfile(data.user.id);
        const authUser: AuthUser = {
          ...data.user,
          profile,
        };

        updateState({
          user: authUser,
          session: data.session,
          loading: false,
        });
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Registrarse
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }

      updateState({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      console.error('Error in signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      if (!state.user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Refrescar perfil del usuario
      await refreshUser();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos del usuario
  const refreshUser = async () => {
    try {
      if (!state.user) return;

      const profile = await getUserProfile(state.user.id);
      const authUser: AuthUser = {
        ...state.user,
        profile,
      };

      updateState({ user: authUser });
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: UserRole): boolean => {
    if (!state.user?.profile?.active_roles) return false;
    return state.user.profile.active_roles.includes(role);
  };

  // Verificar si el usuario puede acceder a una funcionalidad
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!state.user?.profile?.active_roles) return false;
    return requiredRoles.some(role => state.user.profile.active_roles.includes(role));
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: string): boolean => {
    if (!state.user?.profile?.active_roles) return false;
    return RoleManager.userHasPermission(state.user.profile.active_roles, permission);
  };

  // Verificar si el usuario es administrador
  const isAdmin = (): boolean => {
    return hasRole(ROLES.ADMIN);
  };

  // Verificar si el usuario es gerente o superior
  const isManagerOrAbove = (): boolean => {
    if (!state.user?.profile?.active_roles) return false;
    return RoleManager.isManagerOrAbove(state.user.profile.active_roles);
  };

  // Configurar listener de autenticación
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Obtener sesión actual
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setError(error.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          const profile = await getUserProfile(session.user.id);
          const authUser: AuthUser = {
            ...session.user,
            profile,
          };

          updateState({
            user: authUser,
            session,
            loading: false,
          });
        } else if (mounted) {
          updateState({
            user: null,
            session: null,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError('Error al inicializar autenticación');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Configurar listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await getUserProfile(session.user.id);
            const authUser: AuthUser = {
              ...session.user,
              profile,
            };

            updateState({
              user: authUser,
              session,
              loading: false,
            });
          } else if (event === 'SIGNED_OUT') {
            updateState({
              user: null,
              session: null,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          if (mounted) {
            setError('Error en cambio de estado de autenticación');
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshUser,
    hasRole,
    canAccess,
    hasPermission,
    isAdmin,
    isManagerOrAbove,
  };
}