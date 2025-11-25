'use client'

import { X, ChevronRight, Dumbbell } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

type Workout = {
    id: string
    name: string
    started_at: string
    total_xp_earned: number
}

type DayWorkoutsDialogProps = {
    date: Date
    workouts: Workout[]
    onClose: () => void
}

export function DayWorkoutsDialog({ date, workouts, onClose }: DayWorkoutsDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {format(date, 'MMMM do, yyyy')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {workouts.map((workout) => (
                        <Link
                            key={workout.id}
                            href={`/workouts/${workout.id}`}
                            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-zinc-800 p-3 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                                    <Dumbbell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{workout.name || 'Untitled Workout'}</h4>
                                    <p className="text-xs text-emerald-400 font-bold">
                                        +{workout.total_xp_earned} XP
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
