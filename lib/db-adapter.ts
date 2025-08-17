// lib/db-adapter.ts
// Runtime DB shape detector (cached). Finds real table names and which columns exist
// so server routes can adapt without hard-coding schema details.

import { getServiceClient } from './supabase-server'

type TableCols = Record<string, boolean>
type Shape = {
  orgs: { table: string; cols: TableCols }
  members: { table: string; cols: TableCols }
  outbox: { table: string; variant: 'whatsapp' | 'plain'; cols: TableCols }
  sales: { table: string; cols: TableCols }
  stock: { table: string; cols: TableCols }
  waChannel: { table: string; cols: TableCols }
  suppliers: { table: string; cols: TableCols }
}

let cached: Shape | null = null

async function tableExists(table: string) {
  const svc = getServiceClient()
  try {
    const { error } = await svc.from(table).select('*', { head: true }).limit(1)
    // 42P01 = undefined_table
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
    // 42703 = undefined_column
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
  await Promise.all(names.map(async (n) => { out[n] = await columnExists(table, n) }))
  return out
}

/** Detect actual DB shape and cache it. */
export async function getDbShape(): Promise<Shape> {
  if (cached) return cached

  // organizations
  const orgTable = (await resolveTable(['organizations'])) || 'organizations'

  // membership (we've seen several names during iterations)
  const membersTable =
    (await resolveTable(['org_members', 'organization_members', 'memberships'])) || 'org_members'

  // outbox variants
  const outboxTable =
    (await resolveTable(['whatsapp_outbox', 'outbox'])) || 'whatsapp_outbox'
  const outboxVariant: 'whatsapp' | 'plain' =
    outboxTable === 'whatsapp_outbox' ? 'whatsapp' : 'plain'

  // ---- Expanded candidates based on your latest migrations / CSV uploads ----
  const salesTable =
    (await resolveTable([
      'sales_uploads',
      'sales_imports',
      'sales_reports',
      'sales_data',
      'uploads_sales',
      'sales_csv',
      'sales',
    ])) || 'sales_uploads'

  const stockTable =
    (await resolveTable([
      'stock_uploads',
      'stock_imports',
      'stock_reports',
      'stock_data',
      'uploads_stock',
      'stock_csv',
      'stock',
    ])) || 'stock_uploads'

  // WhatsApp channel
  const waChannelTable =
    (await resolveTable(['channel_whatsapp', 'whatsapp_channels', 'org_whatsapp'])) ||
    'channel_whatsapp'

  // suppliers (various names we’ve seen)
  const suppliersTable =
    (await resolveTable(['suppliers', 'org_suppliers', 'organization_suppliers'])) ||
    'suppliers'

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

    // ---- Sales: include synonyms your upload route can target ----
    sales: {
      table: salesTable,
      cols: await cols(salesTable, [
        // product identity
        'product', 'sku', 'barcode',
        // quantity variants
        'sold_qty', 'quantity', 'qty',
        // ownership / provenance
        'org_id', 'uploaded_by', 'created_by',
        // optional tracking
        'batch_id', 'status',
        // (add more here if your last SQL added other NOT NULL cols)
      ]),
    },

    // ---- Stock: include synonyms your upload route can target ----
    stock: {
      table: stockTable,
      cols: await cols(stockTable, [
        // product identity
        'product', 'sku', 'barcode',
        // quantity variants
        'qty', 'quantity',
        // expiry variants
        'expiry_date', 'expiry', 'exp_date',
        // distributor/supplier/vendor name variants
        'distributor', 'supplier', 'vendor',
        // phone variants (including generic phone fields)
        'distributor_phone', 'supplier_phone', 'vendor_phone', 'phone', 'phone_e164',
        // ownership / provenance
        'org_id', 'uploaded_by', 'created_by',
        // optional tracking
        'batch_id', 'status',
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

    suppliers: {
      table: suppliersTable,
      cols: await cols(suppliersTable, [
        'id',
        // name variants
        'name', 'supplier_name',
        // phone variants
        'phone', 'phone_e164',
        // language variants
        'preferred_language', 'language', 'lang',
        // ownership / provenance
        'org_id', 'created_by', 'updated_by',
        // timestamps / status
        'created_at', 'updated_at', 'is_active',
      ]),
    },
  }

  cached = shape
  return shape
}

/** For tests / hot-reloads if needed */
export function _clearDbShapeCache() {
  cached = null
}
