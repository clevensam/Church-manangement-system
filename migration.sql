-- Run this command in the Supabase SQL Editor to add the missing column to your existing table
ALTER TABLE public.envelope_offerings 
ADD COLUMN IF NOT EXISTS bahasha_type TEXT NOT NULL DEFAULT 'Ahadi';