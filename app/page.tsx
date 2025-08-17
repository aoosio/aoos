import Link from 'next/link'

export default function Landing() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">AOOS</h1>
        <p className="mt-3 text-lg text-neutral-600">
          Send supplier-ready POs from sales & stock data. WhatsApp native.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/auth/sign-in" className="rounded bg-brand px-4 py-2 text-white">Sign in</Link>
          <Link href="/auth/sign-up" className="rounded border px-4 py-2">Create account</Link>
        </div>
      </section>
    </main>
  )
}
