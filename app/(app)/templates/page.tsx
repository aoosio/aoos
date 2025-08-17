import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { getServiceClient, getRoles, ensureOrgContext } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function resolveTemplatesTable(): Promise<string> {
  const svc = getServiceClient()
  const tryHead = async (t: string) => {
    const { error } = await svc.from(t).select('*', { head: true }).limit(1)
    return !error
  }
  if (await tryHead('message_templates')) return 'message_templates'
  if (await tryHead('templates')) return 'templates'
  return 'message_templates' // default
}

// server action to save GLOBAL templates (Platform Owner only)
async function saveTemplate(formData: FormData) {
  'use server'
  const supa = createServerComponentClient({ cookies })
  const { data } = await supa.auth.getUser()
  if (!data?.user?.id) return

  const roles = await getRoles(data.user.id)
  if (!roles.is_platform_owner) return // only owners can edit GLOBAL

  const table = await resolveTemplatesTable()
  const key = String(formData.get('key') || '')
  const lang = String(formData.get('lang') || 'en')
  const body = String(formData.get('body') || '')

  if (!key) return
  const svc = getServiceClient()
  await svc.from(table).upsert({ key, lang, scope: 'GLOBAL', body }, { onConflict: 'key,lang,scope' })
  revalidatePath('/templates')
}

export default async function TemplatesPage() {
  const supa = createServerComponentClient({ cookies })
  const { data } = await supa.auth.getUser()
  const uid = data?.user?.id || null
  const roles = uid ? await getRoles(uid) : { is_platform_owner: false, is_platform_admin: false, org_role: null as string | null }
  const isStaff = !!(roles.is_platform_owner || roles.is_platform_admin)
  const org_id = uid ? await ensureOrgContext(uid) : null
  const table = await resolveTemplatesTable()

  // fetch all GLOBAL + (optional) ORG templates
  const svc = getServiceClient()
  const { data: globals } = await svc.from(table).select('*').eq('scope', 'GLOBAL').order('key')
  const orgs = org_id ? (await svc.from(table).select('*').eq('scope', 'ORG').eq('org_id', org_id).order('key')).data || [] : []

  const rows = [
    ...(globals || []).map((r: any) => ({ ...r, _scope: 'GLOBAL' })),
    ...(orgs || []).map((r: any) => ({ ...r, _scope: 'ORG' })),
  ]

  return (
    <section>
      <h1 className="text-xl font-semibold">Message Templates</h1>
      <p className="mt-2 text-neutral-700">
        All templates are visible. {isStaff ? 'Platform Owners can edit GLOBAL.' : 'Read-only for organization users.'}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {rows.map((t) => (
          <form key={`${t.key}:${t.lang}:${t._scope}`} action={isStaff && t._scope === 'GLOBAL' ? saveTemplate : undefined} className="rounded border p-4 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-neutral-500">{t._scope}</div>
            <div className="mt-1 font-semibold">{t.key}</div>
            <div className="mt-1 text-sm text-neutral-500">Language: {t.lang}</div>
            <input type="hidden" name="key" value={t.key} />
            <input type="hidden" name="lang" value={t.lang} />
            <textarea
              name="body"
              defaultValue={t.body || ''}
              className="mt-3 h-28 w-full rounded border p-2"
              placeholder="Body…"
              readOnly={!(isStaff && t._scope === 'GLOBAL')}
            />
            <div className="mt-3 flex gap-2">
              {isStaff && t._scope === 'GLOBAL' ? (
                <button className="rounded bg-brand px-3 py-1.5 text-white">Save</button>
              ) : (
                <span className="rounded bg-neutral-100 px-2 py-1 text-xs">Read-only</span>
              )}
            </div>
          </form>
        ))}
        {!rows.length && <div className="rounded border p-4 text-sm">No templates yet.</div>}
      </div>
    </section>
  )
}
