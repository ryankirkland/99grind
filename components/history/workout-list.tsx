'use client'

import { cn } from '@/lib/utils'
import { Activity, Dumbbell, Heart, Brain, ChevronRight, Coffee } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

type Workout = {
    id: string
    name: string
    started_at: string
    total_xp_earned: number
    type?: string
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'Cardio': return <Heart className="h-5 w-5" />
            case 'Flexibility': return <Activity className="h-5 w-5" />
            case 'Mindfulness': return <Brain className="h-5 w-5" />
            case 'Rest': return <Coffee className="h-5 w-5" />
            default: return <Dumbbell className="h-5 w-5" />
        }
    }

    const getColorClass = (type: string) => {
        switch (type) {
            case 'Cardio': return "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20"
            case 'Flexibility': return "bg-green-500/10 text-green-500 group-hover:bg-green-500/20"
            case 'Mindfulness': return "bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20"
            case 'Rest': return "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300"
            default: return "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
        }
    }

    return (
        <div className="space-y-3">
            {workouts.map((workout) => {
                const type = workout.type || 'Strength'
                return (
                    <Link
                        key={workout.id}
                        href={`/workouts/${workout.id}`}
                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all group"
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
                                                    type === 'Rest' ? "text-zinc-400" :
                                                        "text-red-400"
                                    )}>{type}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-zinc-500">{format(new Date(workout.started_at), 'PPP')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-emerald-400">+{workout.total_xp_earned} XP</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
