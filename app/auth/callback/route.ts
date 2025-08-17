// app/auth/callback/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // sets Supabase session cookies for this domain
    await supabase.auth.exchangeCodeForSession(code)
  }

  // after session is set, go to onboarding (middleware will allow it)
  return NextResponse.redirect(`${url.origin}/onboarding`)
}
