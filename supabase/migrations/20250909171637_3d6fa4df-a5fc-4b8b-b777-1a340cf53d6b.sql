-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default viewer role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to invite new users (for admin use)
CREATE OR REPLACE FUNCTION public.invite_user(
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_role app_role DEFAULT 'viewer'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if current user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'No tienes permisos para invitar usuarios');
  END IF;
  
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Create profile entry
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new_user_id, user_email, COALESCE(user_full_name, user_email));
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (new_user_id, user_role, auth.uid());
  
  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'message', 'Usuario invitado correctamente'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;