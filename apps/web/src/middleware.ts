import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // Refresh the session JWT — must be awaited
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // If NOT logged in and trying to access a protected page → force to /auth
    if (!user && pathname !== '/auth') {
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    // If logged in and trying to visit /auth → send to editor
    if (user && pathname === '/auth') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        // Match everything EXCEPT: Next internals, static assets, api routes, and the callback
        '/((?!_next/static|_next/image|favicon.ico|auth/callback|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
