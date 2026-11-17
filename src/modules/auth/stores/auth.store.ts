import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getErrorStatus } from '@/core/api/errors'
import { authApi } from '../api/auth.api'
import { can } from '../utils/permissions'
import type { AuthUser, LoginPayload } from '../types'

/**
 * Status login ditentukan oleh session server (cookie HttpOnly).
 * Kebenarannya diperiksa melalui GET /auth/me.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const permissions = ref<string[]>([])
  const isSuperadmin = ref(false)
  const isSessionChecked = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  function hasPermission(permission: string | string[]): boolean {
    return can(permissions.value, permission)
  }

  async function fetchSessionContext() {
    const context = await authApi.getSessionContext()

    user.value = {
      id: context.id,
      username: context.username,
      email: context.email,
      avatar: context.avatar,
      thumb: context.thumb,
      created_at: context.created_at,
      updated_at: context.updated_at,
    }

    permissions.value = context.permissions
    isSuperadmin.value = context.is_superadmin
  }

  /**
   * Memeriksa apakah session server masih aktif.
   * 401 berarti belum login.
   * Error jaringan/server lainnya diteruskan ke pemanggil.
   */
  async function restoreSession() {
    try {
      await fetchSessionContext()
      isSessionChecked.value = true
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        clearSession()
        isSessionChecked.value = true
        return
      }

      throw error
    }
  }

  async function login(payload: LoginPayload) {
    await authApi.login(payload)

    await fetchSessionContext()
    isSessionChecked.value = true
  }

  /**
   * Membersihkan state lokal tanpa memanggil API.
   */
  function clearSession() {
    user.value = null
    permissions.value = []
    isSuperadmin.value = false
    isRoutesLoaded.value = false
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Tetap bersihkan state lokal jika API logout gagal.
    } finally {
      clearSession()
      isSessionChecked.value = true
    }
  }

  return {
    user,
    permissions,
    isSuperadmin,
    isSessionChecked,
    isAuthenticated,
    hasPermission,
    login,
    restoreSession,
    fetchSessionContext,
    clearSession,
    logout,
  }
})
