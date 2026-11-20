import { computed, onMounted } from 'vue'

import { useOrganizationStore } from '../stores/organization.store'
import { useToast } from '@/shared/composables/useToast'

export function useOrganizationSelection(onSelected?: () => void) {
  const organizationStore = useOrganizationStore()
  const toast = useToast()

  const activeOrganizationId = computed(() => organizationStore.activeOrganization?.id ?? null)

  async function selectOrganization(organizationId: number): Promise<void> {
    if (organizationStore.switching) return

    try {
      await organizationStore.switchOrganization(organizationId)

      toast.success('Organisasi berhasil dipilih.')

      onSelected?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memilih organisasi.')
    }
  }

  async function initialize(force = false): Promise<void> {
    try {
      await organizationStore.initialize(force)
    } catch {
      // Pesan kesalahan dikelola oleh store.
    }
  }

  onMounted(() => {
    if (!organizationStore.initialized) {
      void initialize()
    }
  })

  return {
    organizationStore,
    activeOrganizationId,
    selectOrganization,
    initialize,
  }
}
