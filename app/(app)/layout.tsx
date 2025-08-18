'use client';
import type { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar.client';
import Topbar from '@/components/layout/Topbar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-r bg-white md:block">
          {/* نخلّيها ظاهرة على الدِسكتوب؛ لو تبي موبايل كمان احذف md:block */}
          <Sidebar />
        </aside>

        <div className="flex min-h-screen flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
