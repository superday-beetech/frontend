<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Plus, Search, Eye, Pencil, Trash2, RotateCcw } from 'lucide-vue-next'

import customerService, { type Customer, type CustomerPagination } from '../services/customerService'
import CustomerFormModal from '../components/CustomerFormModal.vue'
import CustomerDetailModal from '../components/CustomerDetailModal.vue'

// Komponen UI
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseInputClearable from '@/shared/components/ui/form/BaseInputClearable.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue' // ✨ Baru
import TablePaginationBar from '@/shared/components/ui/data/TablePaginationBar.vue' // ✨ Baru

import { useModal } from '@/shared/composables/useModal'
import { useToast } from '@/shared/composables/useToast'
import { useConfirm } from '@/shared/composables/useConfirm'

const toast = useToast()
const { confirm } = useConfirm()
const modalStore = useModal()

// ── State ──
const customers = ref<Customer[]>([])
const loading = ref(false)

const search = ref('')
const status = ref<string | number>('')
const customerType = ref('')

const currentPage = ref(1)
const perPage = ref(10)

const pagination = ref<CustomerPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
})

// ── Opsi Filter ──
const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Aktif', value: 1 },
  { label: 'Nonaktif', value: 0 },
]

// ── Helper ──
let searchTimeout: ReturnType<typeof setTimeout> | undefined

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || error?.message || fallback
}

// ── Data Fetching ──
async function loadCustomers(page = currentPage.value) {
  if (loading.value) return
  loading.value = true

  try {
    const response = await customerService.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
      customer_type: customerType.value || undefined,
      is_active: status.value === '' ? undefined : Number(status.value),
    })

    const result = response.data
    if (result.error || !result.data) {
      throw new Error(Array.isArray(result.message) ? result.message.join(', ') : result.message || 'Gagal mengambil data customer.')
    }

    customers.value = result.data.items
    pagination.value = result.data.pagination
    currentPage.value = result.data.pagination.current_page
  } catch (error: any) {
    toast.error(getErrorMessage(error, 'Gagal mengambil data customer.'))
  } finally {
    loading.value = false
  }
}

// ── Actions ──
function openCreateForm() {
  modalStore.open({
    title: 'Tambah Customer',
    component: CustomerFormModal,
    size: 'lg',
    centered: true,
    props: { customer: null },
    onSelect: () => loadCustomers(1),
  })
}

function openEditForm(customer: Customer) {
  modalStore.open({
    title: 'Edit Customer',
    component: CustomerFormModal,
    size: 'lg',
    centered: true,
    props: { customer },
    onSelect: () => loadCustomers(),
  })
}

function openDetail(customer: Customer) {
  modalStore.open({
    title: 'Detail Customer',
    component: CustomerDetailModal,
    size: 'lg',
    centered: true,
    props: { customer },
    onSelect: (value) => {
      modalStore.close()
      openEditForm(value as Customer)
    },
  })
}

async function deleteCustomer(customer: Customer) {
  const confirmed = await confirm({
    title: 'Konfirmasi Hapus',
    message: `Hapus customer "${customer.name}"?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    const response = await customerService.delete(customer.id)
    if (response.data.error) {
      throw new Error(
        Array.isArray(response.data.message) ? response.data.message.join(', ') : response.data.message || 'Gagal menghapus customer.'
      )
    }
    toast.success('Customer berhasil dihapus.')
    const nextPage = customers.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value
    await loadCustomers(nextPage)
  } catch (error: any) {
    toast.error(getErrorMessage(error, 'Gagal menghapus customer.'))
  }
}

function resetFilters() {
  search.value = ''
  status.value = ''
  customerType.value = ''
}

// ── Watchers ──
watch([search, status, customerType], () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadCustomers(1), 350)
})

watch(perPage, () => loadCustomers(1))

onMounted(() => loadCustomers(1))
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Customer</h1>
        <p class="text-sm text-slate-500">Pengelolaan data pelanggan dan penerima distribusi.</p>
      </div>

      <BaseButton variant="primary" @click="openCreateForm">
        <Plus class="w-4 h-4" />
        Tambah Customer
      </BaseButton>
    </div>

    <!-- Main Table Card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <!-- Filters -->
      <div class="p-5 border-b border-slate-100 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <!-- Pencarian -->
          <div class="md:col-span-5">
            <BaseInputClearable v-model="search" label="Pencarian" placeholder="Cari kode, nama, telepon, atau email..." :icon="Search" />
          </div>

          <!-- Jenis Customer -->
          <div class="md:col-span-3">
            <BaseInput v-model="customerType" label="Jenis Customer" placeholder="Contoh: retail" />
          </div>

          <!-- Status -->
          <div class="md:col-span-2">
            <BaseSelect v-model="status" :options="statusOptions" label="Status" />
          </div>

          <!-- Reset Button -->
          <div class="md:col-span-2">
            <BaseButton variant="secondary" class="w-full" @click="resetFilters">
              <RotateCcw class="w-4 h-4" />
              Reset
            </BaseButton>
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
              <th class="px-4 py-3 w-12 text-center">No.</th>
              <th class="px-4 py-3 w-32">Kode</th>
              <th class="px-4 py-3">Nama Customer</th>
              <th class="px-4 py-3">Jenis</th>
              <th class="px-4 py-3">Telepon</th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-center w-36">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-8 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-r-transparent"></span>
                  <span>Memuat data customer...</span>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="customers.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-slate-500">Belum ada data customer.</td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="(customer, index) in customers"
              v-else
              :key="customer.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-4 py-3 text-center text-slate-500">
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>

              <td class="px-4 py-3">
                <span class="font-semibold text-slate-900 dark:text-white">{{ customer.code }}</span>
              </td>

              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900 dark:text-white">{{ customer.name }}</div>
                <div class="text-xs text-slate-500 mt-0.5">{{ customer.address || '-' }}</div>
              </td>

              <td class="px-4 py-3">{{ customer.customer_type || '-' }}</td>
              <td class="px-4 py-3">{{ customer.phone || '-' }}</td>
              <td class="px-4 py-3">{{ customer.email || '-' }}</td>

              <!-- Status (BaseBadge) -->
              <td class="px-4 py-3">
                <BaseBadge :variant="Number(customer.is_active) === 1 ? 'success' : 'neutral'">
                  {{ Number(customer.is_active) === 1 ? 'Aktif' : 'Nonaktif' }}
                </BaseBadge>
              </td>

              <!-- Aksi (BaseButton) -->
              <td class="px-4 py-3">
                <div class="flex justify-center items-center gap-1">
                  <BaseButton variant="ghost" size="sm" title="Detail" @click="openDetail(customer)">
                    <Eye class="w-4 h-4 text-slate-500 hover:text-blue-600" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" title="Edit" @click="openEditForm(customer)">
                    <Pencil class="w-4 h-4 text-slate-500 hover:text-amber-600" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" title="Hapus" @click="deleteCustomer(customer)">
                    <Trash2 class="w-4 h-4 text-slate-500 hover:text-rose-600" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ✨ PAGINATION BAR ✨ -->
      <TablePaginationBar
        :current-page="currentPage"
        :total-pages="pagination.total_pages"
        :total-items="pagination.total"
        :per-page="perPage"
        :loading="loading"
        item-label="customer"
        @update:page="loadCustomers($event)"
        @update:per-page="perPage = $event"
      />
    </div>
  </div>
</template>
