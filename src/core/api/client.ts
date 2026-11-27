import axios from 'axios'
import { env } from '@/core/config/env'

// Autentikasi web = SESSION COOKIE (HttpOnly, diatur backend). Tidak ada token di JavaScript.
// Token Bearer hanya untuk klien mobile (Flutter) dan tidak dipakai di sini.
//
// Backend memakai CSRFProtection = 'session', bukan cookie.
// Token diterima dari response header X-CSRF-TOKEN dan disimpan di memori,
// lalu dikirim kembali pada request yang mengubah state.
let csrfToken: string | null = null

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function rememberCsrfToken(headers: unknown): void {
  const value = headers && typeof headers === 'object'
    ? (headers as Record<string, unknown>)['x-csrf-token']
    : undefined

  if (typeof value === 'string' && value.trim() !== '') {
    csrfToken = value
  }
}

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

http.interceptors.request.use((config) => {
  const method = (config.method ?? 'GET').toUpperCase()

  if (!SAFE_METHODS.has(method) && csrfToken) {
    config.headers.set('X-CSRF-TOKEN', csrfToken)
  }

  return config
})

// --- Penanganan 401 tanpa full page reload ---------------------------------
// Handler didaftarkan dari lapisan app (app/plugins/http.ts) supaya core tidak bergantung ke router/store.
type UnauthorizedHandler = () => void
let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

// 401 pada endpoint login = kredensial salah; pada /auth/me = belum login. Keduanya bukan sesi kedaluwarsa.
const AUTH_PROBE_PATHS = ['/auth/login', '/auth/me']

http.interceptors.response.use(
  (response) => {
    rememberCsrfToken(response.headers)
    return response
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      rememberCsrfToken(error.response?.headers)

      if (error.response?.status === 401) {
        const url = error.config?.url ?? ''
        const isAuthProbe = AUTH_PROBE_PATHS.some((path) => url.includes(path))
        if (!isAuthProbe) unauthorizedHandler?.()
      }
    }

    return Promise.reject(error)
  }
)

export default http
