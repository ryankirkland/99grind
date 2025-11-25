'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalendarProps = {
    workoutDates: Date[]
}

export function Calendar({ workoutDates }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    // Add padding days for the grid start
    const startDay = startOfMonth(currentMonth).getDay()
    const paddingDays = Array(startDay).fill(null)

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextMonth} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, i) => (
                    <div key={`padding-${i}`} />
                ))}
                {days.map((day) => {
                    const hasWorkout = workoutDates.some(d => isSameDay(d, day))
                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "flex aspect-square items-center justify-center rounded-full text-xs transition-all",
                                !isSameMonth(day, currentMonth) && "text-zinc-700",
                                isToday(day) && "ring-1 ring-emerald-500",
                                hasWorkout ? "bg-emerald-500 text-black font-bold" : "text-zinc-400 hover:bg-zinc-800"
                            )}
                        >
                            {format(day, 'd')}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
