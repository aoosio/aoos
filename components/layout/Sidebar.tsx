'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

const NAV = [
  { href: '/home', key: 'nav.home' },
  { href: '/suggestions', key: 'nav.suggestions' },
  { href: '/pos', key: 'nav.pos' },
  { href: '/suppliers', key: 'nav.suppliers' },
  { href: '/uploads', key: 'nav.uploads' },
  { href: '/outbox', key: 'nav.outbox' },
  { href: '/templates', key: 'nav.templates' },
  { href: '/audit', key: 'nav.audit' },
  { href: '/settings', key: 'nav.settings' },
  // إذا حبيت ترجع روابط الإدارة لاحقاً، افعلها بشرط الصلاحية
  // { href: '/admin', key: 'Admin' },
  // { href: '/admin/messages', key: 'Platform Inbox' },
  // { href: '/support', key: 'nav.support' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="h-screen w-[240px] overflow-y-auto p-3">
      <div className="mb-4 px-2 text-xs uppercase tracking-wider text-neutral-500">Menu</div>
      <ul className="space-y-1">
        {NAV.map((i) => {
          const active =
            pathname === i.href || (i.href !== '/' && pathname.startsWith(i.href));
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`block rounded px-3 py-2 text-sm ${
                  active
                    ? 'bg-brand/10 text-ink'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {t(i.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
