// app/(public)/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">AOOS</h1>
      <p className="mt-2 text-slate-600">
        Send supplier‑ready POs from sales & stock data. WhatsApp native.
      </p>
      <div className="mt-6 flex gap-3">
        <Link className="underline" href="/auth/sign-in">Log in</Link>
        <Link className="underline" href="/auth/sign-up">Sign up</Link>
      </div>
    </section>
  )
}
