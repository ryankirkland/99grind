import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Trophy, Pencil } from 'lucide-react'
import { format } from 'date-fns'

export default async function WorkoutDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch workout details
    const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()

    if (!workout) {
        return redirect('/workouts')
    }

    // Fetch workout logs with exercise details
    const { data: logs } = await supabase
        .from('workout_logs')
        .select(`
      *,
      exercises (
        name,
        target_muscle
      )
    `)
        .eq('workout_id', workout.id)
        .order('created_at', { ascending: true })

    // Fetch user profile for unit preference
    const { data: profile } = await supabase
        .from('profiles')
        .select('weight_unit')
        .eq('id', user.id)
        .single()

    const unit = profile?.weight_unit || 'kg'

    // Group logs by exercise
    const exercises: any[] = []
    logs?.forEach((log: any) => {
        const lastExercise = exercises[exercises.length - 1]
        if (lastExercise && lastExercise.exercise_id === log.exercise_id) {
            lastExercise.sets.push(log)
        } else {
            exercises.push({
                exercise_id: log.exercise_id,
                name: log.exercises?.name || 'Unknown Exercise',
                target_muscle: log.exercises?.target_muscle || 'General',
                sets: [log],
            })
        }
    })

    const toDisplay = (weight: number) => {
        if (unit === 'lbs') {
            return Math.round(weight * 2.20462)
        }
        return Math.round(weight)
    }

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/workouts" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {workout.name || 'Untitled Workout'}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(workout.started_at), 'PPP')}
                                </div>
                                <div className="flex items-center gap-1 text-emerald-500">
                                    <Trophy className="h-3 w-3" />
                                    {workout.total_xp_earned} XP
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/workouts/${id}/edit`}
                        className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <Pencil className="h-5 w-5" />
                    </Link>
                </header>

                <div className="space-y-6">
                    {exercises.map((exercise) => (
                        <div key={exercise.exercise_id + exercise.sets[0].id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-white">{exercise.name}</h3>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">{exercise.target_muscle}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-4 text-xs font-medium uppercase text-zinc-500 mb-2 px-2">
                                    <div className="text-center">Set</div>
                                    <div className="text-center">{unit.toUpperCase()}</div>
                                    <div className="text-center">Reps</div>
                                </div>

                                {exercise.sets.map((set: any, index: number) => (
                                    <div key={set.id} className="grid grid-cols-3 gap-4 items-center rounded-lg bg-black/50 p-3 text-sm">
                                        <div className="text-center text-zinc-400 font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="text-center text-white font-bold">
                                            {toDisplay(set.weight)}
                                        </div>
                                        <div className="text-center text-white font-bold">
                                            {set.reps}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
