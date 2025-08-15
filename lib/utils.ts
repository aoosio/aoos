export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(d?: string | Date | null) {
  if (!d) return '-'
  const dt = typeof d === 'string' ? new Date(d) : d
  return dt.toLocaleDateString()
}