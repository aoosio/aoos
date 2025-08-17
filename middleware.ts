// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export const config = {
  matcher: [
    // protect app pages; skip assets, auth, privacy, and ALL api routes
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|auth|privacy).*)',
  ],
}

export async function middleware(req: NextRequest) {
  // Always allow preflight and HEAD to pass
  if (req.method === 'OPTIONS' || req.method === 'HEAD') return NextResponse.next()

  const res = NextResponse.next()
  try {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If envs are missing in Preview, don't break the site—just let it through.
    if (!supabaseUrl || !supabaseKey) return res

    const supabase = createMiddlewareClient(
      { req, res },
      { supabaseUrl, supabaseKey }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const url = req.nextUrl
    const protectedStartsWith = [
      '/home',
      '/suggestions',
      '/pos',
      '/people',
      '/suppliers',
      '/uploads',
      '/outbox',
      '/templates',
      '/audit',
      '/settings',
      '/support',
      '/admin',
    ]
    const isProtected = protectedStartsWith.some((p) =>
      url.pathname.startsWith(p)
    )

    if (isProtected && !session) {
      url.pathname = '/auth/sign-in'
      return NextResponse.redirect(url)
    }

    if (url.pathname === '/' && session) {
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }

    return res
  } catch {
    // Never surface middleware errors to users; just continue request.
    return res
  }
}
