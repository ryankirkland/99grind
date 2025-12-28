-- Add new columns to workout_logs for different workout types
alter table public.workout_logs
add column time text,
add column distance float,
add column speed float,
add column resistance float;
