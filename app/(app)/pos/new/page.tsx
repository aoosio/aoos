export default function NewPO() {
  return (
    <section>
      <h1 className="text-xl font-semibold">New Purchase Order</h1>
      <p className="mt-2 text-neutral-700">Fill details and create a PO.</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="block text-sm">Supplier</label>
          <input className="mt-1 w-full rounded border px-3 py-2" placeholder="Supplier name" />
        </div>
        <div>
          <label className="block text-sm">Promised date</label>
          <input type="date" className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div className="rounded border p-4">
          <div className="mb-2 font-semibold">Items</div>
          <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
            <input className="rounded border px-3 py-2" placeholder="Product" />
            <input className="rounded border px-3 py-2" placeholder="Qty" />
          </div>
          <button type="button" className="mt-3 rounded border px-3 py-1">Add item</button>
        </div>
        <button className="rounded bg-brand px-4 py-2 text-white">Create PO</button>
      </form>
    </section>
  )
}
