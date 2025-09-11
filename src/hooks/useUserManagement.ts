import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { type UserRole } from '@/lib/roles';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  roles: UserRole[];
  active_roles: UserRole[];
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name?: string;
  roles: UserRole[];
}

export interface UpdateUserData {
  full_name?: string;
  avatar_url?: string;
  roles?: UserRole[];
}

export interface UserManagementState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
}

export interface UserManagementActions {
  fetchUsers: (page?: number, pageSize?: number) => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  updateUser: (userId: string, userData: UpdateUserData) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  assignRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  removeRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (userId: string, active: boolean) => Promise<{ success: boolean; error?: string }>;
  searchUsers: (query: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export function useUserManagement(): UserManagementState & UserManagementActions {
  const { hasRole, user: currentUser } = useAuth();
  
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: false,
    error: null,
    totalUsers: 0,
    currentPage: 1,
    pageSize: 10,
  });

  const updateState = (updates: Partial<UserManagementState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setError = (error: string | null) => updateState({ error });
  const setLoading = (loading: boolean) => updateState({ loading });

  // Verificar permisos
  const canManageUsers = () => hasRole('manager') || hasRole('admin');
  const canDeleteUsers = () => hasRole('admin');
  const canAssignRole = (targetRole: UserRole) => {
    if (hasRole('admin')) return true;
    if (hasRole('manager') && ['cashier', 'viewer'].includes(targetRole)) return true;
    return false;
  };

  // Obtener usuarios con sus roles
  const fetchUsers = async (page = 1, pageSize = 10) => {
    if (!canManageUsers()) {
      setError('No tienes permisos para ver usuarios');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Calcular offset para paginación
      const offset = (page - 1) * pageSize;

      // Obtener usuarios con sus perfiles
      const { data: profiles, error: profilesError, count } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            role,
            active,
            created_at
          )
        `, { count: 'exact' })
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      // Transformar datos
      const transformedUsers: UserProfile[] = profiles?.map(profile => {
        const userRoles = Array.isArray(profile.user_roles) ? profile.user_roles : [];
        const allRoles = userRoles.map(ur => ur.role as UserRole);
        const activeRoles = userRoles.filter(ur => ur.active).map(ur => ur.role as UserRole);

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          roles: allRoles,
          active_roles: activeRoles,
        };
      }) || [];

      updateState({
        users: transformedUsers,
        totalUsers: count || 0,
        currentPage: page,
        pageSize,
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      setLoading(false);
    }
  };

  // Crear nuevo usuario
  const createUser = async (userData: CreateUserData) => {
    if (!canManageUsers()) {
      return { success: false, error: 'No tienes permisos para crear usuarios' };
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'Ya existe un usuario con este email' };
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          full_name: userData.full_name,
        },
        email_confirm: true,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Error al crear usuario');
      }

      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
        });

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Asignar roles
      if (userData.roles.length > 0) {
        const roleInserts = userData.roles.map(role => ({
          user_id: authData.user.id,
          role,
          created_by: currentUser?.id,
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleInserts);

        if (rolesError) {
          console.warn('Error assigning roles:', rolesError);
        }
      }

      // Refrescar lista de usuarios
      await fetchUsers(state.currentPage, state.pageSize);

      const newUser: UserProfile = {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at || authData.user.created_at,
        roles: userData.roles,
        active_roles: userData.roles,
      };

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuario
  const updateUser = async (userId: string, userData: UpdateUserData) => {
    if (!canManageUsers()) {
      return { success: false, error: 'No tienes permisos para actualizar usuarios' };
    }

    try {
      setLoading(true);
      setError(null);

      // Actualizar perfil
      const profileUpdates: any = {};
      if (userData.full_name !== undefined) profileUpdates.full_name = userData.full_name;
      if (userData.avatar_url !== undefined) profileUpdates.avatar_url = userData.avatar_url;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileError) {
          throw new Error(profileError.message);
        }
      }

      // Actualizar roles si se proporcionan
      if (userData.roles) {
        // Eliminar roles existentes
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Insertar nuevos roles
        if (userData.roles.length > 0) {
          const roleInserts = userData.roles
            .filter(role => canAssignRole(role))
            .map(role => ({
              user_id: userId,
              role,
              created_by: currentUser?.id,
            }));

          if (roleInserts.length > 0) {
            const { error: rolesError } = await supabase
              .from('user_roles')
              .insert(roleInserts);

            if (rolesError) {
              throw new Error(rolesError.message);
            }
          }
        }
      }

      // Refrescar lista de usuarios
      await fetchUsers(state.currentPage, state.pageSize);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    if (!canDeleteUsers()) {
      return { success: false, error: 'No tienes permisos para eliminar usuarios' };
    }

    if (userId === currentUser?.id) {
      return { success: false, error: 'No puedes eliminar tu propio usuario' };
    }

    try {
      setLoading(true);
      setError(null);

      // Eliminar usuario de auth (esto eliminará automáticamente el perfil por CASCADE)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        throw new Error(authError.message);
      }

      // Refrescar lista de usuarios
      await fetchUsers(state.currentPage, state.pageSize);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Asignar rol
  const assignRole = async (userId: string, role: UserRole) => {
    if (!canAssignRole(role)) {
      return { success: false, error: `No tienes permisos para asignar el rol ${role}` };
    }

    try {
      setError(null);

      // Verificar si el rol ya existe
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (existingRole) {
        return { success: false, error: 'El usuario ya tiene este rol asignado' };
      }

      // Insertar nuevo rol
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          created_by: currentUser?.id,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Refrescar lista de usuarios
      await fetchUsers(state.currentPage, state.pageSize);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar rol';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Remover rol
  const removeRole = async (userId: string, role: UserRole) => {
    if (!canAssignRole(role)) {
      return { success: false, error: `No tienes permisos para remover el rol ${role}` };
    }

    try {
      setError(null);

      // Verificar que no sea el último rol
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('active', true);

      if (userRoles && userRoles.length <= 1) {
        return { success: false, error: 'No se puede remover el último rol del usuario' };
      }

      // Eliminar rol
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        throw new Error(error.message);
      }

      // Refrescar lista de usuarios
      await fetchUsers(state.currentPage, state.pageSize);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al remover rol';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Alternar estado del usuario
  const toggleUserStatus = async (userId: string, active: boolean) => {
    if (!canManageUsers()) {
      return { success: false, error: 'No tienes permisos para cambiar el estado de usuarios' };
    }

    try {
      setError(null);

      // Actualizar todos los roles del usuario
      const { error } = await supabase
        .from('user_roles')
        .update({ active })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      // Refrescar lista de usuarios
      await fetchUsers(state.currentPage, state.pageSize);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar estado del usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Buscar usuarios
  const searchUsers = async (query: string) => {
    if (!canManageUsers()) {
      setError('No tienes permisos para buscar usuarios');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role,
            active,
            created_at
          )
        `)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(error.message);
      }

      // Transformar datos
      const transformedUsers: UserProfile[] = profiles?.map(profile => {
        const userRoles = Array.isArray(profile.user_roles) ? profile.user_roles : [];
        const allRoles = userRoles.map(ur => ur.role as UserRole);
        const activeRoles = userRoles.filter(ur => ur.active).map(ur => ur.role as UserRole);

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          roles: allRoles,
          active_roles: activeRoles,
        };
      }) || [];

      updateState({
        users: transformedUsers,
        totalUsers: transformedUsers.length,
        loading: false,
      });
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err.message : 'Error al buscar usuarios');
      setLoading(false);
    }
  };

  // Refrescar usuarios
  const refreshUsers = async () => {
    await fetchUsers(state.currentPage, state.pageSize);
  };

  // Cargar usuarios inicialmente
  useEffect(() => {
    if (canManageUsers()) {
      fetchUsers();
    }
  }, []);

  return {
    ...state,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    removeRole,
    toggleUserStatus,
    searchUsers,
    refreshUsers,
  };
}