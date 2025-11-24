import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Dumbbell, Plus, History, Trophy } from 'lucide-react'

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
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-white">Lvl {profile?.level || 1}</span>
            </Link>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/workouts/new"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 transition-transform hover:scale-[1.02]"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Start Workout</h2>
              <p className="mt-1 text-sm text-emerald-100">Log a new session and earn XP.</p>
            </div>
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
          </Link>

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
            className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 transition-transform hover:scale-[1.02] hover:border-zinc-700 sm:col-span-2"
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
