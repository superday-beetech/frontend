/** UUID v4 (crypto API bila tersedia). */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Kode transaksi/nota sementara di sisi klien, mis. TRX-20261117-8421. Nomor resmi tetap dari backend. */
export function generateCode(prefix = 'TRX', now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${y}${m}${d}-${suffix}`
}

/** SKU/batch contoh, mis. MED-1A2B-9A3X. */
export function generateSKU(prefix = 'PRD'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let random = ''
  for (let i = 0; i < 4; i++) random += chars.charAt(Math.floor(Math.random() * chars.length))
  const stamp = Date.now().toString(36).toUpperCase().slice(-4)
  return `${prefix}-${stamp}-${random}`
}
