'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/` } })
    if (!error) setSent(true)
    else alert(error.message)
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <h1 className="mb-2 text-xl font-semibold">Sign in</h1>
        <p className="mb-4 text-sm text-slate-500">Enter your email. We’ll send a magic link.</p>
        {sent ? (
          <div className="text-sm text-emerald-700">Check your inbox to continue.</div>
        ) : (
          <>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="mt-4"><Button onClick={signIn} className="w-full">Send magic link</Button></div>
          </>
        )}
      </Card>
    </div>
  )
}