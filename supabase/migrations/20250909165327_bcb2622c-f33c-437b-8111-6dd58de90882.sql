-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'cashier', 'viewer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  active boolean NOT NULL DEFAULT true,
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND active = true
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
    AND active = true 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'cashier' THEN 3
      WHEN 'viewer' THEN 4
    END
  LIMIT 1
$$;

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create webhook_settings table
CREATE TABLE public.webhook_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  active boolean NOT NULL DEFAULT true,
  secret_key text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for webhook_settings
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;

-- Create webhook_logs table
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id uuid REFERENCES public.webhook_settings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

-- Enable RLS for webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view user roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- RLS Policies for webhook_settings
CREATE POLICY "Admins can manage webhooks" ON public.webhook_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view webhooks" ON public.webhook_settings
  FOR SELECT USING (public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for webhook_logs
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_settings_updated_at
  BEFORE UPDATE ON public.webhook_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (replace with actual user ID when available)
-- This is commented out as it needs a real user ID
-- INSERT INTO public.user_roles (user_id, role, created_by) 
-- VALUES ('your-user-id-here', 'admin', 'your-user-id-here');