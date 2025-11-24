import { createClient } from '@/utils/supabase/server'
import { WorkoutLogger } from '@/components/workout-logger'
import { redirect } from 'next/navigation'

export default async function NewWorkoutPage() {
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
            <div className="mx-auto max-w-3xl">
                <WorkoutLogger exercises={exercises || []} userId={user.id} />
            </div>
        </div>
    )
}
