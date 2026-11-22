<script setup lang="ts">
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

import { http as api } from '@/core/api/client'
import { useToast } from '@/shared/composables/useToast'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useModal } from '@/shared/composables/useModal'

import purchaseOrderService from '../services/purchaseOrderService'

import PurchaseOrderFormModal from '../components/PurchaseOrderFormModal.vue'
import PurchaseOrderDetailModal from '../components/PurchaseOrderDetailModal.vue'

import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'
import type { OptionItem } from '@/shared/composables/useOption'

import type { CreatePurchaseOrderPayload, PurchaseOrder, PurchaseOrderPagination } from '../types/purchaseOrder'

const toast = useToast()
const { confirm } = useConfirm()

interface SupplierOption {
  id: number
  name: string
  code?: string
}

interface ProductOption {
  id: number
  name: string
  sku?: string
  purchase_price?: number | string
}

const modalStore = useModal()

const orders = ref<PurchaseOrder[]>([])
const suppliers = ref<SupplierOption[]>([])
const products = ref<ProductOption[]>([])

const loading = ref(false)
const saving = ref(false)

const filters = reactive({
  search: '',
  status: '',
  supplier_id: '',
})

const pagination = ref<PurchaseOrderPagination>({
  page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
})

function extractList<T>(response: any): T[] {
  const data = response?.data?.data ?? response?.data ?? response

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data

  return []
}

const supplierFilterOptions = computed<OptionItem[]>(() => [
  {
    value: '',
    label: 'Semua Supplier',
  },
  ...suppliers.value.map((supplier) => ({
    value: String(supplier.id),
    label: supplier.name,
    description: supplier.code ?? undefined,
    keywords: supplier.code ?? '',
  })),
])

const statusFilterOptions: OptionItem[] = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'partial', label: 'Partially Received' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
]
const getErrorMessage = (message: string | string[]): string => (Array.isArray(message) ? message.join(', ') : message)
async function loadMasterOptions() {
  try {
    const [supplierResponse, productResponse] = await Promise.all([
      api.get('/pharmacy/supplier-api'),
      api.get('/pharmacy/product-api', {
        params: { per_page: 100 },
      }),
    ])

    suppliers.value = extractList<SupplierOption>(supplierResponse)
    products.value = extractList<ProductOption>(productResponse)
  } catch (error) {
    console.error('Gagal memuat supplier dan produk:', error)
    toast.error('Gagal memuat pilihan supplier dan produk.')
  }
}

async function loadOrders(page = 1) {
  loading.value = true

  try {
    const response = await purchaseOrderService.getAll({
      search: filters.search.trim() || undefined,
      status: filters.status || undefined,
      supplier_id: filters.supplier_id ? Number(filters.supplier_id) : undefined,
      page,
      per_page: pagination.value.per_page,
    })

    if (response.error) {
      throw new Error(getErrorMessage(response.message))
    }

    if (!response.data) {
      throw new Error(getErrorMessage(response.message))
    }

    orders.value = response.data.items ?? []
    pagination.value = response.data.pagination
  } catch (error: any) {
    console.error(error)
    toast.error(error?.message || 'Gagal mengambil data Purchase Order.')
  } finally {
    loading.value = false
  }
}

function searchOrders() {
  loadOrders(1)
}

function resetFilters() {
  filters.search = ''
  filters.status = ''
  filters.supplier_id = ''

  loadOrders(1)
}

function openCreateModal() {
  modalStore.open({
    title: 'Buat Purchase Order',
    component: PurchaseOrderFormModal,
    size: 'xl',
    centered: true,
    props: {
      suppliers: suppliers.value,
      products: products.value,
    },
    onSelect: async (value: unknown) => {
      const payload = value as CreatePurchaseOrderPayload
      await createOrder(payload)
    },
  })
}

async function createOrder(payload: CreatePurchaseOrderPayload) {
  if (saving.value) return

  saving.value = true

  try {
    const response = await purchaseOrderService.create(payload)

    if (response.error) {
      throw new Error(getErrorMessage(response.message))
    }

    modalStore.close()
    toast.success('Purchase Order berhasil dibuat.')

    await loadOrders(1)
  } catch (error: any) {
    console.error(error)
    toast.error(error?.response?.data?.message || error?.message || 'Gagal membuat Purchase Order.')
  } finally {
    saving.value = false
  }
}

async function openDetail(order: PurchaseOrder) {
  try {
    const response = await purchaseOrderService.getById(order.id)

    if (response.error) {
      throw new Error(getErrorMessage(response.message))
    }

    modalStore.open({
      title: `Detail Purchase Order - ${order.order_number}`,
      component: PurchaseOrderDetailModal,
      size: 'xl',
      centered: true,
      props: {
        order: response.data,
      },
    })
  } catch (error: any) {
    console.error(error)
    toast.error(error?.message || 'Gagal mengambil detail Purchase Order.')
  }
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function formatDate(value?: string | null) {
  if (!value) return '-'

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    draft: 'bg-light-secondary text-secondary',
    approved: 'bg-light-info text-info',
    ordered: 'bg-light-primary text-primary',
    partial: 'bg-light-warning text-warning',
    received: 'bg-light-success text-success',
    cancelled: 'bg-light-danger text-danger',
  }

  return classes[status] ?? 'bg-light-secondary text-secondary'
}

async function openEditModal(order: PurchaseOrder) {
  if (order.status !== 'draft') {
    toast.warning('Hanya PO draft yang dapat diedit.')
    return
  }

  try {
    const response = await purchaseOrderService.getById(order.id)

    if (response.error) {
      throw new Error(getErrorMessage(response.message))
    }

    modalStore.open({
      title: `Edit Purchase Order - ${order.order_number}`,
      component: PurchaseOrderFormModal,
      size: 'xl',
      centered: true,
      props: {
        suppliers: suppliers.value,
        products: products.value,
        order: response.data,
      },
      onSelect: async (value: unknown) => {
        await updateOrder(order.id, value as CreatePurchaseOrderPayload)
      },
    })
  } catch (error: any) {
    toast.error(error?.message || 'Gagal mengambil data Purchase Order.')
  }
}

async function updateOrder(id: number, payload: CreatePurchaseOrderPayload) {
  try {
    const response = await purchaseOrderService.update(id, payload)

    if (response.error) {
      throw new Error(getErrorMessage(response.message))
    }

    modalStore.close()
    toast.success('Purchase Order berhasil diperbarui.')

    await loadOrders(pagination.value.page)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Gagal memperbarui Purchase Order.')
  }
}

async function deleteOrder(order: PurchaseOrder) {
  if (order.status !== 'draft') {
    toast.warning('Hanya PO draft yang dapat dihapus.')
    return
  }

  const confirmed = await confirm({
    title: 'Konfirmasi Hapus',
    message: `Hapus Purchase Order ${order.order_number}? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Hapus',
    variant: 'danger',
  })

  if (!confirmed) return

  try {
    const response = await purchaseOrderService.delete(order.id)

    if (response.error) {
      throw new Error(getErrorMessage(response.message))
    }

    toast.success('Purchase Order berhasil dihapus.')

    const currentPage = orders.value.length === 1 && pagination.value.page > 1 ? pagination.value.page - 1 : pagination.value.page

    await loadOrders(currentPage)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Gagal menghapus Purchase Order.')
  }
}

onMounted(async () => {
  await Promise.all([loadMasterOptions(), loadOrders()])
})
</script>
<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center mb-4 gap-3">
      <div>
        <h4 class="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">Purchase Order</h4>
        <p class="text-slate-500 mb-0">Pengelolaan pesanan pembelian kepada supplier.</p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700"
        :disabled="loading"
        @click="openCreateModal"
      >
        <Plus class="h-4 w-4" />
        Buat Purchase Order
      </button>
    </div>

    <!-- Filters -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 gap-3 items-end">
          <div class="col-span-12 lg:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pencarian</label>
            <input
              v-model="filters.search"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Nomor PO atau nama supplier"
              @keyup.enter="searchOrders"
            />
          </div>

          <div class="col-span-12 lg:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Supplier</label>
            <OptionSelect
              v-model="filters.supplier_id"
              :options="supplierFilterOptions"
              placeholder="Semua Supplier"
              search-placeholder="Cari supplier..."
              empty-text="Supplier tidak ditemukan"
            />
          </div>

          <div class="col-span-12 lg:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <OptionSelect
              v-model="filters.status"
              :options="statusFilterOptions"
              placeholder="Semua Status"
              search-placeholder="Cari status..."
              empty-text="Status tidak ditemukan"
            />
          </div>

          <div class="col-span-12 lg:col-span-2 flex gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 flex-1"
              @click="searchOrders"
            >
              <Search class="h-4 w-4" />
              Cari
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200"
              @click="resetFilters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-4">
      <div class="p-5">
        <div class="flex justify-between items-center mb-3">
          <h5 class="text-base font-semibold mb-0">Daftar Purchase Order</h5>
          <span class="text-xs text-slate-500">Total {{ pagination.total }} data</span>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm align-middle">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nomor PO
                </th>
                <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Supplier
                </th>
                <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tanggal Order
                </th>
                <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estimasi
                </th>
                <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                <th class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</th>
                <th class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Aksi</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5 text-slate-500">
                  <div class="inline-flex items-center gap-2">
                    <div
                      class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"
                    ></div>
                    Memuat data...
                  </div>
                </td>
              </tr>

              <tr v-else-if="orders.length === 0">
                <td colspan="7" class="text-center text-slate-500 py-5">Belum ada Purchase Order.</td>
              </tr>

              <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-3 py-3">
                  <span class="font-semibold text-slate-800 dark:text-slate-100">{{ order.order_number }}</span>
                </td>
                <td class="px-3 py-3 text-slate-600 dark:text-slate-300">{{ order.supplier_name || '-' }}</td>
                <td class="px-3 py-3 text-slate-600 dark:text-slate-300">{{ formatDate(order.order_date) }}</td>
                <td class="px-3 py-3 text-slate-600 dark:text-slate-300">{{ formatDate(order.expected_date) }}</td>
                <td class="px-3 py-3">
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-3 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                  {{ formatCurrency(order.total_amount) }}
                </td>
                <td class="px-3 py-3 text-center">
                  <div class="flex justify-center gap-1">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      title="Detail"
                      @click="openDetail(order)"
                    >
                      <Eye class="h-4 w-4" />
                    </button>

                    <button
                      v-if="order.status === 'draft'"
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      title="Edit"
                      @click="openEditModal(order)"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>

                    <button
                      v-if="order.status === 'draft'"
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      title="Hapus"
                      @click="deleteOrder(order)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="flex flex-wrap justify-between items-center gap-3 mt-3">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Tampilkan</span>
            <select
              v-model.number="pagination.per_page"
              class="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              @change="loadOrders(1)"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <span class="text-xs text-slate-500">data</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Halaman {{ pagination.page }} dari {{ pagination.total_pages }}</span>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200"
              :disabled="!pagination.has_prev || loading"
              @click="loadOrders(pagination.page - 1)"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200"
              :disabled="!pagination.has_next || loading"
              @click="loadOrders(pagination.page + 1)"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
