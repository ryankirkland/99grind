import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ExerciseCharts } from '@/components/exercise-charts'
export default async function ExerciseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
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
        .eq('id', id)
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
        .eq('exercise_id', id)
        .order('created_at', { ascending: false })

    const history = logs?.map(log => {
        return {
            ...log,
            date: new Date(log.workouts?.started_at || log.created_at)
        }
    }) || []

    const { data: profile } = await supabase
        .from('profiles')
        .select('weight_unit')
        .eq('id', user.id)
        .single()

    const unit = profile?.weight_unit || 'kg'

    const toDisplay = (weight: number) => {
        if (unit === 'lbs') {
            return Math.round(weight * 2.20462)
        }
        return Math.round(weight)
    }

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

                <ExerciseCharts logs={history} unit={unit} />

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
                                    <p className="text-lg font-bold text-emerald-400">{toDisplay(log.weight)}{unit}</p>
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
