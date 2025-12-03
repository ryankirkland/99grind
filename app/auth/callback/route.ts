import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            console.log('[AUTH_DEBUG] Callback: Session exchanged. User:', user?.id)
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('[AUTH_DEBUG] Callback: Exchange error:', error)
        }
    } else {
        console.log('[AUTH_DEBUG] Callback: No code found')
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
