-- Add CPF, RG and address columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS rg text,
ADD COLUMN IF NOT EXISTS address text;

-- Add city column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city text;