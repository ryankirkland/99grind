-- Add type column to workouts table
alter table public.workouts 
add column type text default 'Strength';

-- Update existing rows if necessary (default handles it, but good to be explicit)
update public.workouts set type = 'Strength' where type is null;
