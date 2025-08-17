// app/auth/reset/page.tsx
import { Suspense } from 'react'
import ResetClient from './ResetClient'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-6 py-16">
          <h1 className="mb-2 text-2xl font-semibold">Set a new password</h1>
          <p className="text-neutral-600">Loading…</p>
        </main>
      }
    >
      <ResetClient />
    </Suspense>
  )
}
