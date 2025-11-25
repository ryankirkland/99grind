'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DayWorkoutsDialog } from '@/components/day-workouts-dialog'

type Workout = {
    id: string
    name: string
    started_at: string
    total_xp_earned: number
}

type CalendarProps = {
    workouts: Workout[]
}

export function Calendar({ workouts }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    // Add padding days for the grid start
    const startDay = startOfMonth(currentMonth).getDay()
    const paddingDays = Array(startDay).fill(null)

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const getWorkoutsForDay = (day: Date) => {
        return workouts.filter(w => isSameDay(new Date(w.started_at), day))
    }

    const handleDayClick = (day: Date, dayWorkouts: Workout[]) => {
        if (dayWorkouts.length > 0) {
            setSelectedDate(day)
        }
    }

    const selectedWorkouts = selectedDate ? getWorkoutsForDay(selectedDate) : []

    return (
        <>
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
                        const dayWorkouts = getWorkoutsForDay(day)
                        const hasWorkout = dayWorkouts.length > 0
                        const count = dayWorkouts.length

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDayClick(day, dayWorkouts)}
                                disabled={!hasWorkout}
                                className={cn(
                                    "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all",
                                    !isSameMonth(day, currentMonth) && "text-zinc-700",
                                    isToday(day) && "ring-1 ring-emerald-500",
                                    hasWorkout
                                        ? "bg-emerald-500 text-black font-bold hover:scale-110 cursor-pointer"
                                        : "text-zinc-400 cursor-default"
                                )}
                            >
                                {format(day, 'd')}
                                {count > 1 && (
                                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black ring-2 ring-black">
                                        {count > 9 ? '9+' : count}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {selectedDate && (
                <DayWorkoutsDialog
                    date={selectedDate}
                    workouts={selectedWorkouts}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </>
    )
}
