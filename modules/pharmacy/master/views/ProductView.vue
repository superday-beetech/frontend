<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Plus, RotateCcw, Eye, Pencil, Trash2, RefreshCw } from 'lucide-vue-next'

import { useToast } from '@/shared/composables/useToast'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useModal } from '@/shared/composables/useModal'
import { useMasterOptions } from '@/modules/pharmacy/master/composables/useMasterOptions'

import productService, { type Product, type ProductPagination } from '../services/productService'

import ProductFormModal from '../components/ProductFormModal.vue'
import ProductDetailModal from '../components/ProductDetailModal.vue'

// Komponen UI
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import TablePaginationBar from '@/shared/components/ui/data/TablePaginationBar.vue'

import type { OptionItem } from '@/shared/composables/useOption'

const toast = useToast()
const { confirm } = useConfirm()
const modalStore = useModal()
const masterOptions = useMasterOptions()

// ── State ──
const products = ref<Product[]>([])
const loading = ref(false)

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const pagination = ref<ProductPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
})

const status = ref<string>('')
const categoryId = ref<number | string>('')

// ── Opsi Filter ──
const statusOptions: OptionItem[] = [
  { value: '', label: 'Semua Status' },
  { value: '1', label: 'Aktif' },
  { value: '0', label: 'Tidak Aktif' },
]

const categoryFilterOptions = computed<OptionItem[]>(() => [{ value: '', label: 'Semua Kategori' }, ...masterOptions.categoryOptions.value])

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

// ── Helper ──
let searchTimeout: ReturnType<typeof setTimeout> | undefined

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return error?.message || 'Terjadi kesalahan.'
}

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

// ── Actions ──
async function loadProducts(page = currentPage.value): Promise<void> {
  loading.value = true

  try {
    const response = await productService.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
      is_active: status.value === '' ? undefined : Number(status.value),
      category_id: categoryId.value === '' ? undefined : Number(categoryId.value),
    })

    const result = response.data

    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil data produk.')
    }

    products.value = result.data.items
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
    title: 'Tambah Produk',
    component: ProductFormModal,
    props: { product: null },
    size: 'xl',
    centered: true,
    scrollable: true,
    onSelect: async () => {
      await loadProducts(1)
    },
  })
}

function openEditForm(product: Product): void {
  modalStore.open({
    title: 'Ubah Produk',
    component: ProductFormModal,
    props: { product },
    size: 'xl',
    centered: true,
    scrollable: true,
    onSelect: async () => {
      await loadProducts(currentPage.value)
    },
  })
}

async function openDetail(product: Product): Promise<void> {
  try {
    const response = await productService.getById(product.id)
    const result = response.data

    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil detail produk.')
    }

    modalStore.open({
      title: 'Detail Produk',
      component: ProductDetailModal,
      props: { product: result.data },
      size: 'lg',
      centered: true,
      scrollable: true,
      onSelect: (value) => {
        openEditForm(value as Product)
      },
    })
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}

async function deleteProduct(product: Product): Promise<void> {
  const confirmed = await confirm({
    title: 'Konfirmasi Hapus',
    message: `Hapus produk "${product.name}"?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    const response = await productService.delete(product.id)
    const result = response.data

    if (result.error) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menghapus produk.')
    }

    toast.success('Produk berhasil dihapus.')

    const nextPage = products.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value
    await loadProducts(nextPage)
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}
function reloadData(): void {
  // Panggil loadProducts dengan halaman saat ini
  // Ini akan memuat ulang data tanpa mereset filter
  loadProducts(currentPage.value)
}
function resetFilters(): void {
  search.value = ''
  status.value = ''
  categoryId.value = ''
}

// ── Watchers ──
watch([search, status, categoryId], () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts(1)
  }, 350)
})

watch(perPage, () => {
  loadProducts(1)
})

onMounted(async () => {
  await masterOptions.load()
  await loadProducts(1)
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Produk</h1>
        <p class="text-sm text-slate-500">Kelola data produk apotek.</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Tombol Reload di Header -->
        <button
          @click="reloadData"
          :disabled="loading"
          class="flex h-[38px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          title="Muat Ulang Data"
        >
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
        </button>

        <BaseButton @click="openCreateForm">
          <Plus class="w-4 h-4" />
          Tambah Produk
        </BaseButton>
      </div>
    </div>

    <!-- Main Card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5 space-y-4">
        <!-- Container Filter -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          <!-- 1. Tampilkan (Pakai OptionSelect) -->
          <div class="md:col-span-2">
            <OptionSelect v-model="perPage" label="Tampilkan" :options="perPageOptions" :searchable="false" :floating="false" />
          </div>

          <!-- 2. Kategori -->
          <div class="md:col-span-3">
            <OptionSelect
              v-model="categoryId"
              label="Kategori"
              :options="categoryFilterOptions"
              placeholder="Semua kategori"
              search-placeholder="Cari kategori..."
              :floating="false"
            />
          </div>

          <!-- 3. Status -->
          <div class="md:col-span-3">
            <OptionSelect
              v-model="status"
              label="Status"
              :options="statusOptions"
              placeholder="Semua status"
              :searchable="false"
              :floating="false"
            />
          </div>

          <!-- 4. Pencarian (Pakai BaseInput) -->
          <!-- 4. Pencarian (Pakai BaseInput) -->
          <div class="md:col-span-4 flex items-end gap-2">
            <!-- Pencarian -->
            <div class="flex-1">
              <BaseInput v-model="search" label="Pencarian" placeholder="SKU, barcode, produk..." :floating="false" />
            </div>

            <!-- Tombol Reset -->
            <button
              @click="resetFilters"
              class="flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Reset Filter"
            >
              <RotateCcw class="h-4 w-4" />
              <span class="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        <!-- Table Section -->
        <div class="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th class="px-4 py-3 w-12 text-center">No.</th>
                <th class="px-4 py-3">Produk</th>
                <th class="px-4 py-3">SKU / Barcode</th>
                <th class="px-4 py-3">Kategori</th>
                <th class="px-4 py-3">Satuan</th>
                <th class="px-4 py-3 text-right">Harga Beli</th>
                <th class="px-4 py-3 text-right">Harga Jual</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-center w-32">Aksi</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <!-- Loading -->
              <tr v-if="loading">
                <td colspan="9" class="px-4 py-8 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-r-transparent"></span>
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr v-else-if="products.length === 0">
                <td colspan="9" class="px-4 py-8 text-center text-slate-500">Data produk tidak ditemukan.</td>
              </tr>

              <!-- Data Rows -->
              <tr
                v-for="(product, index) in products"
                :key="product.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-4 py-3 text-center text-slate-500">{{ (currentPage - 1) * perPage + index + 1 }}</td>

                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-900 dark:text-white">{{ product.name }}</div>
                  <div class="text-xs text-slate-500">{{ product.description || '-' }}</div>
                </td>

                <td class="px-4 py-3">
                  <div class="font-medium">{{ product.sku || '-' }}</div>
                  <div class="text-xs text-slate-500">{{ product.barcode || '-' }}</div>
                </td>

                <td class="px-4 py-3">{{ product.category_name || '-' }}</td>
                <td class="px-4 py-3">{{ product.unit_name || '-' }}</td>

                <td class="px-4 py-3 text-right whitespace-nowrap">{{ formatCurrency(product.purchase_price) }}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap">{{ formatCurrency(product.selling_price) }}</td>

                <!-- Status (BaseBadge) -->
                <td class="px-4 py-3">
                  <BaseBadge :variant="Number(product.is_active) === 1 ? 'success' : 'neutral'">
                    {{ Number(product.is_active) === 1 ? 'Aktif' : 'Tidak Aktif' }}
                  </BaseBadge>
                </td>

                <!-- Aksi (BaseButton) -->
                <td class="px-4 py-3">
                  <div class="flex justify-center items-center gap-1">
                    <BaseButton variant="ghost" size="sm" title="Detail" @click="openDetail(product)">
                      <Eye class="w-4 h-4 text-slate-500 hover:text-blue-600" />
                    </BaseButton>
                    <BaseButton variant="ghost" size="sm" title="Ubah" @click="openEditForm(product)">
                      <Pencil class="w-4 h-4 text-slate-500 hover:text-amber-600" />
                    </BaseButton>
                    <BaseButton variant="ghost" size="sm" title="Hapus" @click="deleteProduct(product)">
                      <Trash2 class="w-4 h-4 text-slate-500 hover:text-rose-600" />
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ✨ PAGINATION BAR (Menggunakan Komponen Terpisah) ✨ -->
        <TablePaginationBar
          :current-page="currentPage"
          :total-pages="pagination.total_pages"
          :total-items="pagination.total"
          :per-page="perPage"
          :loading="loading"
          item-label="produk"
          @update:page="loadProducts($event)"
          @update:per-page="perPage = $event"
        />
      </div>
    </div>
  </div>
</template>
