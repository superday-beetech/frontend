const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const numberFormatter = new Intl.NumberFormat('id-ID')
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

function toNumber(value: number | string | null | undefined): number {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num : 0
}

export function formatIDR(amount: number | string | null | undefined): string {
  return idrFormatter.format(toNumber(amount))
}

export function formatNumber(amount: number | string | null | undefined): string {
  return numberFormatter.format(toNumber(amount))
}

/** Tanggal 'YYYY-MM-DD' diparse sebagai tanggal LOKAL (bukan UTC) agar tidak mundur sehari. */
function parseDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  return new Date(value)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = parseDate(dateStr)
  // Intl.DateTimeFormat melempar RangeError untuk tanggal tidak valid.
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date)
}
