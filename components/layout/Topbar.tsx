'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function Topbar() {
  const { lang, toggleLocale } = useI18n();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    try {
      setBusy(true);
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      setBusy(false);
      window.location.href = '/auth/sign-in';
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-white/80 px-4 py-2 backdrop-blur">
      <Link href="/home" className="font-semibold">
        AOOS
      </Link>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLocale}
          className="rounded border px-2 py-1 text-sm"
          aria-label="Toggle language"
        >
          {lang === 'ar' ? 'العربية' : 'EN'}
        </button>
        <button
          onClick={signOut}
          disabled={busy}
          className="rounded border px-2 py-1 text-sm disabled:opacity-50"
        >
          {busy ? '…' : 'Sign out'}
        </button>
      </div>
    </header>
  );
}
