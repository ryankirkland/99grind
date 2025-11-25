'use client'

import { Flame, Zap } from 'lucide-react'

type StreakTrackerProps = {
    dayStreak: number
    weekStreak: number
}

export function StreakTracker({ dayStreak, weekStreak }: StreakTrackerProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3 border border-orange-500/30">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-500/20 p-2">
                        <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-orange-400">Day Streak</span>
                </div>
                <span className="text-xl font-bold text-white">{dayStreak}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 p-3 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-500/20 p-2">
                        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider text-yellow-400">Week Streak</span>
                </div>
                <span className="text-xl font-bold text-white">{weekStreak}</span>
            </div>
        </div>
    )
}
