'use client'
import { useEffect, useState } from 'react'

type Tmpl = { id?: string; key: string; lang: string; scope: 'GLOBAL'|'ORG'; body?: string | null }
type Payload = { globals: Tmpl[]; orgs: Tmpl[]; canEditGlobal: boolean }

export default function TemplatesPage() {
  const [data, setData] = useState<Payload>({ globals: [], orgs: [], canEditGlobal: false })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    setMsg(null)
    const r = await fetch('/api/templates/list', { cache: 'no-store' })
    const j = await r.json()
    if (!r.ok) setMsg(j.error || 'Failed to load templates')
    else setData(j)
  }
  useEffect(() => { load() }, [])

  async function save(key: string, lang: string, body: string) {
    if (!data.canEditGlobal) return
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/templates/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, lang, body }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Save failed')
      setMsg('Saved')
      await load()
    } catch (e:any) { setMsg(e.message) } finally { setBusy(false) }
  }

  return (
    <section>
      <h1 className="text-xl font-semibold">Message Templates</h1>
      <p className="mt-2 text-neutral-700">
        All templates are visible. {data.canEditGlobal ? 'You can edit GLOBAL.' : 'Read-only for org users.'}
      </p>

      {msg && <p className="mt-3 text-sm">{msg}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[...data.globals.map(t => ({...t,_scope:'GLOBAL'} as any)), ...data.orgs.map(t => ({...t,_scope:'ORG'} as any))].map((t:any) => (
          <div key={`${t.key}:${t.lang}:${t._scope}`} className="rounded border p-4 shadow-soft">
            <div className="text-xs uppercase tracking-wide text-neutral-500">{t._scope}</div>
            <div className="mt-1 font-semibold">{t.key}</div>
            <div className="mt-1 text-sm text-neutral-500">Language: {t.lang}</div>
            <textarea
              defaultValue={t.body || ''}
              className="mt-3 h-28 w-full rounded border p-2"
              readOnly={!(data.canEditGlobal && t._scope === 'GLOBAL')}
              onBlur={(e) => {
                const val = e.currentTarget.value
                if (data.canEditGlobal && t._scope === 'GLOBAL') save(t.key, t.lang, val)
              }}
            />
            <div className="mt-2 text-xs text-neutral-500">{data.canEditGlobal && t._scope === 'GLOBAL' ? 'Auto-saves on blur' : 'Read-only'}</div>
          </div>
        ))}
        {!data.globals.length && !data.orgs.length && <div className="rounded border p-4 text-sm">No templates yet.</div>}
      </div>
    </section>
  )
}
// Note: This code assumes you have a backend API at /api/templates/list and /api/templates/save
// that handles fetching and saving templates respectively. Adjust the API endpoints as needed.
// The code also assumes you have a CSS framework like Tailwind CSS for styling.
// If you don't, you can replace the class names with your own styles.                    