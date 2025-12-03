import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    const logFile = path.join(process.cwd(), 'debug.log')
    const log = (msg: string) => {
        try {
            fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`)
        } catch (e) {
            console.error('Failed to write to log file:', e)
        }
    }

    log(`Auth Callback Debug:`)
    log(` - URL: ${request.url}`)
    log(` - Code present: ${!!code}`)
    log(` - Next path: ${next}`)
    log(` - NEXT_PUBLIC_BASE_URL: ${process.env.NEXT_PUBLIC_BASE_URL}`)

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            log(` - Exchange Error: ${JSON.stringify(error)}`)
            console.error(' - Exchange Error:', error)
        } else {
            log(` - Session exchanged successfully`)
            console.log(' - Session exchanged successfully')
            return NextResponse.redirect(`${origin}${next}`)
        }
    } else {
        log(` - No code found in params`)
        console.log(' - No code found in params')
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
