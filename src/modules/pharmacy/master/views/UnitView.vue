<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { useToast } from '@/shared/composables/useToast'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useModal } from '@/shared/composables/useModal'

import unitService, { type Unit, type UnitPagination } from '../services/unitService'

import UnitFormModal from '../components/UnitFormModal.vue'
import UnitDetailModal from '../components/UnitDetailModal.vue'

// ── KOMPONEN UI KUSTOM KAMU ──
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseInputClearable from '@/shared/components/ui/form/BaseInputClearable.vue'
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-vue-next'

const toast = useToast()
const { confirm } = useConfirm()
const modalStore = useModal()

const units = ref<Unit[]>([])
const loading = ref(false)

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const pagination = ref<UnitPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
})

let searchTimeout: ReturnType<typeof setTimeout> | undefined

// Opsi untuk BaseSelect (perPage)
const perPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return error?.message || 'Terjadi kesalahan.'
}

async function loadUnits(page = currentPage.value): Promise<void> {
  loading.value = true

  try {
    const response = await unitService.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
    })

    const result = response.data

    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil data satuan.')
    }

    units.value = result.data.items
    pagination.value = result.data.pagination
    currentPage.value = result.data.pagination.current_page
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function openCreateForm(): void {
  modalStore.open({
    title: 'Tambah Satuan',
    component: UnitFormModal,
    props: { unit: null },
    size: 'default',
    // centered: true,
    onSelect: async () => {
      await loadUnits(1)
    },
  })
}

function openEditForm(unit: Unit): void {
  modalStore.open({
    title: 'Ubah Satuan',
    component: UnitFormModal,
    props: { unit },
    size: 'default',
    centered: true,
    onSelect: async () => {
      await loadUnits(currentPage.value)
    },
  })
}

async function openDetail(unit: Unit): Promise<void> {
  try {
    const response = await unitService.getById(unit.id)
    const result = response.data

    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil detail satuan.')
    }

    modalStore.open({
      title: 'Detail Satuan',
      component: UnitDetailModal,
      props: { unit: result.data },
      size: 'default',
      centered: true,
      onSelect: (value) => {
        openEditForm(value as Unit)
      },
    })
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}

async function deleteUnit(unit: Unit): Promise<void> {
  const confirmed = await confirm({
    title: 'Konfirmasi Hapus',
    message: `Hapus satuan "${unit.name}" (${unit.abbreviation})?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger',
  })

  if (!confirmed) return

  try {
    const response = await unitService.delete(unit.id)
    const result = response.data

    if (result.error) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menghapus satuan.')
    }

    toast.success('Satuan berhasil dihapus.')

    const nextPage = units.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value
    await loadUnits(nextPage)
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}

function changePage(page: number): void {
  if (page < 1 || page > pagination.value.total_pages || page === currentPage.value) {
    return
  }
  loadUnits(page)
}

watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadUnits(1)
  }, 350)
})

watch(perPage, () => {
  loadUnits(1)
})

onMounted(() => {
  loadUnits(1)
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Satuan</h1>
        <p class="text-sm text-slate-500">Kelola satuan produk apotek.</p>
      </div>

      <BaseButton variant="primary" @click="openCreateForm">
        <Plus class="w-4 h-4" />
        Tambah Satuan
      </BaseButton>
    </div>

    <!-- Table Card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800">
        <!-- Filter Top Bar -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <!-- Kiri: Tampilkan Data -->
          <div class="flex items-end gap-2 w-full md:w-auto">
            <div class="w-24">
              <BaseSelect v-model.number="perPage" :options="perPageOptions" label="Tampilkan" />
            </div>
            <span class="text-sm text-slate-500 mb-2.5">data</span>
          </div>

          <!-- Kanan: Pencarian -->
          <div class="w-full md:w-80">
            <BaseInputClearable v-model="search" label="Pencarian" placeholder="Cari satuan..." :icon="Search" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="w-full overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead
            class="bg-slate-50 text-xs uppercase font-semibold text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
          >
            <tr>
              <th class="px-4 py-3 w-16 text-center">No.</th>
              <th class="px-4 py-3">Nama Satuan</th>
              <th class="px-4 py-3 w-40">Singkatan</th>
              <th class="px-4 py-3 text-center w-36">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="4" class="px-4 py-8 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-r-transparent"></span>
                  <span>Memuat data...</span>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="units.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500">Data satuan tidak ditemukan.</td>
            </tr>

            <!-- Data Rows -->
            <tr v-for="(unit, index) in units" :key="unit.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-4 py-3 text-center text-slate-500">
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>

              <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                {{ unit.name }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {{ unit.abbreviation }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex justify-center items-center gap-1">
                  <button
                    class="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                    title="Detail"
                    @click="openDetail(unit)"
                  >
                    <Eye class="w-5 h-5" />
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800 transition-colors"
                    title="Ubah"
                    @click="openEditForm(unit)"
                  >
                    <Pencil class="w-5 h-5" />
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-colors"
                    title="Hapus"
                    @click="deleteUnit(unit)"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Section -->
      <div
        v-if="pagination.total_pages > 1"
        class="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div class="text-sm text-slate-500">
          Menampilkan
          <span class="font-medium text-slate-900 dark:text-white">{{ units.length ? (currentPage - 1) * perPage + 1 : 0 }}</span>
          sampai
          <span class="font-medium text-slate-900 dark:text-white">{{ (currentPage - 1) * perPage + units.length }}</span>
          dari
          <span class="font-medium text-slate-900 dark:text-white">{{ pagination.total }}</span>
          data
        </div>

        <div class="inline-flex -space-x-px">
          <BaseButton
            variant="secondary"
            size="sm"
            class="rounded-r-none"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            Sebelumnya
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="sm"
            class="rounded-l-none"
            :disabled="currentPage >= pagination.total_pages"
            @click="changePage(currentPage + 1)"
          >
            Berikutnya
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
