// app/page.tsx
import Link from 'next/link'

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">AOOS</h1>
        <p className="mt-3 text-lg text-neutral-600">
          Send supplier‑ready POs from sales & stock data. WhatsApp native.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/auth/sign-in" className="rounded bg-brand px-4 py-2 text-white shadow-soft">
            Log in / Sign up
          </Link>
          <a href="#features" className="rounded border px-4 py-2">See features</a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-12 grid gap-6 md:grid-cols-3">
        {[
          { h: 'Smart suggestions', p: 'Refill weeks, expiry guard & bulk price insights.' },
          { h: 'WhatsApp outbox', p: 'Approved templates, delivery receipts & failure tracking.' },
          { h: 'Multi‑role RLS', p: 'Owners/Admins/Managers with least‑privilege access.' },
        ].map((f) => (
          <div key={f.h} className="rounded border p-5 shadow-soft">
            <h3 className="font-semibold">{f.h}</h3>
            <p className="mt-2 text-sm text-neutral-600">{f.p}</p>
          </div>
        ))}
      </section>

      {/* PRICING placeholder */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="mt-2 text-neutral-600">Contact us for a plan that fits your market.</p>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm">
          <span>© {new Date().getFullYear()} AOOS</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/auth/sign-in" className="hover:underline">Log in</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
