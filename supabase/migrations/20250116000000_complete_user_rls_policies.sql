-- Complete RLS policies for user management system
-- This migration ensures all necessary policies are in place for proper user management

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can manage profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can manage limited roles" ON public.user_roles;

-- PROFILES TABLE POLICIES

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Managers can view all profiles
CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- Admins can manage all profiles (insert, update, delete)
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Managers can update profiles but not delete them
CREATE POLICY "Managers can update profiles" ON public.profiles
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'manager')
  );

-- USER_ROLES TABLE POLICIES

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all user roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Managers can manage limited roles (viewer, cashier) but not admin/manager roles
CREATE POLICY "Managers can manage limited roles" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'manager') AND 
    role IN ('viewer', 'cashier')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'manager') AND 
    role IN ('viewer', 'cashier')
  );

-- Create a comprehensive function to get user list with roles (for admin/manager use)
CREATE OR REPLACE FUNCTION public.get_users_with_roles(
  page_size INTEGER DEFAULT 10,
  page_offset INTEGER DEFAULT 0,
  search_term TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  roles TEXT[],
  is_active BOOLEAN,
  total_count BIGINT
) AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check permissions
  SELECT public.get_current_user_role() INTO current_user_role;
  
  IF current_user_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'No tienes permisos para ver la lista de usuarios';
  END IF;

  RETURN QUERY
  WITH user_data AS (
    SELECT 
      p.id,
      p.email,
      p.full_name,
      p.created_at,
      p.updated_at,
      ARRAY_AGG(ur.role ORDER BY ur.created_at) FILTER (WHERE ur.active = true) as user_roles,
      EXISTS(SELECT 1 FROM auth.users au WHERE au.id = p.id) as is_active,
      COUNT(*) OVER() as total_count
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE 
      (search_term IS NULL OR 
       p.email ILIKE '%' || search_term || '%' OR 
       p.full_name ILIKE '%' || search_term || '%')
    GROUP BY p.id, p.email, p.full_name, p.created_at, p.updated_at
    ORDER BY p.created_at DESC
    LIMIT page_size OFFSET page_offset
  )
  SELECT 
    ud.id,
    ud.email,
    ud.full_name,
    ud.created_at,
    ud.updated_at,
    COALESCE(ud.user_roles, ARRAY['viewer']),
    ud.is_active,
    ud.total_count
  FROM user_data ud;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update user roles (for admin/manager use)
CREATE OR REPLACE FUNCTION public.update_user_roles(
  target_user_id UUID,
  new_roles TEXT[]
)
RETURNS JSON AS $$
DECLARE
  current_user_role TEXT;
  invalid_roles TEXT[];
  result JSON;
BEGIN
  -- Check permissions
  SELECT public.get_current_user_role() INTO current_user_role;
  
  IF current_user_role NOT IN ('admin', 'manager') THEN
    RETURN json_build_object('success', false, 'error', 'No tienes permisos para modificar roles');
  END IF;

  -- Validate roles based on current user permissions
  IF current_user_role = 'manager' THEN
    SELECT ARRAY_AGG(role) INTO invalid_roles
    FROM unnest(new_roles) AS role
    WHERE role NOT IN ('viewer', 'cashier');
    
    IF invalid_roles IS NOT NULL AND array_length(invalid_roles, 1) > 0 THEN
      RETURN json_build_object(
        'success', false, 
        'error', 'Los managers solo pueden asignar roles de viewer y cashier'
      );
    END IF;
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;

  -- Deactivate all current roles
  UPDATE public.user_roles 
  SET active = false, updated_at = NOW()
  WHERE user_id = target_user_id;

  -- Insert new roles
  INSERT INTO public.user_roles (user_id, role, created_by, active)
  SELECT target_user_id, unnest(new_roles), auth.uid(), true;

  RETURN json_build_object(
    'success', true,
    'message', 'Roles actualizados correctamente'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to delete user (admin only)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(
  target_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  current_user_role TEXT;
  result JSON;
BEGIN
  -- Check permissions (only admin can delete users)
  SELECT public.get_current_user_role() INTO current_user_role;
  
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Solo los administradores pueden eliminar usuarios');
  END IF;

  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;

  -- Prevent self-deletion
  IF target_user_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'No puedes eliminar tu propia cuenta');
  END IF;

  -- Delete user roles first
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Usuario eliminado correctamente'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_users_with_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile_by_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_active ON public.user_roles(user_id, active);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_active ON public.user_roles(role, active);