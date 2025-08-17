// app/api/invite/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supa = getServiceClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const redirectTo = appUrl ? `${appUrl}/auth/callback` : undefined

    // Send Supabase Auth invite (no custom tables needed)
    const { data, error } = await supa.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (error) throw error

    return NextResponse.json({ ok: true, user_id: data?.user?.id ?? null })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
