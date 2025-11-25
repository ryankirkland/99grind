import { createClient } from '@/utils/supabase/server'
import { ExerciseList } from '@/components/exercise-list'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ExercisesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

    // Fetch all workout logs for the user to calculate stats
    const { data: logs } = await supabase
        .from('workout_logs')
        .select('exercise_id, weight, sets')
    // We need to filter by user's workouts, but RLS handles this if we join or if RLS is set up correctly.
    // The RLS policy for workout_logs checks "exists (select 1 from workouts where id = workout_logs.workout_id and user_id = auth.uid())"
    // So a simple select on workout_logs will return only the user's logs.

    const statsMap: Record<string, { totalSets: number; maxWeight: number }> = {}

    if (logs) {
        logs.forEach((log) => {
            if (!statsMap[log.exercise_id]) {
                statsMap[log.exercise_id] = { totalSets: 0, maxWeight: 0 }
            }
            const stats = statsMap[log.exercise_id]
            stats.totalSets += log.sets // Assuming log.sets is 1 per row as per previous decision, or actual sets count
            if (log.weight > stats.maxWeight) {
                stats.maxWeight = log.weight
            }
        })
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('weight_unit')
        .eq('id', user.id)
        .single()

    const unit = profile?.weight_unit || 'kg'

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white">
                            Exercises
                        </h1>
                        <p className="text-zinc-400">Manage your exercise database.</p>
                    </div>
                </div>

                <ExerciseList
                    initialExercises={exercises || []}
                    userId={user.id}
                    statsMap={statsMap}
                    unit={unit}
                />
            </div>
        </div>
    )
}
