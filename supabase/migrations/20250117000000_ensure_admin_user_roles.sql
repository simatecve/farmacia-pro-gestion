-- Ensure admin user has proper roles assigned
-- This migration fixes the issue where admin users might not have proper role assignments

-- Function to ensure admin user has admin role
CREATE OR REPLACE FUNCTION public.ensure_admin_user_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin@daalef.com'; -- Change this to your admin email
BEGIN
  -- Find admin user by email in profiles table
  SELECT id INTO admin_user_id 
  FROM public.profiles 
  WHERE email = admin_email
  LIMIT 1;
  
  -- If admin user exists, ensure they have admin role
  IF admin_user_id IS NOT NULL THEN
    -- Check if admin role already exists for this user
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = admin_user_id 
        AND role = 'admin' 
        AND active = true
    ) THEN
      -- Deactivate any existing roles
      UPDATE public.user_roles 
      SET active = false, updated_at = NOW()
      WHERE user_id = admin_user_id;
      
      -- Insert admin role
      INSERT INTO public.user_roles (user_id, role, active, created_by)
      VALUES (admin_user_id, 'admin', true, admin_user_id)
      ON CONFLICT (user_id, role) DO UPDATE SET
        active = true,
        updated_at = NOW();
        
      RAISE NOTICE 'Admin role assigned to user: %', admin_email;
    ELSE
      RAISE NOTICE 'Admin user already has admin role: %', admin_email;
    END IF;
  ELSE
    RAISE NOTICE 'Admin user not found with email: %', admin_email;
  END IF;
END;
$$;

-- Function to create admin user profile if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_admin_profile_if_not_exists(
  admin_user_id UUID,
  admin_email TEXT DEFAULT 'admin@daalef.com',
  admin_name TEXT DEFAULT 'Administrador'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile if it doesn't exist
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (admin_user_id, admin_email, admin_name, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
    
  -- Ensure admin role
  INSERT INTO public.user_roles (user_id, role, active, created_by)
  VALUES (admin_user_id, 'admin', true, admin_user_id)
  ON CONFLICT (user_id, role) DO UPDATE SET
    active = true,
    updated_at = NOW();
    
  RAISE NOTICE 'Admin profile and role ensured for: %', admin_email;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  
  -- Assign default role (viewer) unless it's the admin email
  IF NEW.email = 'admin@daalef.com' THEN
    INSERT INTO public.user_roles (user_id, role, active, created_by)
    VALUES (NEW.id, 'admin', true, NEW.id);
  ELSE
    INSERT INTO public.user_roles (user_id, role, active, created_by)
    VALUES (NEW.id, 'viewer', true, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Run the function to ensure existing admin user has proper role
SELECT public.ensure_admin_user_role();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.ensure_admin_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_profile_if_not_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;

-- Create index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_active 
ON public.user_roles(user_id, role, active);

-- Refresh the RLS policies to ensure they work correctly
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

COMMIT;