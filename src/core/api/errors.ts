// Helper error murni (tanpa dependensi) — juga kompatibel dengan error mock.
interface ErrorLike {
  response?: {
    status?: number
    data?: { message?: string; errors?: Record<string, string | string[]> }
  }
}

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === 'object' && error !== null ? (error as ErrorLike) : {}
}

export function getErrorStatus(error: unknown): number | undefined {
  return asErrorLike(error).response?.status
}

export function getApiErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  return asErrorLike(error).response?.data?.message || fallback
}

/** Error per-field (422) dengan satu pesan per field; objek kosong jika tidak ada. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const raw = asErrorLike(error).response?.data?.errors
  const result: Record<string, string> = {}
  if (!raw) return result
  for (const [field, value] of Object.entries(raw)) {
    const message = Array.isArray(value) ? value[0] : value
    if (message) result[field] = message
  }
  return result
}

/** Request dibatalkan (AbortController / navigasi) — biasanya diabaikan, bukan error untuk pengguna. */
export function isCancelledError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'ERR_CANCELED'
}
