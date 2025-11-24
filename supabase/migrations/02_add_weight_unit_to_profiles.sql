-- Add weight_unit column to profiles
alter table public.profiles add column if not exists weight_unit text default 'kg';
