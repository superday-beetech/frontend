import type { Router } from 'vue-router'
import { setUnauthorizedHandler } from '@/core/api/client'
import { useAuthStore } from '@/modules/auth'
import { useToast } from '@/shared/composables/useToast'
import { resetDynamicRoutes } from '../router/dynamic-routes'

/** 401 dari API mana pun → bersihkan sesi lalu arahkan ke login (tanpa reload halaman). */
export function setupHttp(router: Router): void {
  setUnauthorizedHandler(() => {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return
    auth.clearSession()
    resetDynamicRoutes(router)
    const current = router.currentRoute.value
    if (current.name !== 'Login') {
      useToast().warning('Sesi berakhir', 'Silakan masuk kembali.')
      router.replace({ name: 'Login', query: { redirect: current.fullPath } })
    }
  })
}
