// app/team/page.tsx
'use client'
import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useI18n } from '@/lib/i18n'

type Role = 'owner' | 'admin' | 'po_manager'
type Member = { user_id: string; role: Role; created_at: string; display_email?: string | null }
type Org = { id: string } | null

async function fetchOrg(): Promise<Org> {
  const { data, error } = await supabase.from('organizations').select('id').limit(1)
  if (error) throw error
  return data?.[0] ?? null
}
async function myRole(org_id: string): Promise<Role | null> {
  const { data } = await supabase.from('org_members').select('role').eq('org_id', org_id).limit(1)
  return (data?.[0]?.role as Role | undefined) ?? null
}
async function loadMembers(org_id: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('org_members')
    .select('user_id,role,created_at,display_email')
    .eq('org_id', org_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Member[]
}

export default function TeamPage() {
  const { t, lang } = useI18n() as any
  const [org, setOrg] = useState<Org>(null)
  const [role, setRole] = useState<Role | null>(null)
  const orgId = org?.id ?? null

  useEffect(() => {
    ;(async () => {
      const o = await fetchOrg()
      setOrg(o)
      if (o) setRole(await myRole(o.id))
    })()
  }, [])

  const { data: members, mutate: refreshMembers } = useSWR(
    orgId ? ['team/members', orgId] : null,
    () => loadMembers(orgId as string)
  )

  // Add by user_id (requires target user to have signed up already)
  const [newUserId, setNewUserId] = useState('')
  const [newRole, setNewRole] = useState<Role>('po_manager')
  const [toast, setToast] = useState<string | null>(null)
  const canInvite = useMemo(() => role === 'owner', [role])

  async function addMember() {
    if (!orgId) return
    if (!newUserId.trim()) { setToast('user_id required'); return }
    setToast(null)
    const { error } = await supabase.from('org_members').insert({
      org_id: orgId, user_id: newUserId.trim(), role: newRole
    } as any)
    if (error) setToast(error.message)
    else { setNewUserId(''); refreshMembers() }
  }

  async function removeMember(user_id: string) {
    if (!orgId) return
    const { error } = await supabase
      .from('org_members')
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', user_id)
      .neq('role', 'owner') // guard; RLS also enforces
    if (error) setToast(error.message)
    else refreshMembers()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t('team.title')}</h1>

      {/* Add member (owner only) */}
      <div className="space-y-2">
        <div className="text-sm">{lang === 'ar' ? 'أدخل user_id للمستخدم المسجل' : 'Enter user_id of an already signed-up user'}</div>
        <div className="flex gap-2">
          <input className="w-96 rounded border px-3 py-2" placeholder="auth user_id (uuid)"
                 value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
          <select className="rounded border px-2 py-2" value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
            <option value="po_manager">PO manager</option>
            <option value="admin">Org admin</option>
          </select>
          <button className="rounded bg-black px-3 py-2 text-white" onClick={addMember} disabled={!canInvite}>
            {lang === 'ar' ? 'إضافة' : 'Add'}
          </button>
        </div>
        {!canInvite && <div className="text-xs text-slate-500">
          {lang === 'ar' ? 'فقط مالك السوق يمكنه إدارة الأعضاء.' : 'Only the market owner can manage members.'}
        </div>}
        {toast && <div className="text-xs text-slate-600">{toast}</div>}
      </div>

      {/* Members */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left"><th>User</th><th>Role</th><th>Since</th><th></th></tr>
        </thead>
        <tbody>
          {(members ?? []).map((m) => {
            const removable = role === 'owner' && m.role !== 'owner'
            const label = m.display_email || m.user_id
            return (
              <tr key={m.user_id}>
                <td>{label}</td>
                <td>{m.role}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="underline" onClick={() => removeMember(m.user_id)} disabled={!removable}>
                    {lang === 'ar' ? 'حذف' : 'Remove'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
