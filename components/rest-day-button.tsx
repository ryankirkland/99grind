'use client'

import { useState } from 'react'
import { Coffee, X } from 'lucide-react'
import { logRestDay } from '@/app/workouts/actions'

export function RestDayButton({ workedOutToday }: { workedOutToday: boolean }) {
    const [showDialog, setShowDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        if (workedOutToday) {
            setShowDialog(true)
            return
        }

        setIsLoading(true)
        await logRestDay()
        setIsLoading(false)
    }

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="group relative flex h-full w-32 flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02] disabled:opacity-50"
            >
                <div className="mb-2 rounded-full bg-zinc-800 p-2 group-hover:bg-zinc-700">
                    <Coffee className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white text-center leading-tight">
                    Log<br />Rest Day
                </span>
            </button>

            {showDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-emerald-500/10 p-3">
                                <Coffee className="h-8 w-8 text-emerald-500" />
                            </div>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-white">You've already worked hard today!</h3>
                        <p className="mb-6 text-zinc-400">
                            Great job on your workout. No need to log a rest day when you've already crushed it.
                        </p>
                        <button
                            onClick={() => setShowDialog(false)}
                            className="w-full rounded-xl bg-white py-3 font-semibold text-black hover:bg-zinc-200 transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
