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
