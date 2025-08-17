// app/api/account/password/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServiceClient, getUserClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const userClient = getUserClient()
    const {
      data: { user },
      error: uErr,
    } = await userClient.auth.getUser()
    if (uErr) throw uErr
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { current_password, new_password } = await req.json()
    if (!new_password || String(new_password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Optional: verify current password if provided
    if (current_password) {
      const { error: verifyErr } = await userClient.auth.signInWithPassword({
        email: user.email!,
        password: current_password,
      })
      if (verifyErr) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }

    // Update password securely using service role (only for self)
    const svc = getServiceClient()
    const { error } = await svc.auth.admin.updateUserById(user.id, { password: new_password })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to change password' }, { status: 500 })
  }
}
