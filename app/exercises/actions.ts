'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExercise(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const target_muscle = formData.get('target_muscle') as string
    const type = formData.get('type') as string

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Check for duplicates (simple case-insensitive check)
    const { data: existing } = await supabase
        .from('exercises')
        .select('id')
        .ilike('name', name)
        .single()

    if (existing) {
        return { error: 'Exercise already exists' }
    }

    const { data, error } = await supabase
        .from('exercises')
        .insert({
            name,
            target_muscle,
            type,
            created_by: user.id,
            is_verified: false,
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/exercises')
    return { data }
}
