export default function Uploads() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Uploads</h1>
      <p className="mt-2 text-neutral-700">Import sales and inventory data (CSV).</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded border p-4 shadow-soft">
          <h2 className="font-semibold">Sales CSV</h2>
          <p className="mt-1 text-sm text-neutral-600">Expected columns: product, sold_qty, date</p>
          <div className="mt-3 space-y-2">
            <select className="w-full rounded border px-3 py-2">
              <option>Store: Main</option>
            </select>
            <input type="file" className="w-full rounded border px-3 py-2" />
            <button className="rounded bg-brand px-3 py-2 text-white">Upload</button>
          </div>
        </div>

        <div className="rounded border p-4 shadow-soft">
          <h2 className="font-semibold">Inventory CSV</h2>
          <p className="mt-1 text-sm text-neutral-600">Expected columns: product, qty, expiry_date, distributor, distributor_phone</p>
          <div className="mt-3 space-y-2">
            <select className="w-full rounded border px-3 py-2">
              <option>Store: Main</option>
            </select>
            <input type="file" className="w-full rounded border px-3 py-2" />
            <button className="rounded bg-brand px-3 py-2 text-white">Upload</button>
          </div>
        </div>
      </div>
    </section>
  )
}
