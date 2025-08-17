// app/api/diagnostics/db-shape/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDbShape } from '@/lib/db-adapter'

export async function GET() {
  const shape = await getDbShape()
  return NextResponse.json(shape)
}
