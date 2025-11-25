import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Plus, History, Trophy, Coffee } from 'lucide-react'
import { StreakTracker } from '@/components/history/streak-tracker'
import { Calendar } from '@/components/history/calendar'
import { isSameDay, subDays, differenceInCalendarWeeks } from 'date-fns'
import { logRestDay } from '@/app/workouts/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch user profile for stats (mocked for now or basic query)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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

  // 2. Week Streak
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
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              99Grind
            </h1>
            <p className="text-zinc-400">Welcome back, {profile?.username || 'Warrior'}.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 border border-zinc-800 hover:bg-zinc-800 transition-colors">
            <Link href="/profile" className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300">{profile?.username}</span>
              <span className="text-zinc-700">•</span>
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-white">Lvl {profile?.level || 1}</span>
            </Link>
          </div>
        </header>

        <StreakTracker dayStreak={dayStreak} weekStreak={weekStreak} />

        <div className="flex gap-4">
          <Link
            href="/workouts/new"
            className="group relative block flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 transition-transform hover:scale-[1.02]"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Start Workout</h2>
                <p className="mt-1 text-sm text-emerald-100">Log a new session and earn XP.</p>
              </div>
              <div className="inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
          </Link>

          <form action={async () => {
            'use server'
            await logRestDay()
          }}>
            <button
              type="submit"
              className="group relative flex h-full w-32 flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 p-4 transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02]"
            >
              <div className="mb-2 rounded-full bg-zinc-800 p-2 group-hover:bg-zinc-700">
                <Coffee className="h-5 w-5 text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-sm font-bold text-zinc-400 group-hover:text-white text-center leading-tight">
                Log<br />Rest Day
              </span>
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Activity</h2>
          <Calendar workouts={workouts || []} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/exercises"
            className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 transition-transform hover:scale-[1.02] hover:border-zinc-700"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-xl bg-zinc-800 p-3">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Exercises</h2>
              <p className="mt-1 text-sm text-zinc-400">Browse and manage your exercise library.</p>
            </div>
          </Link>

          <Link
            href="/workouts"
            className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 transition-transform hover:scale-[1.02] hover:border-zinc-700"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-xl bg-zinc-800 p-3">
                <History className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">History</h2>
              <p className="mt-1 text-sm text-zinc-400">View past workouts and progress.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
