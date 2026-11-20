import type { Router } from 'vue-router'
import { isAxiosError } from 'axios'
import { useAuthStore } from '@/modules/auth'
import { useNavigationStore } from '@/modules/navigation'
import { useOrganizationStore } from '@/modules/auth/stores/organization.store'

import { useToast } from '@/shared/composables/useToast'
import { env } from '@/core/config/env'

import { registerDynamicRoutes, resetDynamicRoutes } from './dynamic-routes'

export function installRouterGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()
    const navigation = useNavigationStore()

    if (to.meta.guestOnly && !auth.isAuthenticated) {
      return true
    }

    // 1. Restore session
    if (!auth.isSessionChecked) {
      try {
        await auth.restoreSession()
      } catch {
        useToast().error('Gagal memuat sesi', 'Periksa koneksi server dan coba kembali.')

        return false
      }
    }

    // 2. Authentication
    if (!auth.isAuthenticated) {
      resetDynamicRoutes(router)
      navigation.clear()

      if (to.meta.guestOnly) return true

      return {
        name: 'Login',
        query: to.fullPath === '/' ? undefined : { redirect: to.fullPath },
      }
    }

    if (to.meta.guestOnly) {
      return { name: 'Dashboard' }
    }
    // 3. Load navigation separately from /auth/me, then register its Vue routes.
    if (!navigation.isLoaded) {
      try {
        await navigation.fetchNavigation()
      } catch {
        useToast().error('Gagal memuat navigasi', 'Periksa endpoint navigasi dan koneksi server.')
        return false
      }
    }

    if (!navigation.isRoutesLoaded) {
      registerDynamicRoutes(router, navigation.sidebar)
      navigation.setRoutesLoaded(true)
      return to.fullPath
    }
    // 4. Permission
    const required = to.meta.permissions

    if (required?.length && !auth.hasPermission(required)) {
      useToast().warning('Akses ditolak', 'Anda tidak memiliki izin untuk membuka halaman tersebut.')

      return { name: 'Dashboard' }
    }

    // 5. Organization context
    const organization = useOrganizationStore()

    const isOrganizationSelection = to.name === 'OrganizationSelection'

    try {
      if (!organization.initialized) {
        await organization.initialize()
      }
    } catch (error) {
      console.error('[Organization Context] Initialization failed:', error)
      if (isAxiosError(error) && error.response?.status === 401) {
        auth.logout() // atau auth.clearSession()
        resetDynamicRoutes(router)
        navigation.clear()

        useToast().error('Sesi Berakhir', 'Silakan login kembali.')
        return { name: 'Login' }
      }
      if (!isOrganizationSelection) {
        return { name: 'OrganizationSelection' }
      }

      return true
    }

    // 6. Require organization context
    if (!organization.hasContext && !isOrganizationSelection && organization.hasOrganizations) {
      return { name: 'OrganizationSelection' }
    }

    return true
  })

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · ${env.appName}` : env.appName
  })
}
