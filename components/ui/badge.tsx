import { cn } from '@/lib/utils'
export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default'|'success'|'warning'|'danger' }) {
  const map = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-700'
  }
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs', map[variant])}>{children}</span>
}