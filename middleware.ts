import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const PUBLIC = new Set(['/', '/privacy', '/auth/sign-in', '/auth/sign-up', '/auth/callback'])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC.has(pathname)) return NextResponse.next()

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Force onboarding: no membership yet
  if (!pathname.startsWith('/onboarding')) {
    const { data: mem } = await supabase.from('members').select('org_id').limit(1)
    if (!mem || mem.length === 0) {
      const url = req.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
