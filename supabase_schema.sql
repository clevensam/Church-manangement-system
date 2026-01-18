-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable PGCrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. Define Roles Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'pastor', 'accountant', 'jumuiya_leader');
    END IF;
END $$;

-- 1. Create Custom Users Table (Replaces auth.users & profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'jumuiya_leader',
    must_change_password BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- 2. Data Tables
CREATE TABLE IF NOT EXISTS public.fellowships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.donors (
    envelope_number TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    donor_name TEXT NOT NULL,
    fellowship_id UUID REFERENCES public.fellowships(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.regular_offerings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.envelope_offerings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    offering_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    envelope_number TEXT NOT NULL REFERENCES public.donors(envelope_number) ON DELETE RESTRICT ON UPDATE CASCADE,
    bahasha_type TEXT NOT NULL DEFAULT 'Ahadi'
);

-- 3. Auth Functions (RPC)

-- Login Function
CREATE OR REPLACE FUNCTION public.login_user(user_email TEXT, user_password TEXT)
RETURNS json AS $$
DECLARE
  found_user public.users;
BEGIN
  SELECT * INTO found_user FROM public.users WHERE email = user_email;
  
  IF found_user.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check password using pgcrypto
  IF found_user.password_hash = crypt(user_password, found_user.password_hash) THEN
    -- Update last sign in
    UPDATE public.users SET last_sign_in_at = now() WHERE id = found_user.id;
    
    RETURN json_build_object(
      'id', found_user.id,
      'email', found_user.email,
      'full_name', found_user.full_name,
      'role', found_user.role,
      'must_change_password', found_user.must_change_password
    );
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Change Password Function
CREATE OR REPLACE FUNCTION public.change_my_password(user_id UUID, new_password TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users 
  SET password_hash = crypt(new_password, gen_salt('bf')),
      must_change_password = FALSE
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create User Function (Admin)
CREATE OR REPLACE FUNCTION public.create_new_user(
    new_email TEXT, 
    new_password TEXT, 
    new_name TEXT, 
    new_role public.user_role
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.users (email, password_hash, full_name, role, must_change_password)
  VALUES (
    new_email, 
    crypt(new_password, gen_salt('bf')), 
    new_name, 
    new_role, 
    TRUE
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Open RLS Policies (Since we manage auth manually now)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fellowships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regular_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envelope_offerings ENABLE ROW LEVEL SECURITY;

-- Drop old policies to prevent conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public access" ON public.users;
    DROP POLICY IF EXISTS "Allow public access" ON public.fellowships;
    DROP POLICY IF EXISTS "Allow public access" ON public.expenses;
    DROP POLICY IF EXISTS "Allow public access" ON public.donors;
    DROP POLICY IF EXISTS "Allow public access" ON public.regular_offerings;
    DROP POLICY IF EXISTS "Allow public access" ON public.envelope_offerings;
END $$;

-- Create Permissive Policies (Allow the app to read/write without JWT)
CREATE POLICY "Allow public access" ON public.users FOR ALL TO public USING (true);
CREATE POLICY "Allow public access" ON public.fellowships FOR ALL TO public USING (true);
CREATE POLICY "Allow public access" ON public.expenses FOR ALL TO public USING (true);
CREATE POLICY "Allow public access" ON public.donors FOR ALL TO public USING (true);
CREATE POLICY "Allow public access" ON public.regular_offerings FOR ALL TO public USING (true);
CREATE POLICY "Allow public access" ON public.envelope_offerings FOR ALL TO public USING (true);

-- Drop unused tables if they exist (Cleanup)
DROP TABLE IF EXISTS public.profiles CASCADE;