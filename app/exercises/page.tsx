import { createClient } from '@/utils/supabase/server'
import { ExerciseList } from '@/components/exercise-list'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function ExercisesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: exercises } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-white">
                            Exercises
                        </h1>
                        <p className="text-zinc-400">Manage your exercise database.</p>
                    </div>
                </div>

                <ExerciseList initialExercises={exercises || []} userId={user.id} />
            </div>
        </div>
    )
}
