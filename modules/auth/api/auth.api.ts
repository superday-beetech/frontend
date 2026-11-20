import { apiGet, apiPost } from '@/core/api/request'
import { env } from '@/core/config/env'
import type { LoginPayload, SessionContext } from '../types'

// Mock hanya ada di DEV. `import.meta.env.DEV` diganti literal `false` saat build produksi, sehingga seluruh
// ekspresi ini dibuang bundler dan auth.mock.ts TIDAK ikut ter-bundle. Jangan ganti dengan `env.useMock`:
// akses properti objek tidak bisa dilipat bundler, mock akan ikut terkirim ke produksi.
const loadMock = import.meta.env.DEV ? () => import('../mocks/auth.mock') : undefined

export const authApi = {
  /** Backend membuat session dan mengirim Set-Cookie (HttpOnly). Tidak ada token yang dikembalikan. */
  async login(payload: LoginPayload): Promise<void> {
    if (env.useMock && loadMock) {
      const { mockLogin } = await loadMock()
      return mockLogin(payload)
    }
    await apiPost('/auth/login', payload)
  },

  async getSessionContext(): Promise<SessionContext> {
    if (env.useMock && loadMock) {
      const { mockSession } = await loadMock()
      return mockSession()
    }
    return apiGet<SessionContext>('/auth/me')
  },

  async logout(): Promise<void> {
    if (env.useMock && loadMock) {
      const { mockLogout } = await loadMock()
      return mockLogout()
    }
    await apiPost('/auth/logout')
  },
}
