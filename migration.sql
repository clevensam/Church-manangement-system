-- Run this command in the Supabase SQL Editor to add the missing column to your existing table
ALTER TABLE public.envelope_offerings 
ADD COLUMN IF NOT EXISTS bahasha_type TEXT NOT NULL DEFAULT 'Ahadi';

-- Create table for tracking Building Fund Pledges (Ahadi za Jengo)
CREATE TABLE IF NOT EXISTS public.jengo_pledges (
    id UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    envelope_number TEXT PRIMARY KEY REFERENCES public.donors(envelope_number) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.jengo_pledges ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to avoid conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public access" ON public.jengo_pledges;
END $$;

-- Create Permissive Policy
CREATE POLICY "Allow public access" ON public.jengo_pledges FOR ALL TO public USING (true);
