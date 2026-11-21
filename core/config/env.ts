/**
 * Satu-satunya pintu masuk ke `import.meta.env`.
 * Kode lain WAJIB memakai `env` dari sini (bukan membaca import.meta.env langsung)
 * agar nilai default, tipe, dan aturan keamanan (mis. mock hanya di DEV) terpusat.
 */
export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Cakra Enterprise',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  /** Mock API hanya berlaku di `npm run dev`; pada build produksi selalu false (mock tidak ikut ter-bundle). */
  useMock: import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true',
} as const
