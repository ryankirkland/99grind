'use client'

import { Flame, Zap } from 'lucide-react'

type StreakTrackerProps = {
    dayStreak: number
    weekStreak: number
}

export function StreakTracker({ dayStreak, weekStreak }: StreakTrackerProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 border border-orange-500/30">
                <div className="mb-2 rounded-full bg-orange-500/20 p-3">
                    <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                </div>
                <div className="text-2xl font-bold text-white">{dayStreak}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-orange-400">Day Streak</div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 p-4 border border-yellow-500/30">
                <div className="mb-2 rounded-full bg-yellow-500/20 p-3">
                    <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white">{weekStreak}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-yellow-400">Week Streak</div>
            </div>
        </div>
    )
}
