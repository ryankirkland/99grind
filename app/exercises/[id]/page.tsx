import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Trophy, Activity, Scale, Repeat } from 'lucide-react'
import { format } from 'date-fns'

export default async function ExerciseDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: exercise } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!exercise) {
        return <div>Exercise not found</div>
    }

    // Fetch logs with workout date
    const { data: logs } = await supabase
        .from('workout_logs')
        .select(`
            *,
            workouts (
                started_at
            )
        `)
        .eq('exercise_id', params.id)
        .order('created_at', { ascending: false })

    // Calculate Stats
    let totalSets = 0
    let totalReps = 0
    let maxWeight = 0
    let totalWeight = 0
    let weightCount = 0

    const history = logs?.map(log => {
        totalSets += log.sets
        totalReps += log.reps
        if (log.weight > maxWeight) maxWeight = log.weight
        if (log.weight > 0) {
            totalWeight += log.weight
            weightCount++
        }

        return {
            ...log,
            date: new Date(log.workouts?.started_at || log.created_at)
        }
    }) || []

    const avgWeight = weightCount > 0 ? Math.round(totalWeight / weightCount) : 0

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <header className="space-y-4">
                    <Link href="/exercises" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Exercises
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white">
                            {exercise.name}
                        </h1>
                        <p className="text-zinc-400">{exercise.target_muscle} • {exercise.type}</p>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl bg-zinc-900/50 p-4 border border-zinc-800">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Activity className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-zinc-500 uppercase font-medium">Total Sets</p>
                        <p className="text-2xl font-bold text-white">{totalSets}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/50 p-4 border border-zinc-800">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <Repeat className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-zinc-500 uppercase font-medium">Total Reps</p>
                        <p className="text-2xl font-bold text-white">{totalReps}</p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/50 p-4 border border-zinc-800">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                            <Trophy className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-zinc-500 uppercase font-medium">Max Weight</p>
                        <p className="text-2xl font-bold text-white">{maxWeight}kg</p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/50 p-4 border border-zinc-800">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                            <Scale className="h-4 w-4" />
                        </div>
                        <p className="text-xs text-zinc-500 uppercase font-medium">Avg Weight</p>
                        <p className="text-2xl font-bold text-white">{avgWeight}kg</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">History</h2>
                    <div className="space-y-2">
                        {history.map((log) => (
                            <div key={log.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                                <div>
                                    <p className="font-medium text-white">{format(log.date, 'PPP')}</p>
                                    <p className="text-xs text-zinc-500">{log.sets} sets • {log.reps} reps</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-emerald-400">{log.weight}kg</p>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-center py-8 text-zinc-500">
                                No history yet. Go lift something!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
