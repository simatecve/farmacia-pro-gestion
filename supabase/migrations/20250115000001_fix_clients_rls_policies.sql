-- Fix RLS policies for clients table
-- Drop existing policies
DROP POLICY IF EXISTS "Clients are viewable by authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Clients are insertable by authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Clients are updatable by authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Clients are deletable by authenticated users" ON public.clients;

-- Create new RLS policies with correct authentication check
CREATE POLICY "Clients are viewable by authenticated users" ON public.clients 
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Clients are insertable by authenticated users" ON public.clients 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Clients are updatable by authenticated users" ON public.clients 
  FOR UPDATE TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Clients are deletable by authenticated users" ON public.clients 
  FOR DELETE TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Insert default client if not exists
INSERT INTO public.clients (name, identification_number, phone, email, address)
SELECT 'CONSUMIDOR FINAL', '0000000', '0000000', '', 'N/A'
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients WHERE name = 'CONSUMIDOR FINAL'
);