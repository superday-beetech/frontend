/** Kunci penyimpanan browser terpusat (hindari string literal tersebar & tabrakan nama). */
export const STORAGE_KEYS = {
  // Dibaca juga oleh skrip inline di index.html (cegah flash tema). Ubah keduanya bersamaan.
  theme: 'cakra_theme',
  sidebarMini: 'cakra_sidebar_mini',
  mockSession: 'cakra_mock_session',
} as const

/** localStorage yang aman: tidak melempar saat storage diblokir (mode privat, kebijakan browser). */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* abaikan */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      /* abaikan */
    }
  },
}
