// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export const config = {
  matcher: [
    // protect everything except public assets, auth pages, and privacy
    '/((?!_next/static|_next/image|favicon.ico|auth|privacy).*)',
  ],
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const url = req.nextUrl

  const protectedStartsWith = [
    '/home','/suggestions','/pos','/people','/suppliers',
    '/uploads','/outbox','/templates','/audit','/settings',
    '/support','/admin'
  ]
  const isProtected = protectedStartsWith.some(p => url.pathname.startsWith(p))

  if (isProtected && !session) {
    url.pathname = '/auth/sign-in'
    return NextResponse.redirect(url)
  }

  if (url.pathname === '/' && session) {
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return res
}
