// app/api/_internal/shape/clear/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { _clearDbShapeCache } from '@/lib/db-adapter'

export async function POST() {
  _clearDbShapeCache()
  return NextResponse.json({ ok: true })
}
