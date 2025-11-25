-- Add DELETE policy for workout_logs
create policy "Users can delete their own workout logs" on public.workout_logs
  for delete using (
    exists ( select 1 from public.workouts where id = workout_logs.workout_id and user_id = auth.uid() )
  );
