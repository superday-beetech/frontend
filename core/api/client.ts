import axios from 'axios'
import { env } from '@/core/config/env'

// Autentikasi web = SESSION COOKIE (HttpOnly, diatur backend). Tidak ada token di JavaScript.
// Token Bearer hanya untuk klien mobile (Flutter) dan tidak dipakai di sini.
//
// CSRF (CodeIgniter 4, CSRFProtection = 'cookie'): CI4 menaruh token di cookie yang bisa dibaca JS;
// axios menyalinnya ke header pada request non-GET. Nama di bawah HARUS sama dengan
// Config\Security::$cookieName dan $headerName di backend.

function readCsrfToken(): string | null {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null
}

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  //   withXSRFToken: true,
  //   xsrfCookieName: 'csrf_cookie_name',
  //   xsrfHeaderName: 'X-CSRF-TOKEN',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Kirim token di setiap request non-GET
http.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (method !== 'get' && method !== 'head' && method !== 'options') {
    const token = readCsrfToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers['X-CSRF-TOKEN'] = token
    }
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
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const isAuthProbe = AUTH_PROBE_PATHS.some((path) => url.includes(path))
      if (!isAuthProbe) unauthorizedHandler?.()
    }
    return Promise.reject(error)
  }
)

export default http
