-- Fix user management issues

-- Drop the problematic invite_user function
DROP FUNCTION IF EXISTS public.invite_user(TEXT, TEXT, app_role);

-- Create a proper invite_user function that works with Supabase Auth
CREATE OR REPLACE FUNCTION public.invite_user(
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_role app_role DEFAULT 'viewer'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if current user is admin or manager
  IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')) THEN
    RETURN json_build_object('success', false, 'error', 'No tienes permisos para invitar usuarios');
  END IF;
  
  -- Check if user already exists in profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = user_email) THEN
    RETURN json_build_object('success', false, 'error', 'El usuario ya existe en el sistema');
  END IF;
  
  -- Note: In a real implementation, you would use Supabase Admin API to create the user
  -- For now, we'll return instructions for manual user creation
  RETURN json_build_object(
    'success', false, 
    'error', 'La invitación de usuarios debe realizarse a través del panel de administración de Supabase Auth. Por favor, invita al usuario manualmente y luego asigna roles.',
    'instructions', 'Usa el panel de Supabase Auth para invitar a: ' || user_email
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a function to assign role to existing user
CREATE OR REPLACE FUNCTION public.assign_user_role(
  user_email TEXT,
  user_role app_role DEFAULT 'viewer'
)
RETURNS JSON AS $$
DECLARE
  target_user_id UUID;
  result JSON;
BEGIN
  -- Check if current user is admin or manager
  IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager')) THEN
    RETURN json_build_object('success', false, 'error', 'No tienes permisos para asignar roles');
  END IF;
  
  -- Find user by email
  SELECT id INTO target_user_id FROM public.profiles WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuario no encontrado');
  END IF;
  
  -- Check if role already exists
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = user_role AND active = true) THEN
    RETURN json_build_object('success', false, 'error', 'El usuario ya tiene este rol asignado');
  END IF;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (target_user_id, user_role, auth.uid());
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Rol asignado correctamente al usuario: ' || user_email
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a function to ensure profile exists for authenticated users
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile if it doesn't exist
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  -- Assign default viewer role if no roles exist
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_profile();

-- Add policy for managers to view all profiles (needed for user management)
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- Add policy for managers to manage user roles
DROP POLICY IF EXISTS "Managers can manage user roles" ON public.user_roles;
CREATE POLICY "Managers can manage user roles" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    (public.has_role(auth.uid(), 'manager') AND role IN ('cashier', 'viewer'))
  );