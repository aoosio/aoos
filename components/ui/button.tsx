import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition'
  const styles = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-soft',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
    ghost: 'hover:bg-slate-100 text-slate-700'
  } as const
  return <button className={cn(base, styles[variant], className)} {...props} />
}