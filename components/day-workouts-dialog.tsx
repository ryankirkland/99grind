'use client'

import { X, ChevronRight, Dumbbell, Heart, Activity, Brain } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Workout = {
    id: string
    name: string
    started_at: string
    total_xp_earned: number
    type?: string
}

type DayWorkoutsDialogProps = {
    date: Date
    workouts: Workout[]
    onClose: () => void
}

export function DayWorkoutsDialog({ date, workouts, onClose }: DayWorkoutsDialogProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'Cardio': return <Heart className="h-5 w-5" />
            case 'Flexibility': return <Activity className="h-5 w-5" />
            case 'Mindfulness': return <Brain className="h-5 w-5" />
            default: return <Dumbbell className="h-5 w-5" />
        }
    }

    const getColorClass = (type: string) => {
        switch (type) {
            case 'Cardio': return "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20"
            case 'Flexibility': return "bg-green-500/10 text-green-500 group-hover:bg-green-500/20"
            case 'Mindfulness': return "bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20"
            default: return "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
        }
    }

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
                    {workouts.map((workout) => {
                        const type = workout.type || 'Strength'
                        return (
                            <Link
                                key={workout.id}
                                href={`/workouts/${workout.id}`}
                                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("rounded-full p-3 transition-colors", getColorClass(type))}>
                                        {getIcon(type)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{workout.name || 'Untitled Workout'}</h4>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={cn("font-medium",
                                                type === 'Cardio' ? "text-blue-400" :
                                                    type === 'Flexibility' ? "text-green-400" :
                                                        type === 'Mindfulness' ? "text-yellow-400" :
                                                            "text-red-400"
                                            )}>{type}</span>
                                            <span className="text-zinc-600">•</span>
                                            <span className="text-emerald-400 font-bold">+{workout.total_xp_earned} XP</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
