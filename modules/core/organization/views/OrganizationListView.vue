<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Building2, Plus, Search, RefreshCw, Pencil, Archive } from 'lucide-vue-next'

import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'

import { useModal } from '@/shared/composables/useModal'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useToast } from '@/shared/composables/useToast'

import OrganizationForm from '../components/OrganizationForm.vue'
import { useOrganizationManagementStore } from '../stores/organization.store'

import type { Organization, OrganizationCreatePayload, OrganizationUpdatePayload } from '../types/organization.types'
import BasePagination from '@/shared/components/ui/data/BasePagination.vue'
const store = useOrganizationManagementStore()

const { open, close } = useModal()
const { confirm } = useConfirm()
const toast = useToast()

const search = ref('')
const page = ref(1)
const perPage = ref(10)

const totalPages = computed(() => Math.max(1, store.pagination.last_page || 1))

let searchTimer: ReturnType<typeof setTimeout> | undefined

function errorText(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        message?: string | string[]
        errors?: Record<string, string>
      }
    }
    message?: string
  }

  const message = err.response?.data?.message

  if (Array.isArray(message)) return message.join(', ')
  if (message) return message

  const errors = err.response?.data?.errors
  if (errors) return Object.values(errors).join(', ')

  return err.message || 'Terjadi kesalahan.'
}

async function loadData(targetPage = page.value): Promise<void> {
  try {
    await store.fetchList({
      page: targetPage,
      per_page: perPage.value,
      q: search.value.trim() || undefined,
    })

    page.value = store.pagination.current_page
  } catch (error) {
    toast.error('Gagal memuat organisasi', errorText(error))
  }
}

function openCreate(): void {
  open({
    title: 'Tambah Organisasi',
    component: OrganizationForm,
    size: 'lg',
    props: {
      mode: 'create',
    },
    onSelect: async (value?: unknown) => {
      if (!value) return

      try {
        await store.create(value as OrganizationCreatePayload)

        toast.success('Organisasi berhasil dibuat', 'Organisasi baru sudah tersimpan.')

        close()
        await loadData(1)
      } catch (error) {
        toast.error('Gagal membuat organisasi', errorText(error))
      }
    },
  })
}

function openEdit(item: Organization): void {
  open({
    title: 'Edit Organisasi',
    component: OrganizationForm,
    size: 'lg',
    props: {
      mode: 'edit',
      initialValue: {
        name: item.name,
        legal_name: item.legal_name ?? '',
        organization_type: item.organization_type,
        timezone: item.timezone,
        currency: item.currency ?? 'IDR',
      },
    },
    onSelect: async (value?: unknown) => {
      if (!value) return

      try {
        const payload = value as OrganizationUpdatePayload

        await store.update(item.id, payload)

        toast.success('Organisasi berhasil diperbarui', 'Perubahan data organisasi sudah tersimpan.')

        close()
        await loadData(page.value)
      } catch (error) {
        toast.error('Gagal memperbarui organisasi', errorText(error))
      }
    },
  })
}

async function archiveOrganization(item: Organization): Promise<void> {
  const approved = await confirm({
    title: 'Arsipkan Organisasi',
    message: `Yakin ingin mengarsipkan organisasi "${item.name}"? Organisasi tidak akan dihapus secara permanen.`,
    confirmText: 'Ya, Arsipkan',
    cancelText: 'Batal',
    variant: 'danger',
  })

  if (!approved) return

  try {
    await store.archive(item.id)

    toast.success('Organisasi berhasil diarsipkan', `${item.name} sudah diarsipkan.`)

    const nextPage = store.items.length === 0 && page.value > 1 ? page.value - 1 : page.value

    await loadData(nextPage)
  } catch (error) {
    toast.error('Gagal mengarsipkan organisasi', errorText(error))
  }
}

function handlePageChange(nextPage: number): void {
  if (nextPage === page.value || store.loading) return
  void loadData(nextPage)
}

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    page.value = 1
    void loadData(1)
  }, 350)
})

watch(perPage, () => {
  page.value = 1
  void loadData(1)
})

onMounted(() => {
  void loadData(1)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      title="Manajemen Organisasi"
      subtitle="Kelola organisasi yang terdaftar dan dapat diakses oleh akun Anda."
      :breadcrumbs="[{ label: 'Core' }, { label: 'Organisasi' }]"
    >
      <template #actions>
        <BaseButton variant="secondary" :loading="store.loading" @click="loadData()">
          <RefreshCw class="h-4 w-4" />
          Refresh
        </BaseButton>

        <BaseButton @click="openCreate">
          <Plus class="h-4 w-4" />
          Tambah Organisasi
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Search -->
    <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            v-model="search"
            type="search"
            placeholder="Cari kode, nama, atau slug organisasi..."
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <select
          v-model.number="perPage"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option :value="10">10 data</option>
          <option :value="20">20 data</option>
          <option :value="50">50 data</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3">Organisasi</th>
              <th class="px-5 py-3">Kode</th>
              <th class="px-5 py-3">Tipe</th>
              <th class="px-5 py-3">Peran Anda</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="store.loading">
              <td colspan="6" class="px-5 py-12 text-center text-slate-500">Memuat data organisasi...</td>
            </tr>

            <tr v-else-if="store.items.length === 0">
              <td colspan="6" class="px-5 py-12 text-center">
                <Building2 class="mx-auto mb-3 h-9 w-9 text-slate-300" />
                <p class="font-medium text-slate-700 dark:text-slate-200">Belum ada organisasi</p>
                <p class="mt-1 text-xs text-slate-500">Tambahkan organisasi untuk mulai mengelola ekosistem usaha.</p>
              </td>
            </tr>

            <tr v-for="item in store.items" v-else :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td class="px-5 py-4">
                <div class="font-semibold text-slate-800 dark:text-white">
                  {{ item.name }}
                </div>

                <div class="mt-1 text-xs text-slate-500">
                  {{ item.legal_name || item.slug }}
                </div>
              </td>

              <td class="px-5 py-4 font-mono text-xs">
                {{ item.code }}
              </td>

              <td class="px-5 py-4">
                {{ item.organization_type }}
              </td>

              <td class="px-5 py-4 capitalize">
                {{ item.membership_role || '-' }}
                <span v-if="item.is_default === true || item.is_default === 1" class="ml-1 text-xs text-primary-600">(Default)</span>
              </td>

              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    item.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  "
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    title="Edit organisasi"
                    class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
                    @click="openEdit(item)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    title="Arsipkan organisasi"
                    class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                    @click="archiveOrganization(item)"
                  >
                    <Archive class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
      >
        <span class="text-xs text-slate-500">Total {{ store.pagination.total }} organisasi</span>

        <BasePagination
          :current-page="page"
          :total-pages="totalPages"
          :loading="store.loading"
          :show-edges="true"
          :show-prev-next-text="false"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
