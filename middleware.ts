// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl
  const { pathname, searchParams } = url

  // Public routes
  const publicRoutes = ['/', '/auth/sign-in', '/auth/sign-up']
  const isPublic = publicRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  const isAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/public')

  // If not logged in and route is protected => redirect to sign in
  if (!session && !isPublic && !isAsset) {
    const redirectTo = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    const signIn = url.clone()
    signIn.pathname = '/auth/sign-in'
    if (redirectTo && redirectTo !== '/') signIn.searchParams.set('redirect', redirectTo)
    return NextResponse.redirect(signIn)
  }

  // If logged in and hitting landing/auth => send to /home
  if (session && (pathname === '/' || pathname.startsWith('/auth'))) {
    const home = url.clone()
    home.pathname = '/home'
    return NextResponse.redirect(home)
  }

  return res
}

export const config = {
  matcher: ['/((?!api/webhooks|_next|favicon.ico|images|public).*)'],
}
// middleware.ts (only the publicRoutes line changes)
const publicRoutes = ['/', '/auth/sign-in', '/auth/sign-up', '/auth/callback']
