import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { WorkoutLogger, WorkoutExercise } from '@/components/workout-logger'

export default async function EditWorkoutPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch workout with logs and exercises
    const { data: workout } = await supabase
        .from('workouts')
        .select(`
            *,
            workout_logs (
                *,
                exercises (
                    name,
                    target_muscle,
                    type
                )
            )
        `)
        .eq('id', params.id)
        .single()

    if (!workout || workout.user_id !== user.id) {
        return redirect('/')
    }

    // Fetch all exercises for the picker
    const { data: allExercises } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

    // Transform data for logger
    // We need to group logs by exercise to reconstruct the "sets" structure
    const exerciseMap = new Map<string, WorkoutExercise>()

    workout.workout_logs.forEach((log: any) => {
        // We need a unique key for the exercise instance in the workout.
        // Since we flattened logs in DB, we'll group by exercise_id.
        // Note: This merges split sets of the same exercise into one block, which is usually desired.

        if (!exerciseMap.has(log.exercise_id)) {
            exerciseMap.set(log.exercise_id, {
                id: crypto.randomUUID(),
                exerciseId: log.exercise_id,
                name: log.exercises.name,
                sets: []
            })
        }

        const exercise = exerciseMap.get(log.exercise_id)!
        exercise.sets.push({
            id: crypto.randomUUID(),
            reps: log.reps,
            weight: log.weight,
            completed: true // Assume past logs are completed
        })
    })

    const initialData = {
        id: workout.id,
        name: workout.name,
        type: workout.type,
        exercises: Array.from(exerciseMap.values())
    }

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl">
                <WorkoutLogger
                    exercises={allExercises || []}
                    userId={user.id}
                    initialData={initialData}
                />
            </div>
        </div>
    )
}
