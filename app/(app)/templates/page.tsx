export default function Templates() {
  return (
    <section>
      <h1 className="text-xl font-semibold">Templates</h1>
      <p className="mt-2 text-neutral-700">Edit organization templates (GLOBAL are read‑only).</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Key</div>
          <div className="font-medium">—</div>
          <div className="mt-2 text-sm text-neutral-500">Language</div>
          <div>—</div>
          <textarea className="mt-3 h-28 w-full rounded border p-2" placeholder="Body…"></textarea>
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-brand px-3 py-1.5 text-white">Save</button>
            <button className="rounded border px-3 py-1.5">Revert</button>
          </div>
        </div>

        <div className="rounded border p-4 shadow-soft">
          <div className="text-sm text-neutral-500">Key</div>
          <div className="font-medium">—</div>
          <div className="mt-2 text-sm text-neutral-500">Language</div>
          <div>—</div>
          <textarea className="mt-3 h-28 w-full rounded border p-2" placeholder="Body…"></textarea>
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-brand px-3 py-1.5 text-white">Save</button>
            <button className="rounded border px-3 py-1.5">Revert</button>
          </div>
        </div>
      </div>
    </section>
  )
}
