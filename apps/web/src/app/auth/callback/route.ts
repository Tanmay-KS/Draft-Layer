import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Session is now active — redirect to the editor
            return NextResponse.redirect(`${origin}/`)
        }
    }

    // If no code or exchange failed, send back to auth with error
    return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`)
}
