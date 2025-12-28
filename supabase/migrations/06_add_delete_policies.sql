-- Add delete policy for workouts
create policy "Users can delete their own workouts" on public.workouts
  for delete using (auth.uid() = user_id);

-- Add delete policy for workout_logs
create policy "Users can delete their own workout logs" on public.workout_logs
  for delete using (
    exists ( select 1 from public.workouts where id = workout_logs.workout_id and user_id = auth.uid() )
  );
