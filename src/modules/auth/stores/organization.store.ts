import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { organizationApi } from '../api/organization.api'
import type { AvailableOrganization, OrganizationContext } from '../types'

function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function normalizeAvailableOrganization(item: AvailableOrganization): AvailableOrganization {
  return {
    ...item,
    membership_id: Number(item.membership_id),
    organization_id: Number(item.organization_id),
    user_id: Number(item.user_id),
    unit_id: item.unit_id === null ? null : Number(item.unit_id),
    is_default: toBoolean(item.is_default),
  }
}

function normalizeContext(context: OrganizationContext): OrganizationContext {
  return {
    organization: { ...context.organization, id: Number(context.organization.id) },
    unit: context.unit ? { ...context.unit, id: Number(context.unit.id) } : null,
    membership: {
      ...context.membership,
      id: Number(context.membership.id),
      user_id: Number(context.membership.user_id),
      is_default: toBoolean(context.membership.is_default),
    },
  }
}

export const useOrganizationStore = defineStore('organization', () => {
  const availableOrganizations = ref<AvailableOrganization[]>([])
  const activeContext = ref<OrganizationContext | null>(null)
  const loading = ref(false)
  const switching = ref(false)
  const initialized = ref(false)
  const errorMessage = ref<string | null>(null)

  let initializePromise: Promise<void> | null = null
  // Invalidates in-flight requests when the authenticated user/session changes.
  let requestVersion = 0

  const activeOrganization = computed(() => activeContext.value?.organization ?? null)
  const activeUnit = computed(() => activeContext.value?.unit ?? null)
  const activeMembership = computed(() => activeContext.value?.membership ?? null)
  const membershipRole = computed(() => activeMembership.value?.role ?? null)
  const hasContext = computed(() => activeContext.value !== null)
  const hasOrganizations = computed(() => availableOrganizations.value.length > 0)
  const needsOrganizationSelection = computed(() => hasOrganizations.value && !hasContext.value)
  const isOrganizationMember = computed(() => hasContext.value)

  async function fetchAvailableOrganizations(): Promise<void> {
    const version = requestVersion
    const data = await organizationApi.getAvailable()
    if (version !== requestVersion) return
    availableOrganizations.value = Array.isArray(data) ? data.map(normalizeAvailableOrganization) : []
  }

  async function fetchCurrentContext(): Promise<void> {
    const version = requestVersion
    const data = await organizationApi.getCurrentContext()
    if (version !== requestVersion) return
    activeContext.value = data ? normalizeContext(data) : null
  }

  async function switchOrganization(organizationId: number): Promise<OrganizationContext> {
    const id = Number(organizationId)
    if (!Number.isInteger(id) || id <= 0) throw new Error('Organisasi tidak valid.')

    const available = availableOrganizations.value.some((item) => item.organization_id === id)
    if (!available) throw new Error('Organisasi tidak tersedia pada akun Anda.')
    if (switching.value) throw new Error('Pergantian organisasi sedang diproses.')

    const version = requestVersion
    switching.value = true
    errorMessage.value = null

    try {
      const data = await organizationApi.switchOrganization(id)
      if (version !== requestVersion) throw new Error('Sesi telah berubah. Silakan pilih workspace kembali.')
      if (!data?.organization || !data?.membership) throw new Error('Response konteks organisasi tidak valid.')

      activeContext.value = normalizeContext(data)
      return activeContext.value
    } catch (error) {
      if (version === requestVersion) errorMessage.value = getErrorMessage(error)
      throw error
    } finally {
      if (version === requestVersion) switching.value = false
    }
  }

  async function clearContext(): Promise<void> {
    const version = requestVersion
    await organizationApi.clearContext()
    if (version === requestVersion) activeContext.value = null
  }

  async function initialize(force = false): Promise<void> {
    if (initialized.value && !force) return
    if (initializePromise) return initializePromise

    const version = requestVersion
    initializePromise = (async () => {
      loading.value = true
      errorMessage.value = null

      try {
        await fetchAvailableOrganizations()
        if (version !== requestVersion) return

        await fetchCurrentContext()
        if (version !== requestVersion) return

        if (!activeContext.value) {
          const organizations = availableOrganizations.value
          const defaults = organizations.filter((item) => item.is_default)
          const selectedId =
            organizations.length === 1
              ? organizations[0].organization_id
              : defaults.length === 1
                ? defaults[0].organization_id
                : null

          if (selectedId !== null) await switchOrganization(selectedId)
        }

        if (version === requestVersion) initialized.value = true
      } catch (error) {
        if (version === requestVersion) {
          errorMessage.value = getErrorMessage(error)
          initialized.value = false
        }
        throw error
      } finally {
        if (version === requestVersion) {
          loading.value = false
          initializePromise = null
        }
      }
    })()

    return initializePromise
  }

  function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses organisasi.'
  }

  function reset(): void {
    requestVersion += 1
    availableOrganizations.value = []
    activeContext.value = null
    loading.value = false
    switching.value = false
    initialized.value = false
    errorMessage.value = null
    initializePromise = null
  }

  return {
    availableOrganizations,
    activeContext,
    loading,
    switching,
    initialized,
    errorMessage,
    activeOrganization,
    activeUnit,
    activeMembership,
    membershipRole,
    hasContext,
    hasOrganizations,
    needsOrganizationSelection,
    isOrganizationMember,
    fetchAvailableOrganizations,
    fetchCurrentContext,
    switchOrganization,
    clearContext,
    initialize,
    reset,
  }
})
