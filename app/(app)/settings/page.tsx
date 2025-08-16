export default function Settings() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-2 text-neutral-700">Organization defaults & WhatsApp integration.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded border p-4 shadow-soft">
          <h2 className="font-semibold">Organization</h2>
          <div className="mt-3 grid gap-3">
            <div>
              <label className="block text-sm">Default language</label>
              <select className="mt-1 w-full rounded border px-3 py-2">
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Default dial code</label>
              <input className="mt-1 w-full rounded border px-3 py-2" placeholder="+971" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm">Safety stock (days)</label>
                <input className="mt-1 w-full rounded border px-3 py-2" placeholder="7" />
              </div>
              <div>
                <label className="block text-sm">SLA target (days)</label>
                <input className="mt-1 w-full rounded border px-3 py-2" placeholder="3" />
              </div>
            </div>
            <button className="rounded bg-brand px-3 py-2 text-white">Save</button>
          </div>
        </div>

        <div className="rounded border p-4 shadow-soft">
          <h2 className="font-semibold">WhatsApp channel</h2>
          <div className="mt-3 grid gap-3">
            <input className="w-full rounded border px-3 py-2" placeholder="Phone Number ID" />
            <input className="w-full rounded border px-3 py-2" placeholder="WABA ID" />
            <input className="w-full rounded border px-3 py-2" placeholder="Access token" />
            <button className="rounded border px-3 py-2">Connect</button>
          </div>
        </div>
      </div>
    </section>
  )
}
