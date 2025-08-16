// app/auth/sign-up/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setErr(error.message); return }
    // You can create org lazily from Settings; RLS will still protect everything until then.
    router.replace('/home')
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-16 max-w-sm space-y-3 px-6">
      <h2 className="text-xl font-semibold">Create account</h2>
      <input className="w-full rounded border px-3 py-2" type="email" placeholder="Email"
             value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password"
             value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="rounded bg-black px-3 py-2 text-white">Create account</button>
    </form>
  )
}
