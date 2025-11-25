import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WorkoutList } from '@/components/history/workout-list'

export default async function WorkoutsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch all workouts for history and streaks
    const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

    const workoutDates = workouts?.map(w => new Date(w.started_at)) || []

    // Calculate Streaks
    // 1. Day Streak
    let dayStreak = 0
    const today = new Date()
    let checkDate = today

    // Check if worked out today
    const workedOutToday = workoutDates.some(d => isSameDay(d, today))
    if (workedOutToday) {
        dayStreak = 1
        checkDate = subDays(today, 1)
    } else {
        // Check if worked out yesterday
        const yesterday = subDays(today, 1)
        const workedOutYesterday = workoutDates.some(d => isSameDay(d, yesterday))
        if (workedOutYesterday) {
            dayStreak = 1
            checkDate = subDays(today, 2)
        }
    }

    if (dayStreak > 0) {
        // Continue checking backwards
        while (true) {
            const hasWorkout = workoutDates.some(d => isSameDay(d, checkDate))
            if (hasWorkout) {
                dayStreak++
                checkDate = subDays(checkDate, 1)
            } else {
                break
            }
        }
    }

    // 2. Week Streak (Simplified: consecutive weeks with at least 1 workout)
    // This is a bit complex to calculate perfectly without a lot of iteration.
    // For MVP, let's just count weeks with workouts from the sorted list.
    let weekStreak = 0
    if (workoutDates.length > 0) {
        // Group workouts by week
        const currentWeek = new Date()
        let lastWeekWithWorkout = -1

        // Sort dates descending just in case
        const sortedDates = [...workoutDates].sort((a, b) => b.getTime() - a.getTime())

        // Check current week
        const diffCurrent = differenceInCalendarWeeks(currentWeek, sortedDates[0], { weekStartsOn: 1 })

        if (diffCurrent === 0) {
            weekStreak = 1
            lastWeekWithWorkout = 0
        } else if (diffCurrent === 1) {
            weekStreak = 1
            lastWeekWithWorkout = 1
        }

        if (weekStreak > 0) {
            // Check previous weeks
            // This logic is tricky. Let's iterate weeks backwards.
            let checkWeek = lastWeekWithWorkout + 1
            while (true) {
                const hasWorkoutInWeek = sortedDates.some(d => differenceInCalendarWeeks(currentWeek, d, { weekStartsOn: 1 }) === checkWeek)
                if (hasWorkoutInWeek) {
                    weekStreak++
                    checkWeek++
                } else {
                    break
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <header className="flex items-center gap-4">
                    <Link href="/" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tighter text-white">
                        History
                    </h1>
                </header>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Recent Workouts</h2>
                    <WorkoutList workouts={workouts || []} />
                </div>
            </div>
        </div>
    )
}
