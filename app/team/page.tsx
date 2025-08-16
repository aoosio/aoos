// app/team/page.tsx
'use client'

import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table'
import { useI18n } from '@/lib/i18n'

type Role = 'owner' | 'po_manager' | 'viewer'
type Org = { id: string } | null

type Invite = {
  id: string
  email: string
  role: Role
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED'
  created_at: string
}

type Member = {
  user_id: string
  role: Role
  created_at: string
  display_email: string | null // optional, if your schema exposes it
}

async function fetchOrg(): Promise<Org> {
  const { data, error } = await supabase.from('organizations').select('id').limit(1)
  if (error) throw error
  return data?.[0] ?? null
}

async function myRole(org_id: string): Promise<Role | null> {
  const { data } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', org_id)
    .limit(1)
  return (data?.[0]?.role as Role | undefined) ?? null
}

async function loadInvites(org_id: string): Promise<Invite[]> {
  const { data, error } = await supabase
    .from('org_invites')
    .select('id,email,role,status,created_at')
    .eq('org_id', org_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Invite[]
}

async function loadMembers(org_id: string): Promise<Member[]> {
  // If you have a view exposing emails, select it; otherwise we show user_id only.
  const { data, error } = await supabase
    .from('org_members')
    .select('user_id,role,created_at,display_email') // display_email is optional
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

  const { data: invites, mutate: refreshInvites } = useSWR(
    orgId ? ['team/invites', orgId] : null,
    () => loadInvites(orgId as string)
  )

  const { data: members, mutate: refreshMembers } = useSWR(
    orgId ? ['team/members', orgId] : null,
    () => loadMembers(orgId as string)
  )

  // --- Invite form ---
  const [email, setEmail] = useState('')
  const [busyInvite, setBusyInvite] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const canInvite = useMemo(() => role === 'owner', [role])

  async function sendInvite() {
    if (!orgId) return
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailOk) {
      setToast(lang === 'ar' ? 'بريد غير صالح' : 'Invalid email')
      return
    }
    setBusyInvite(true)
    setToast(null)
    try {
      const { error } = await supabase
        .from('org_invites')
        .insert({
          org_id: orgId,
          email: email.trim().toLowerCase(),
          role: 'po_manager',
          status: 'PENDING',
        } as any)
      if (error) throw error
      setEmail('')
      setToast(lang === 'ar' ? 'تم إرسال الدعوة.' : 'Invite sent.')
      refreshInvites()
    } catch (e: any) {
      setToast(e?.message ?? 'Failed to send invite')
    } finally {
      setBusyInvite(false)
    }
  }

  async function cancelInvite(id: string) {
    if (!orgId) return
    try {
      const { error } = await supabase
        .from('org_invites')
        .update({ status: 'CANCELLED' })
        .eq('id', id)
        .eq('org_id', orgId)
        .eq('status', 'PENDING')
      if (error) throw error
      refreshInvites()
    } catch (e: any) {
      setToast(e?.message ?? 'Failed to cancel invite')
    }
  }

  async function removeMember(user_id: string) {
    if (!orgId) return
    try {
      const { error } = await supabase
        .from('org_members')
        .delete()
        .eq('org_id', orgId)
        .eq('user_id', user_id)
        .neq('role', 'owner') // guard on RLS too
      if (error) throw error
      refreshMembers()
    } catch (e: any) {
      setToast(e?.message ?? 'Failed to remove')
    }
  }

  return (
    <div className="grid gap-6">
      {/* Invite block */}
      <Card>
        <h1 className="mb-3 text-lg font-semibold">{t('team.title')}</h1>

        <div className="grid items-end gap-3 sm:grid-cols-[1fr,auto]">
          <div>
            <Label>{t('team.inviteEmail')}</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              dir="ltr"
            />
          </div>
          <div>
            <Button onClick={sendInvite} disabled={!canInvite || busyInvite || !email.trim()}>
              {busyInvite ? t('common.saving') : t('team.sendInvite')}
            </Button>
          </div>
          {!canInvite && (
            <div className="sm:col-span-2 text-sm text-slate-500">
              {lang === 'ar'
                ? 'فقط مالك الماركت يمكنه إرسال الدعوات.'
                : 'Only the market owner can send invites.'}
            </div>
          )}
          {toast && <div className="sm:col-span-2 text-sm text-slate-600">{toast}</div>}
        </div>
      </Card>

      {/* Pending invites */}
      <Card>
        <h2 className="mb-3 text-base font-semibold">{t('team.pendingInvites')}</h2>
        <Table>
          <THead>
            <TR>
              <TH>Email</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH>Created</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {(invites ?? []).map((inv) => (
              <TR key={inv.id}>
                <TD className="font-mono">{inv.email}</TD>
                <TD>{inv.role}</TD>
                <TD>{inv.status}</TD>
                <TD>{new Date(inv.created_at).toLocaleString()}</TD>
                <TD className="text-right">
                  {inv.status === 'PENDING' && (
                    <Button
                      variant="secondary"
                      onClick={() => cancelInvite(inv.id)}
                      disabled={!canInvite}
                    >
                      {t('team.cancel')}
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
            {(!invites || invites.length === 0) && (
              <TR>
                <TD colSpan={5} className="text-slate-500">
                  {lang === 'ar' ? 'لا توجد دعوات.' : 'No invites.'}
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {/* Members */}
      <Card>
        <h2 className="mb-3 text-base font-semibold">{t('team.members')}</h2>
        <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Role</TH>
              <TH>Since</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {(members ?? []).map((m) => {
              const removable = role === 'owner' && m.role !== 'owner'
              const label = m.display_email || m.user_id
              return (
                <TR key={m.user_id}>
                  <TD className="font-mono">{label}</TD>
                  <TD>{m.role}</TD>
                  <TD>{new Date(m.created_at).toLocaleDateString()}</TD>
                  <TD className="text-right">
                    <Button
                      variant="secondary"
                      onClick={() => removeMember(m.user_id)}
                      disabled={!removable}
                    >
                      {t('team.remove')}
                    </Button>
                  </TD>
                </TR>
              )
            })}
            {(!members || members.length === 0) && (
              <TR>
                <TD colSpan={4} className="text-slate-500">
                  {lang === 'ar' ? 'لا يوجد أعضاء.' : 'No members.'}
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </div>
  )
}
