'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // 1. Lookup email from username
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .single()

    if (!profile || !profile.email) {
        return redirect('/login?message=Invalid username or password')
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
    })

    if (error) {
        return redirect('/login?message=Invalid username or password')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
    })

    if (error) {
        return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/login?message=Check email to continue sign in process')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // Get the base URL dynamically or from env
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
        const { headers } = await import('next/headers')
        const headersList = await headers()
        const host = headersList.get('host')
        const protocol = headersList.get('x-forwarded-proto') || 'http'
        baseUrl = `${protocol}://${host}`
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/callback?next=/update-password`,
    })

    if (error) {
        return redirect('/forgot-password?message=Could not send reset email')
    }

    return redirect('/login?message=Check email for password reset link')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        return redirect('/update-password?message=Could not update password')
    }

    return redirect('/?message=Password updated successfully')
}
