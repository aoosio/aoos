// lib/db-adapter.ts
import { getServiceClient } from './supabase-server'

/** Force module mode for TS; keep a default export too to avoid resolver edge cases. */
export {}

export type TableCols = Record<string, boolean>
export type Shape = {
  orgs: { table: string; cols: TableCols }
  members: { table: string; cols: TableCols }
  outbox: { table: string; variant: 'whatsapp' | 'plain'; cols: TableCols }
  sales: { table: string; cols: TableCols }
  stock: { table: string; cols: TableCols }
  waChannel: { table: string; cols: TableCols }
  suppliers: { table: string; cols: TableCols }
  invites?: { table: string; cols: TableCols }
  templates?: { table: string; cols: TableCols }
  pOwners?: { table: string; cols: TableCols }
  pAdmins?: { table: string; cols: TableCols }
}

let cached: Shape | null = null

function isMissingTableErr(err: any) {
  const code = String(err?.code || '').toUpperCase()
  const msg  = String(err?.message || '').toLowerCase()
  return (
    code === '42P01' ||                       // postgres: undefined_table
    code.startsWith('PGRST') ||               // postgrest schema cache errors
    /schema cache/.test(msg) ||
    /not exist/.test(msg) ||
    /could not find.*(relation|table)/.test(msg)
  )
}

function isMissingColumnErr(err: any) {
  const code = String(err?.code || '').toUpperCase()
  const msg  = String(err?.message || '').toLowerCase()
  return (
    code === '42703' ||                       // postgres: undefined_column
    code.startsWith('PGRST') ||               // postgrest schema cache errors
    /schema cache/.test(msg) ||
    /could not find.*column/.test(msg) ||
    /column .* does not exist/.test(msg)
  )
}

async function tableExists(table: string) {
  const svc = getServiceClient()
  try {
    const { error } = await svc.from(table).select('*', { head: true }).limit(1)
    if (error && isMissingTableErr(error)) return false
    return true
  } catch { return false }
}

async function columnExists(table: string, col: string) {
  const svc = getServiceClient()
  try {
    const { error } = await svc.from(table).select(col, { head: true }).limit(1)
    if (error && isMissingColumnErr(error)) return false
    // For other errors (RLS, network…), assume column exists to avoid false negatives.
    return true
  } catch { return false }
}

async function resolveTable(cands: string[]) {
  for (const t of cands) if (await tableExists(t)) return t
  return null
}
async function cols(table: string, names: string[]): Promise<TableCols> {
  const out: TableCols = {}
  await Promise.all(names.map(async n => { out[n] = await columnExists(table, n) }))
  return out
}

export async function getDbShape(): Promise<Shape> {
  if (cached) return cached

  const orgTable =
    (await resolveTable(['organizations'])) || 'organizations'
  const membersTable =
    (await resolveTable(['org_members','organization_members','memberships'])) || 'org_members'
  const outboxTable =
    (await resolveTable(['whatsapp_outbox','outbox'])) || 'whatsapp_outbox'
  const outboxVariant: 'whatsapp' | 'plain' =
    outboxTable === 'whatsapp_outbox' ? 'whatsapp' : 'plain'

  const salesTable =
    (await resolveTable([
      'sales_uploads','sales_imports','sales_reports','sales_data','uploads_sales','sales_csv','sales'
    ])) || 'sales_uploads'
  const stockTable =
    (await resolveTable([
      'stock_uploads','stock_imports','stock_reports','stock_data','uploads_stock','stock_csv','stock'
    ])) || 'stock_uploads'
  const waChannelTable =
    (await resolveTable(['channel_whatsapp','whatsapp_channels','org_whatsapp'])) || 'channel_whatsapp'
  const suppliersTable =
    (await resolveTable(['suppliers','org_suppliers','organization_suppliers'])) || 'suppliers'

  // optional
  const invitesTable   = await resolveTable(['org_invites','organization_invites','invites'])
  const templatesTable = await resolveTable(['message_templates','templates'])
  const pOwnersTable   = await resolveTable(['platform_owners','owners_platform','platform_owner'])
  const pAdminsTable   = await resolveTable(['platform_admins','admins_platform','platform_admin'])

  const shape: Shape = {
    orgs: {
      table: orgTable,
      cols: await cols(orgTable, [
        'id','created_by','name',
        // schema-adaptive fields — support both combined and split types
        'industry_type','org_type','type',
        'org_type_main','org_type_sub',
        'country','state','phone',
        'default_language',
        'ssi_days','sla_target_days','default_dial_code',
      ]),
    },
    members: {
      table: membersTable,
      cols: await cols(membersTable, [
        'org_id','user_id','role','is_active','status','email','created_at'
      ]),
    },
    outbox: {
      table: outboxTable,
      variant: outboxVariant,
      cols: await cols(outboxTable, [
        'id','org_id','to_phone','text','template_name','payload','rendered_text','provider_status','created_by'
      ]),
    },
    sales: {
      table: salesTable,
      cols: await cols(salesTable, [
        'product','sku','barcode',
        'sold_qty','quantity','qty',
        'org_id','uploaded_by','created_by','batch_id','status'
      ]),
    },
    stock: {
      table: stockTable,
      cols: await cols(stockTable, [
        'product','sku','barcode',
        'qty','quantity',
        'expiry_date','expiry','exp_date',
        'distributor','supplier','vendor',
        'distributor_phone','supplier_phone','vendor_phone','phone','phone_e164',
        'org_id','uploaded_by','created_by','batch_id','status'
      ]),
    },
    waChannel: {
      table: waChannelTable,
      cols: await cols(waChannelTable, [
        'org_id','phone_number_id','waba_id',
        'token_encrypted','token_masked','token_hint','is_connected'
      ]),
    },
    suppliers: {
      table: suppliersTable,
      cols: await cols(suppliersTable, [
        'id','name','supplier_name',
        'phone','phone_e164',
        'preferred_language','language','lang',
        'org_id','created_by','updated_by',
        'created_at','updated_at','is_active'
      ]),
    },
  }

  if (invitesTable) {
    shape.invites = {
      table: invitesTable,
      cols: await cols(invitesTable, [
        'org_id','email','role','status','invited_by','user_id','created_at','accepted_at'
      ]),
    }
  }
  if (templatesTable) {
    shape.templates = {
      table: templatesTable,
      cols: await cols(templatesTable, [
        'id','name','key','slug',
        'lang','language',
        'scope','template_scope','org_id',
        'text','body','content',
        'linked_action','action',
        'enabled','is_active','updated_at'
      ]),
    }
  }
  if (pOwnersTable) shape.pOwners = { table: pOwnersTable, cols: await cols(pOwnersTable, ['user_id','is_active']) }
  if (pAdminsTable) shape.pAdmins = { table: pAdminsTable, cols: await cols(pAdminsTable, ['user_id','is_active']) }

  cached = shape
  return shape
}

export function _clearDbShapeCache() { cached = null }

const DbAdapter = { getDbShape, _clearDbShapeCache }
export default DbAdapter
