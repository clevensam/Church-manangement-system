-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: Fellowships (Jumuiya)
CREATE TABLE public.fellowships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL UNIQUE
);

-- 2. Table: Expenses (Matumizi)
CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL
);

-- 3. Table: Donors (Wahumini)
CREATE TABLE public.donors (
    envelope_number TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    donor_name TEXT NOT NULL,
    fellowship_id UUID REFERENCES public.fellowships(id) ON DELETE SET NULL
);

-- 4. Table: Regular Offerings (Sadaka za Kawaida - Ibada)
CREATE TABLE public.regular_offerings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    service_date DATE NOT NULL,
    service_type TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL
);

-- 5. Table: Envelope Offerings (Sadaka za Bahasha)
CREATE TABLE public.envelope_offerings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    offering_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    envelope_number TEXT NOT NULL REFERENCES public.donors(envelope_number) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Row Level Security
ALTER TABLE public.fellowships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regular_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envelope_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON public.fellowships FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.donors FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.regular_offerings FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.envelope_offerings FOR ALL USING (true);