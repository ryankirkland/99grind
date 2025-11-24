'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight, Dumbbell } from 'lucide-react'

type Workout = {
    id: string
    name: string
    started_at: string
    total_xp_earned: number
}

type WorkoutListProps = {
    workouts: Workout[]
}

export function WorkoutList({ workouts }: WorkoutListProps) {
    if (workouts.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                No workouts logged yet. Time to grind!
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {workouts.map((workout) => (
                <Link
                    key={workout.id}
                    href={`/workouts/${workout.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-zinc-800 p-3 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                            <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">{workout.name || 'Untitled Workout'}</h4>
                            <p className="text-xs text-zinc-500">
                                {format(new Date(workout.started_at), 'PPP')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">+{workout.total_xp_earned} XP</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
