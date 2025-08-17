'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'

type Row = { user_id: string | null; email: string | null; role: string; status: string; created_at: string | null }

export default function People() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'PO_MANAGER'>('PO_MANAGER')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>([])

  async function load() {
    setMsg(null)
    const r = await fetch('/api/members/list', { cache: 'no-store' })
    const j = await r.json()
    if (!r.ok) setMsg(j.error || 'Failed to load')
    else setRows(j.members || [])
  }

  useEffect(() => { load() }, [])

  async function invite() {
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed to invite')
      setEmail('')
      await load()
      setMsg('Invite sent (check email).')
    } catch (e: any) { setMsg(e.message) } finally { setBusy(false) }
  }

  async function remove(user_id: string | null) {
    if (!user_id) return
    if (!confirm('Remove this member?')) return
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/members/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'Failed to remove')
      await load()
    } catch (e: any) { setMsg(e.message) } finally { setBusy(false) }
  }

  return (
    <section>
      <h1 className="text-xl font-semibold">{t('team.title')}</h1>
      <p className="mt-2 text-neutral-700">{t('team.onlyOwner')}</p>

      <form
        className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_120px]"
        onSubmit={(e) => { e.preventDefault(); invite() }}
      >
        <input className="rounded border px-3 py-2" placeholder={t('team.inviteEmail')} value={email} onChange={(e)=>setEmail(e.target.value)} />
        <select className="rounded border px-3 py-2" value={role} onChange={(e)=>setRole(e.target.value as any)}>
          <option value="ADMIN">Admin</option>
          <option value="PO_MANAGER">PO Manager</option>
        </select>
        <button className="rounded bg-brand px-3 py-2 text-white disabled:opacity-50" disabled={busy}>{t('team.sendInvite')}</button>
      </form>
      {msg && <p className="mt-2 text-sm">{msg}</p>}

      <div className="mt-8 overflow-x-auto rounded border shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-left">
            <tr>
              <th className="px-4 py-2">{t('team.user')}</th>
              <th className="px-4 py-2">{t('team.role')}</th>
              <th className="px-4 py-2">{t('team.status')}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{r.email || r.user_id || '—'}</td>
                <td className="px-4 py-3">{r.role}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-right">
                  {r.role !== 'OWNER' && (
                    <button onClick={()=>remove(r.user_id)} className="rounded border px-3 py-1">Remove</button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr className="border-t"><td className="px-4 py-3" colSpan={4}>{t('team.noInvites')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
