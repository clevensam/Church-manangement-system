-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PGCrypto for password hashing (Required for seeding users via SQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. Define Roles Enum (Idempotent Check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'pastor', 'accountant', 'jumuiya_leader');
    END IF;
END $$;

-- 1. Table: Fellowships (Jumuiya)
CREATE TABLE IF NOT EXISTS public.fellowships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL UNIQUE
);

-- 2. Table: Expenses (Matumizi)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL
);

-- 3. Table: Donors (Wahumini)
CREATE TABLE IF NOT EXISTS public.donors (
    envelope_number TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    donor_name TEXT NOT NULL,
    fellowship_id UUID REFERENCES public.fellowships(id) ON DELETE SET NULL
);

-- 4. Table: Regular Offerings (Sadaka za Kawaida - Ibada)
CREATE TABLE IF NOT EXISTS public.regular_offerings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL
);

-- 5. Table: Envelope Offerings (Sadaka za Bahasha)
CREATE TABLE IF NOT EXISTS public.envelope_offerings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    offering_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    envelope_number TEXT NOT NULL REFERENCES public.donors(envelope_number) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Table: Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    role public.user_role DEFAULT 'jumuiya_leader',
    must_change_password BOOLEAN DEFAULT TRUE
);

-- 7. Trigger to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, must_change_password)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'jumuiya_leader'),
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists before creating to prevent errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Row Level Security
ALTER TABLE public.fellowships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regular_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envelope_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Reset policies to ensure clean state
DO $$
BEGIN
    DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.fellowships;
    DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.expenses;
    DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.donors;
    DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.regular_offerings;
    DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.envelope_offerings;
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
END $$;

-- Create Policies
CREATE POLICY "Enable access for authenticated users" ON public.fellowships FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access for authenticated users" ON public.expenses FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access for authenticated users" ON public.donors FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access for authenticated users" ON public.regular_offerings FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable access for authenticated users" ON public.envelope_offerings FOR ALL TO authenticated USING (true);

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles 
    FOR SELECT TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles 
    FOR SELECT TO authenticated 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

-- 9. Admin Functions
CREATE OR REPLACE FUNCTION public.get_users_list()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role public.user_role,
  must_change_password BOOLEAN,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admins only.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    u.email::TEXT,
    p.full_name,
    p.role,
    p.must_change_password,
    u.last_sign_in_at,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;