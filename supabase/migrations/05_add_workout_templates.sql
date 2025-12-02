-- Create Workout Templates table
create table public.workout_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  type text not null, -- e.g., 'Strength', 'Cardio'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_templates enable row level security;

create policy "Users can view their own workout templates" on public.workout_templates
  for select using (auth.uid() = user_id);

create policy "Users can insert their own workout templates" on public.workout_templates
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own workout templates" on public.workout_templates
  for delete using (auth.uid() = user_id);

-- Create Workout Template Exercises table
create table public.workout_template_exercises (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.workout_templates(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  order_index int default 0,
  sets int default 3,
  reps int default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workout_template_exercises enable row level security;

create policy "Users can view their own workout template exercises" on public.workout_template_exercises
  for select using (
    exists ( select 1 from public.workout_templates where id = workout_template_exercises.template_id and user_id = auth.uid() )
  );

create policy "Users can insert their own workout template exercises" on public.workout_template_exercises
  for insert with check (
    exists ( select 1 from public.workout_templates where id = workout_template_exercises.template_id and user_id = auth.uid() )
  );

create policy "Users can delete their own workout template exercises" on public.workout_template_exercises
  for delete using (
    exists ( select 1 from public.workout_templates where id = workout_template_exercises.template_id and user_id = auth.uid() )
  );
