import { Suspense } from 'react'
import SignInForm from './sign-in-form'
export const dynamic = 'force-dynamic'
export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
      <p className="mb-6 text-neutral-700">Use email magic link or password.</p>
      <Suspense fallback={<div>Loading…</div>}>
        <SignInForm />
      </Suspense>
    </main>
  )
}
