import { createClient } from '@/utils/supabase/server'
import { WorkoutLogger } from '@/components/workout-logger'
import { redirect } from 'next/navigation'
import { getWorkoutTemplates } from '@/app/workouts/actions'

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

    const { data: profile } = await supabase
        .from('profiles')
        .select('weight_unit')
        .eq('id', user.id)
        .single()

    const templates = await getWorkoutTemplates()

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-3xl">
                <WorkoutLogger
                    exercises={exercises || []}
                    userId={user.id}
                    initialUnit={profile?.weight_unit || 'kg'}
                    templates={templates}
                />
            </div>
        </div>
    )
}
