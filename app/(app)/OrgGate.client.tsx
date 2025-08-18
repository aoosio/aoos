// app/(app)/OrgGate.client.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function OrgGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ok, setOk] = useState(false)
  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/settings/get', { cache: 'no-store' })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j?.org?.id) setOk(true)
      else if (pathname !== '/onboarding') router.replace('/onboarding')
      else setOk(true)
    })()
  }, [router, pathname])
  return ok ? <>{children}</> : null
}
