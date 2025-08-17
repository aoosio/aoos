// app/api/public-env/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY

    if (!url || !key) {
      return NextResponse.json(
        { error: 'Supabase env missing on server' },
        { status: 500 }
      )
    }
    return NextResponse.json({ url, key })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
