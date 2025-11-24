-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_config jsonb default '{}'::jsonb,
  stats jsonb default '{"strength": 0, "cardio": 0, "stamina": 0, "flexibility": 0}'::jsonb,
  level int default 1,
  current_xp int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Exercises table
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  target_muscle text not null, -- e.g., 'Chest', 'Back', 'Legs'
  type text not null, -- e.g., 'Strength', 'Cardio'
  created_by uuid references public.profiles(id), -- null means system default
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.exercises enable row level security;

create policy "Exercises are viewable by everyone" on public.exercises
  for select using (true);

create policy "Users can create their own exercises" on public.exercises
  for insert with check (auth.uid() = created_by);

-- Workouts table
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text, -- Optional name for the workout
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  total_xp_earned int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workouts enable row level security;

create policy "Users can view their own workouts" on public.workouts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own workouts" on public.workouts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own workouts" on public.workouts
  for update using (auth.uid() = user_id);

-- Workout Logs table
create table public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  sets int default 0,
  reps int default 0,
  weight float default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_logs enable row level security;

create policy "Users can view their own workout logs" on public.workout_logs
  for select using (
    exists ( select 1 from public.workouts where id = workout_logs.workout_id and user_id = auth.uid() )
  );

create policy "Users can insert their own workout logs" on public.workout_logs
  for insert with check (
    exists ( select 1 from public.workouts where id = workout_logs.workout_id and user_id = auth.uid() )
  );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_config)
  values (new.id, new.raw_user_meta_data->>'username', '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
