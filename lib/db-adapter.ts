// lib/db-adapter.ts
import { getServiceClient } from './supabase-server'

type TableCols = Record<string, boolean>
type Shape = {
  orgs: { table: string; cols: TableCols }
  members: { table: string; cols: TableCols }
  outbox: { table: string; variant: 'whatsapp' | 'plain'; cols: TableCols }
  sales: { table: string; cols: TableCols }
  stock: { table: string; cols: TableCols }
  waChannel: { table: string; cols: TableCols }
}

let cached: Shape | null = null

async function tableExists(table: string) {
  const svc = getServiceClient()
  try {
    const { error } = await svc.from(table).select('*', { head: true }).limit(1)
    if (error && (error.code === '42P01' || /does not exist/i.test(error.message))) return false
    return true
  } catch {
    return false
  }
}

async function columnExists(table: string, col: string) {
  const svc = getServiceClient()
  try {
    const { error } = await svc.from(table).select(col, { head: true }).limit(1)
    if (error && (error.code === '42703' || /column .* does not exist/i.test(error.message))) return false
    return true
  } catch {
    return false
  }
}

async function resolveTable(candidates: string[]) {
  for (const t of candidates) {
    if (await tableExists(t)) return t
  }
  return null
}

async function cols(table: string, names: string[]): Promise<TableCols> {
  const out: TableCols = {}
  await Promise.all(names.map(async n => { out[n] = await columnExists(table, n) }))
  return out
}

/** Detect actual DB shape and cache it. */
export async function getDbShape(): Promise<Shape> {
  if (cached) return cached

  // organizations (assume 'organizations', but confirm columns)
  const orgTable = (await resolveTable(['organizations'])) || 'organizations'

  // membership table names we saw across iterations
  const membersTable =
    (await resolveTable(['org_members', 'organization_members', 'memberships'])) || 'org_members'

  // outbox variants
  const outboxTable =
    (await resolveTable(['whatsapp_outbox', 'outbox'])) || 'whatsapp_outbox'
  const outboxVariant = outboxTable === 'whatsapp_outbox' ? 'whatsapp' : 'plain'

  // uploads
  const salesTable = (await resolveTable(['sales_uploads', 'sales'])) || 'sales_uploads'
  const stockTable = (await resolveTable(['stock_uploads', 'stock'])) || 'stock_uploads'

  // whatsapp channel
  const waChannelTable =
    (await resolveTable(['channel_whatsapp', 'whatsapp_channels', 'org_whatsapp'])) ||
    'channel_whatsapp'

  const shape: Shape = {
    orgs: {
      table: orgTable,
      cols: await cols(orgTable, ['id', 'created_by', 'name']),
    },
    members: {
      table: membersTable,
      cols: await cols(membersTable, ['org_id', 'user_id', 'role', 'is_active', 'status', 'email']),
    },
    outbox: {
      table: outboxTable,
      variant: outboxVariant,
      cols: await cols(outboxTable, [
        'id',
        'org_id',
        'to_phone',
        'text',
        'template_name',
        'payload',
        'rendered_text',
        'provider_status',
        'created_by',
      ]),
    },
    sales: {
      table: salesTable,
      cols: await cols(salesTable, ['product', 'sold_qty', 'org_id', 'uploaded_by', 'created_by']),
    },
    stock: {
      table: stockTable,
      cols: await cols(stockTable, [
        'product',
        'qty',
        'expiry_date',
        'distributor',
        'distributor_phone',
        'org_id',
        'uploaded_by',
        'created_by',
      ]),
    },
    waChannel: {
      table: waChannelTable,
      cols: await cols(waChannelTable, [
        'org_id',
        'phone_number_id',
        'waba_id',
        'token_encrypted',
        'token_masked',
        'token_hint',
        'is_connected',
      ]),
    },
  }

  cached = shape
  return shape
}
