'use client'

import { useState } from 'react'
import { Coffee, RotateCcw } from 'lucide-react'
import { logRestDay, undoRestDay } from '@/app/workouts/actions'
import { useRouter } from 'next/navigation'

export function RestDayButton({
    workedOutToday,
    isRestDayToday
}: {
    workedOutToday: boolean
    isRestDayToday: boolean
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogRestDay = async () => {
        setIsLoading(true)
        setError(null)
        const result = await logRestDay()
        if (result?.error) {
            setError(result.error)
        } else {
            router.refresh()
        }
        setIsLoading(false)
    }

    const handleUndoRestDay = async () => {
        setIsLoading(true)
        setError(null)
        const result = await undoRestDay()
        if (result?.error) {
            setError(result.error)
        } else {
            router.refresh()
        }
        setIsLoading(false)
    }

    if (isRestDayToday) {
        return (
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleUndoRestDay}
                    disabled={isLoading}
                    className="group relative flex h-full w-32 flex-col items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:scale-[1.02] disabled:opacity-50"
                >
                    <div className="mb-2 rounded-full bg-emerald-500/20 p-2 group-hover:bg-emerald-500/30">
                        <RotateCcw className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-bold text-emerald-500 text-center leading-tight">
                        Undo<br />Rest Day
                    </span>
                </button>
                {error && <p className="text-[10px] text-red-500 text-center">{error}</p>}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleLogRestDay}
                disabled={isLoading || workedOutToday}
                className="group relative flex h-full w-32 flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02] disabled:opacity-50"
            >
                <div className="mb-2 rounded-full bg-zinc-800 p-2 group-hover:bg-zinc-700">
                    <Coffee className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white text-center leading-tight">
                    Log<br />Rest Day
                </span>
            </button>
            {error && <p className="text-[10px] text-red-500 text-center">{error}</p>}
        </div>
    )
}
