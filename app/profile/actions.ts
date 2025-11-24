'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const weight_unit = formData.get('weight_unit') as string

    const { error } = await supabase
        .from('profiles')
        .update({ weight_unit })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}
