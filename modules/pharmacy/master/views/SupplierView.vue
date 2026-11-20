<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Plus, RotateCcw, Eye, Pencil, Trash2 } from 'lucide-vue-next'
import supplierService, { type Supplier, type SupplierPagination } from '../services/supplierService'

import SupplierFormModal from '../components/SupplierFormModal.vue'
import SupplierDetailModal from '../components/SupplierDetailModal.vue'

// Komponen UI
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import TablePaginationBar from '@/shared/components/ui/data/TablePaginationBar.vue' // ✨ BARU

import { useModal } from '@/shared/composables/useModal'
import { useToast } from '@/shared/composables/useToast'
import { useConfirm } from '@/shared/composables/useConfirm'

const toast = useToast()
const { confirm } = useConfirm()
const modalStore = useModal()

// ── State ──
const suppliers = ref<Supplier[]>([])
const loading = ref(false)
const search = ref('')
const status = ref<string | number>('')
const currentPage = ref(1)
const perPage = ref(10)
const pagination = ref<SupplierPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
})

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Aktif', value: 1 },
  { label: 'Nonaktif', value: 0 },
]

// ── Helper ──
function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

// ── Data Fetching ──
async function loadSuppliers(page = currentPage.value) {
  if (loading.value) return
  loading.value = true

  try {
    const response = await supplierService.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
      is_active: status.value === '' ? undefined : Number(status.value),
    })

    const result = response.data
    if (result.error || !result.data) {
      throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message || 'Gagal mengambil data supplier.')
    }

    suppliers.value = result.data.items
    pagination.value = result.data.pagination
    currentPage.value = result.data.pagination.current_page
  } catch (error: any) {
    toast.error(getErrorMessage(error, 'Gagal mengambil data supplier.'))
  } finally {
    loading.value = false
  }
}

// ── Actions ──
function openCreateForm() {
  modalStore.open({
    title: 'Tambah Supplier',
    component: SupplierFormModal,
    size: 'lg',
    centered: true,
    props: { supplier: null },
    onSelect: () => loadSuppliers(1),
  })
}

function openEditForm(supplier: Supplier) {
  modalStore.open({
    title: 'Edit Supplier',
    component: SupplierFormModal,
    size: 'lg',
    centered: true,
    props: { supplier },
    onSelect: () => loadSuppliers(),
  })
}

function openDetail(supplier: Supplier) {
  modalStore.open({
    title: 'Detail Supplier',
    component: SupplierDetailModal,
    size: 'lg',
    centered: true,
    props: { supplier },
    onSelect: (value) => openEditForm(value as Supplier),
  })
}

async function deleteSupplier(supplier: Supplier) {
  const confirmed = await confirm({
    title: 'Konfirmasi Hapus',
    message: `Hapus supplier "${supplier.name}"?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    const response = await supplierService.delete(supplier.id)
    if (response.data.error) {
      throw new Error(
        Array.isArray(response.data.message) ? response.data.message.join(', ') : response.data.message || 'Gagal menghapus supplier.'
      )
    }
    toast.success('Supplier berhasil dihapus.')
    const nextPage = suppliers.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value
    await loadSuppliers(nextPage)
  } catch (error: any) {
    toast.error(getErrorMessage(error, 'Gagal menghapus supplier.'))
  }
}

function resetFilters() {
  search.value = ''
  status.value = ''
}

// ── Watchers ──
let searchTimeout: ReturnType<typeof setTimeout> | undefined
watch([search, status], () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadSuppliers(1), 350)
})

watch(perPage, () => loadSuppliers(1))

onMounted(() => loadSuppliers(1))
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Supplier</h1>
        <p class="text-sm text-slate-500">Pengelolaan data pemasok barang dan produk.</p>
      </div>
      <BaseButton @click="openCreateForm">
        <Plus class="w-4 h-4" />
        Tambah Supplier
      </BaseButton>
    </div>

    <!-- Main Card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <!-- Filter Section -->
      <div class="p-5 border-b border-slate-100 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div class="md:col-span-6">
            <BaseInput v-model="search" type="search" label="Pencarian" placeholder="Cari kode, nama, telepon, atau email..." />
          </div>
          <div class="md:col-span-3">
            <BaseSelect v-model="status" :options="statusOptions" label="Status" placeholder="Pilih Status" />
          </div>
          <div class="md:col-span-3">
            <BaseButton variant="secondary" class="w-full" @click="resetFilters">
              <RotateCcw class="w-4 h-4" />
              Reset Filter
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="w-full overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead
            class="bg-slate-50 text-xs uppercase font-semibold text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
          >
            <tr>
              <th class="px-4 py-3 w-12 text-center">No.</th>
              <th class="px-4 py-3 w-32">Kode</th>
              <th class="px-4 py-3">Nama Supplier</th>
              <th class="px-4 py-3">Telepon</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-8 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-r-transparent"></span>
                  <span>Memuat data supplier...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="suppliers.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-slate-500">Belum ada data supplier.</td>
            </tr>
            <tr
              v-for="(supplier, index) in suppliers"
              v-else
              :key="supplier.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-4 py-3 text-center text-slate-500">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td class="px-4 py-3">
                <span class="font-semibold text-slate-900 dark:text-white">{{ supplier.code }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900 dark:text-white">{{ supplier.name }}</div>
                <div class="text-xs text-slate-500 mt-0.5">{{ supplier.address || '-' }}</div>
              </td>
              <td class="px-4 py-3">{{ supplier.phone || '-' }}</td>
              <td class="px-4 py-3">{{ supplier.email || '-' }}</td>
              <td class="px-4 py-3">
                <BaseBadge :variant="Number(supplier.is_active) === 1 ? 'success' : 'neutral'">
                  {{ Number(supplier.is_active) === 1 ? 'Aktif' : 'Nonaktif' }}
                </BaseBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center items-center gap-1">
                  <BaseButton variant="ghost" size="sm" title="Detail" @click="openDetail(supplier)">
                    <Eye class="w-4 h-4 text-slate-500 hover:text-blue-600" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" title="Edit" @click="openEditForm(supplier)">
                    <Pencil class="w-4 h-4 text-slate-500 hover:text-amber-600" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" title="Hapus" @click="deleteSupplier(supplier)">
                    <Trash2 class="w-4 h-4 text-slate-500 hover:text-rose-600" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ✨ PAGINATION BAR (Sekarang hanya satu baris!) ✨ -->
      <TablePaginationBar
        :current-page="currentPage"
        :total-pages="pagination.total_pages"
        :total-items="pagination.total"
        :per-page="perPage"
        :loading="loading"
        item-label="supplier"
        @update:page="loadSuppliers($event)"
        @update:per-page="perPage = $event"
      />
    </div>
  </div>
</template>
