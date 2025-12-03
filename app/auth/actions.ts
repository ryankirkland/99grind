'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    console.log('[AUTH_DEBUG] login called')
    const supabase = await createClient()

    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // 1. Lookup email from username
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username)
        .single()

    if (profileError || !profile || !profile.email) {
        console.log('[AUTH_DEBUG] Profile lookup failed:', profileError)
        return redirect('/login?message=Invalid username or password')
    }

    console.log('[AUTH_DEBUG] Found email for username:', profile.email)

    const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
    })

    if (error) {
        console.log('[AUTH_DEBUG] SignIn failed:', error)
        return redirect('/login?message=Invalid username or password')
    }

    console.log('[AUTH_DEBUG] Login successful')
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    console.log('[AUTH_DEBUG] signup called')
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
        console.log('[AUTH_DEBUG] Signup failed:', error)
        return redirect('/login?message=Could not authenticate user')
    }

    console.log('[AUTH_DEBUG] Signup successful, check email')
    return redirect('/login?message=Check email to continue sign in process')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}

export async function resetPassword(formData: FormData) {
    console.log('[AUTH_DEBUG] resetPassword called')
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

    console.log('[AUTH_DEBUG] Reset password for email:', email, 'BaseURL:', baseUrl)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent('/update-password')}`,
    })

    if (error) {
        console.log('[AUTH_DEBUG] Reset password failed:', error)
        return redirect('/forgot-password?message=Could not send reset email')
    }

    console.log('[AUTH_DEBUG] Reset password email sent')
    return redirect('/login?message=Check email for password reset link')
}

export async function updatePassword(formData: FormData) {
    console.log('[AUTH_DEBUG] updatePassword called')
    const supabase = await createClient()
    const password = formData.get('password') as string

    // Check if we have a session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('[AUTH_DEBUG] Current user:', user?.id, 'Error:', userError)

    if (!user) {
        console.log('[AUTH_DEBUG] No user found, redirecting to login')
        return redirect('/login?message=Session expired, please login again')
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        console.error('[AUTH_DEBUG] Update user error:', error)
        return redirect('/update-password?message=Could not update password')
    }

    console.log('[AUTH_DEBUG] Password updated successfully for user:', user.id)
    return redirect('/?message=Password updated successfully')
}
