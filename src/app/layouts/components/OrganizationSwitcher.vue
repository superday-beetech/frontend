<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Check, ChevronDown, LayoutGrid, LoaderCircle } from 'lucide-vue-next'

import { useOrganizationStore } from '@/modules/auth/stores/organization.store'
import { useToast } from '@/shared/composables/useToast'

const router = useRouter()
const organizationStore = useOrganizationStore()
const toast = useToast()

const isOpen = ref(false)

const activeOrganizationId = computed(() => organizationStore.activeOrganization?.id ?? null)

async function switchOrganization(organizationId: number): Promise<void> {
  if (organizationId === activeOrganizationId.value || organizationStore.switching) {
    isOpen.value = false
    return
  }

  try {
    await organizationStore.switchOrganization(organizationId)

    isOpen.value = false

    toast.success('Organisasi aktif berhasil diganti.')

    await router.replace({ name: 'Dashboard' })
  } catch (error) {
    toast.error('Gagal mengganti organisasi', error instanceof Error ? error.message : 'Terjadi kesalahan saat mengganti organisasi.')
  }
}

function openOrganizationSelection(): void {
  isOpen.value = false
  router.push({ name: 'OrganizationSelection' })
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target

  if (target instanceof Element && !target.closest('[data-organization-switcher]')) {
    isOpen.value = false
  }
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div v-if="organizationStore.hasOrganizations" data-organization-switcher class="relative">
    <!-- Trigger -->
    <button
      type="button"
      class="flex max-w-65 items-center gap-2 rounded-full px-2.5 py-1.5 text-left transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-gray-800"
      :disabled="organizationStore.switching"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      aria-label="Ganti organisasi"
      @click="isOpen = !isOpen"
    >
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400"
      >
        <Building2 class="size-5" />
      </span>

      <span class="hidden min-w-0 flex-col text-left xl:flex">
        <span class="max-w-37.5 truncate text-[13px] font-semibold text-gray-800 dark:text-gray-100">
          {{ organizationStore.activeOrganization?.name ?? 'Pilih Organisasi' }}
        </span>

        <span v-if="organizationStore.activeUnit" class="max-w-37.5 truncate text-[11px] text-gray-500 dark:text-gray-400">
          {{ organizationStore.activeUnit.name }}
        </span>
      </span>

      <LoaderCircle v-if="organizationStore.switching" class="size-4 shrink-0 animate-spin text-primary-600" />

      <ChevronDown v-else class="hidden size-4 shrink-0 text-gray-500 transition-transform xl:block" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
      >
        <!-- Header -->
        <div class="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <h6 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Workspace</h6>

          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Pilih ruang kerja aktif</p>
        </div>

        <!-- Organization list -->
        <div class="max-h-72 overflow-y-auto p-2">
          <button
            v-for="organization in organizationStore.availableOrganizations"
            :key="organization.organization_id"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-gray-800"
            :class="{
              'bg-primary-50 hover:bg-primary-50 dark:bg-primary-950 dark:hover:bg-primary-950':
                organization.organization_id === activeOrganizationId,
            }"
            :disabled="organizationStore.switching"
            @click="switchOrganization(organization.organization_id)"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400"
            >
              <Building2 class="size-5" />
            </span>

            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                {{ organization.organization_name }}
              </span>

              <span class="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                {{ organization.membership_role }}
              </span>
            </span>

            <Check v-if="organization.organization_id === activeOrganizationId" class="size-5 shrink-0 text-primary-600" />
          </button>

          <p v-if="organizationStore.availableOrganizations.length === 0" class="px-3 py-5 text-center text-sm text-gray-500">
            Belum ada organisasi tersedia.
          </p>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 p-2 dark:border-gray-800">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            @click="openOrganizationSelection"
          >
            <LayoutGrid class="size-5 text-gray-500" />
            Lihat Semua Workspace
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
