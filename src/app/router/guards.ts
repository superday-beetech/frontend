import type { Router } from 'vue-router'

import { useAuthStore } from '@/modules/auth'
import { useOrganizationStore } from '@/modules/auth/stores/organization.store'

import { useToast } from '@/shared/composables/useToast'
import { env } from '@/core/config/env'

import { registerDynamicRoutes, resetDynamicRoutes } from './dynamic-routes'

export function installRouterGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()

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

      if (to.meta.guestOnly) return true

      return {
        name: 'Login',
        query: to.fullPath === '/' ? undefined : { redirect: to.fullPath },
      }
    }

    if (to.meta.guestOnly) {
      return { name: 'Dashboard' }
    }

    // 3. Register dynamic routes
    if (!auth.isRoutesLoaded) {
      registerDynamicRoutes(router, auth.menus)
      auth.isRoutesLoaded = true

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
