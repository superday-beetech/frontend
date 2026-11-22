<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'
import CurrencyInput from '@/shared/components/ui/form/CurrencyInput.vue'

import { useDiscount, type DiscountMode } from '@/shared/composables/useDiscount'
import type { OptionItem } from '@/shared/composables/useOption'

import type { CreatePurchaseOrderPayload, PurchaseOrder, PurchaseOrderItem } from '../types/purchaseOrder'

import { RefreshCw, Pencil, ShoppingCart, Trash2, AlertTriangle, Save, Package, Search } from 'lucide-vue-next'
import DiscountInput from '@/shared/components/ui/form/DiscountInput.vue'

// ==================================================
// Interfaces
// ==================================================

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
  selling_price?: number | string
}

interface FormItem {
  product_id: number | ''
  quantity: number
  unit_cost: number
  discount_amount: number
  discount_mode: DiscountMode
  notes: string
}

type NumberMode = 'auto' | 'manual'

interface PurchaseOrderFormState {
  order_number: string
  supplier_id: number | ''
  order_date: string
  expected_date: string
  discount_amount: number
  tax_amount: number
  notes: string
  items: FormItem[]
}

// ==================================================
// Props & Emits
// ==================================================

const props = defineProps<{
  suppliers: SupplierOption[]
  products: ProductOption[]
  order?: PurchaseOrder
}>()

const emit = defineEmits<{
  select: [payload: CreatePurchaseOrderPayload]
  close: []
}>()

// ==================================================
// Composables
// ==================================================

const { calculateDiscount, isDiscountValid, calculateNet } = useDiscount()

// ==================================================
// Helpers
// ==================================================

function toNumber(value: unknown): number {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

function getLocalDate(): string {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function generateOrderNumber(): string {
  const date = getLocalDate().replaceAll('-', '')
  const suffix = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')

  return `PO-${date}-${suffix}`
}

function createEmptyItem(): FormItem {
  return {
    product_id: '',
    quantity: 1,
    unit_cost: 0,
    discount_amount: 0,
    discount_mode: 'percent',
    notes: '',
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(toNumber(value))
}

// ==================================================
// Form State
// ==================================================

const isEdit = computed(() => Boolean(props.order))

const numberMode = ref<NumberMode>(props.order ? 'manual' : 'auto')

const form = reactive<PurchaseOrderFormState>({
  order_number: props.order?.order_number ?? generateOrderNumber(),

  supplier_id: props.order?.supplier_id ?? '',

  order_date: props.order?.order_date?.slice(0, 10) ?? getLocalDate(),

  expected_date: props.order?.expected_date?.slice(0, 10) ?? '',

  discount_amount: toNumber(props.order?.discount_amount),

  tax_amount: toNumber(props.order?.tax_amount),

  notes: props.order?.notes ?? '',

  items: props.order?.items?.length
    ? props.order.items.map((item: PurchaseOrderItem): FormItem => ({
        product_id: Number(item.product_id),
        quantity: toNumber(item.quantity),
        unit_cost: toNumber(item.unit_cost),
        discount_amount: toNumber(item.discount_amount),
        discount_mode: 'amount',
        notes: item.notes ?? '',
      }))
    : [],
})

// ==================================================
// Supplier Selection
// ==================================================

const supplierOptions = computed<OptionItem[]>(() =>
  props.suppliers.map((supplier) => ({
    value: Number(supplier.id),
    label: supplier.name,
    description: supplier.code ? `Kode: ${supplier.code}` : undefined,
    keywords: supplier.code ?? '',
  }))
)

// ==================================================
// Product Selection
// ==================================================

const productToAdd = ref<number | ''>('')

const selectedProductIds = computed<number[]>(() =>
  form.items.filter((item) => item.product_id !== '').map((item) => Number(item.product_id))
)

const availableProducts = computed<OptionItem[]>(() =>
  props.products
    .filter((product) => !selectedProductIds.value.includes(Number(product.id)))
    .map((product) => ({
      value: Number(product.id),
      label: product.name,
      description: product.sku ? `SKU: ${product.sku}` : undefined,
      keywords: product.sku ?? '',
    }))
)

function addProduct(productIdValue: string | number | null): void {
  if (productIdValue === '') return

  const productId = Number(productIdValue)

  if (!Number.isInteger(productId) || productId <= 0) {
    productToAdd.value = ''
    return
  }

  const product = props.products.find((item) => Number(item.id) === productId)

  if (!product) {
    productToAdd.value = ''
    return
  }

  if (selectedProductIds.value.includes(productId)) {
    productToAdd.value = ''
    return
  }

  form.items.push({
    ...createEmptyItem(),
    product_id: productId,
    unit_cost: toNumber(product.purchase_price),
  })

  productToAdd.value = ''
}

function removeItem(index: number): void {
  if (index < 0 || index >= form.items.length) return

  form.items.splice(index, 1)
}

function getProduct(productId: number | ''): ProductOption | undefined {
  if (productId === '') return undefined

  return props.products.find((product) => Number(product.id) === Number(productId))
}

function getProductName(productId: number | ''): string {
  return getProduct(productId)?.name ?? 'Produk tidak ditemukan'
}

function getProductSku(productId: number | ''): string {
  return getProduct(productId)?.sku ?? '-'
}

// ==================================================
// Purchase Order Number
// ==================================================

function useAutomaticNumber(): void {
  numberMode.value = 'auto'
  form.order_number = generateOrderNumber()
}

function useManualNumber(): void {
  numberMode.value = 'manual'
}

// ==================================================
// Item Calculations
// ==================================================

function getItemGross(item: FormItem): number {
  return Math.max(0, toNumber(item.quantity) * toNumber(item.unit_cost))
}

function getItemDiscount(item: FormItem): number {
  return calculateDiscount(getItemGross(item), item.discount_amount, item.discount_mode)
}

function getItemNet(item: FormItem): number {
  return calculateNet(getItemGross(item), item.discount_amount, item.discount_mode)
}

// ==================================================
// Purchase Order Calculations
// ==================================================

const subtotal = computed(() => form.items.reduce((total, item) => total + getItemNet(item), 0))

const invalidItemDiscount = computed(() =>
  form.items.some((item) => !isDiscountValid(getItemGross(item), item.discount_amount, item.discount_mode))
)

const invalidOrderDiscount = computed(() => {
  const discount = toNumber(form.discount_amount)

  return discount < 0 || discount > subtotal.value
})

const invalidTax = computed(() => toNumber(form.tax_amount) < 0)

const duplicateProducts = computed(() => {
  const selected = selectedProductIds.value

  return selected.length !== new Set(selected).size
})

const invalidExpectedDate = computed(() => Boolean(form.expected_date) && form.expected_date < form.order_date)

const invalidItems = computed(
  () =>
    form.items.length === 0 ||
    form.items.some((item) => {
      const quantity = toNumber(item.quantity)
      const unitCost = toNumber(item.unit_cost)

      return item.product_id === '' || quantity <= 0 || unitCost < 0
    })
)

const total = computed(() => {
  const discount = Math.max(0, toNumber(form.discount_amount))

  const tax = Math.max(0, toNumber(form.tax_amount))

  return Math.max(0, subtotal.value - discount + tax)
})

// ==================================================
// Submit Validation
// ==================================================

const canSubmit = computed(
  () =>
    Boolean(form.order_number.trim()) &&
    Boolean(form.supplier_id) &&
    Boolean(form.order_date) &&
    form.items.length > 0 &&
    !invalidExpectedDate.value &&
    !duplicateProducts.value &&
    !invalidItemDiscount.value &&
    !invalidOrderDiscount.value &&
    !invalidTax.value &&
    !invalidItems.value
)

// ==================================================
// Submit
// ==================================================

function submit(): void {
  if (!canSubmit.value) return

  const payload: CreatePurchaseOrderPayload = {
    order_number: form.order_number.trim(),

    supplier_id: Number(form.supplier_id),

    order_date: form.order_date,

    expected_date: form.expected_date || null,

    discount_amount: toNumber(form.discount_amount),

    tax_amount: toNumber(form.tax_amount),

    notes: form.notes.trim() || null,

    items: form.items.map((item) => ({
      product_id: Number(item.product_id),

      quantity: toNumber(item.quantity),

      unit_cost: toNumber(item.unit_cost),

      discount_amount: getItemDiscount(item),

      notes: item.notes.trim() || null,
    })),
  }

  emit('select', payload)
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-5">
    <!-- ============================================ -->
    <!-- SECTION 1: INFORMASI PO                      -->
    <!-- ============================================ -->
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="mb-4 flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
        >
          <Package class="h-4 w-4" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Informasi Purchase Order</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Data utama pesanan pembelian</p>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-4">
        <!-- PO NUMBER -->
        <div class="col-span-12 md:col-span-6">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nomor Purchase Order
            <span class="text-rose-600">*</span>
          </label>

          <div
            class="flex w-full items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900"
          >
            <input
              v-model="form.order_number"
              type="text"
              class="w-full border-0 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="Contoh: PO-20261109-123456"
              maxlength="50"
              required
              :readonly="numberMode === 'auto'"
            />

            <button
              type="button"
              class="inline-flex items-center gap-1.5 border-l border-slate-200 px-3 text-xs font-medium transition dark:border-slate-700"
              :class="
                numberMode === 'auto'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              "
              @click="useAutomaticNumber"
            >
              <RefreshCw class="h-3.5 w-3.5" />
              Otomatis
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 border-l border-slate-200 px-3 text-xs font-medium transition dark:border-slate-700"
              :class="
                numberMode === 'manual'
                  ? 'bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              "
              @click="useManualNumber"
            >
              <Pencil class="h-3.5 w-3.5" />
              Manual
            </button>
          </div>

          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {{ numberMode === 'auto' ? 'Nomor dibuat otomatis. Klik Manual jika ingin mengubahnya.' : 'Masukkan nomor PO secara manual.' }}
          </p>
        </div>

        <!-- SUPPLIER -->
        <div class="col-span-12 md:col-span-6">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Supplier
            <span class="text-rose-600">*</span>
          </label>
          <OptionSelect
            v-model="form.supplier_id"
            :options="supplierOptions"
            placeholder="Pilih supplier..."
            search-placeholder="Cari nama supplier..."
            empty-text="Supplier tidak ditemukan"
          />
        </div>

        <!-- ORDER DATE -->
        <div class="col-span-12 md:col-span-6">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tanggal Order
            <span class="text-rose-600">*</span>
          </label>
          <input
            v-model="form.order_date"
            type="date"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            required
          />
        </div>

        <!-- EXPECTED DATE -->
        <div class="col-span-12 md:col-span-6">
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Estimasi Kedatangan</label>
          <input
            v-model="form.expected_date"
            type="date"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            :class="{ 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20': invalidExpectedDate }"
            :min="form.order_date"
          />
          <p v-if="invalidExpectedDate" class="mt-1 flex items-center gap-1 text-xs text-rose-600">
            <AlertTriangle class="h-3 w-3" />
            Tanggal estimasi tidak boleh sebelum tanggal order.
          </p>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- SECTION 2: ITEM PO                           -->
    <!-- ============================================ -->
    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
          >
            <ShoppingCart class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">Item Purchase Order</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ form.items.length }} produk dipilih</p>
          </div>
        </div>

        <span
          class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {{ form.items.length }} item
        </span>
      </div>

      <div class="p-5 space-y-4">
        <!-- PRODUCT SEARCH -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            <Search class="mr-1 inline h-3.5 w-3.5" />
            Cari dan Tambahkan Produk
          </label>
          <OptionSelect
            v-model="productToAdd"
            :options="availableProducts"
            placeholder="Cari nama produk atau SKU..."
            search-placeholder="Ketik nama produk atau SKU..."
            empty-text="Produk tidak ditemukan atau sudah dipilih"
            @update:model-value="addProduct"
          />
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Pilih produk untuk memasukkannya ke daftar Purchase Order.</p>
        </div>

        <!-- ITEM TABLE -->
        <!-- ITEM TABLE -->
        <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div class="w-full overflow-x-auto">
            <table class="w-full table-fixed border-collapse text-xs">
              <colgroup>
                <col class="w-[20%]" />
                <!-- Produk dikurangi -->
                <col class="w-[15%]" />
                <!-- Qty -->
                <col class="w-[22%]" />
                <!-- Harga -->
                <col class="w-[18%]" />
                <!-- Diskon -->
                <col class="w-[18%]" />
                <!-- Subtotal -->
                <col class="w-[7%]" />
                <!-- Aksi -->
              </colgroup>

              <thead class="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Produk
                  </th>
                  <th class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Qty
                  </th>
                  <th class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Harga Satuan
                  </th>
                  <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Diskon
                  </th>
                  <th class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Subtotal
                  </th>
                  <th class="px-1 py-3"></th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <!-- EMPTY STATE -->
                <tr v-if="form.items.length === 0">
                  <td colspan="6" class="px-4 py-10 text-center">
                    <div
                      class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    >
                      <ShoppingCart class="h-6 w-6" />
                    </div>
                    <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada produk</p>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Cari dan tambahkan produk melalui kolom pencarian di atas.
                    </p>
                  </td>
                </tr>

                <!-- PRODUCT ROWS -->
                <tr
                  v-for="(item, index) in form.items"
                  :key="String(item.product_id)"
                  class="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                >
                  <!-- PRODUK -->
                  <td class="px-3 py-3 align-top">
                    <div class="flex flex-col">
                      <span class="truncate font-semibold text-slate-800 dark:text-slate-100" :title="getProductName(item.product_id)">
                        {{ getProductName(item.product_id) }}
                      </span>
                      <span class="truncate text-xs text-slate-500 dark:text-slate-400">SKU: {{ getProductSku(item.product_id) }}</span>
                      <span v-if="!getProduct(item.product_id)" class="mt-1 inline-flex items-center gap-1 text-xs text-rose-600">
                        <AlertTriangle class="h-3 w-3 shrink-0" />
                        Produk tidak ditemukan
                      </span>
                    </div>
                  </td>

                  <!-- QTY -->
                  <td class="px-3 py-3 align-top">
                    <div class="min-w-22.5">
                      <ButtonSpin v-model="item.quantity" :min="0" :step="1" size="sm" />
                    </div>
                  </td>

                  <td class="min-w-0 px-2 py-3 align-top">
                    <!-- Paksa CurrencyInput agar mengecil maksimal di kolom ini -->
                    <div class="w-full max-w-16 ml-auto">
                      <CurrencyInput v-model="item.unit_cost" :min="0" size="sm" placeholder="0" />
                    </div>
                  </td>

                  <!-- DISKON -->
                  <td class="min-w-0 px-2 py-3 align-top">
                    <div class="w-full max-w-25 ml-auto">
                      <DiscountInput v-model="item.discount_amount" v-model:mode="item.discount_mode" />
                    </div>
                  </td>

                  <!-- SUBTOTAL -->
                  <td class="px-3 py-3 text-right align-top">
                    <strong class="whitespace-nowrap text-slate-800 dark:text-slate-100">
                      {{ formatCurrency(getItemNet(item)) }}
                    </strong>
                  </td>

                  <!-- DELETE -->
                  <td class="px-1 py-3 text-center align-top">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                      title="Hapus produk"
                      @click="removeItem(index)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- VALIDATION MESSAGES -->
        <div class="space-y-2">
          <div
            v-if="invalidItems"
            class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>Tambahkan minimal satu produk dan periksa kuantitas serta harga satuan.</span>
          </div>

          <div
            v-if="duplicateProducts"
            class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>Produk yang sama tidak boleh dimasukkan lebih dari satu kali.</span>
          </div>

          <div
            v-if="invalidItemDiscount"
            class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>Periksa nilai diskon item.</span>
          </div>

          <div
            v-if="invalidOrderDiscount"
            class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>Diskon PO tidak boleh melebihi subtotal.</span>
          </div>

          <div
            v-if="invalidTax"
            class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>Nilai pajak tidak boleh negatif.</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- SECTION 3: RINGKASAN & CATATAN               -->
    <!-- ============================================ -->
    <section class="grid grid-cols-12 gap-4">
      <!-- NOTES -->
      <div class="col-span-12 lg:col-span-7">
        <div class="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 class="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Catatan Purchase Order</h3>
          <textarea
            v-model="form.notes"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            rows="6"
            placeholder="Catatan tambahan untuk PO..."
          ></textarea>
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="col-span-12 lg:col-span-5">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 class="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Ringkasan</h3>

          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600 dark:text-slate-400">Subtotal</span>
              <strong class="text-slate-800 dark:text-slate-100">{{ formatCurrency(subtotal) }}</strong>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Diskon PO</label>
              <CurrencyInput v-model="form.discount_amount" :min="0" placeholder="Diskon PO" size="sm" />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Pajak</label>
              <CurrencyInput v-model="form.tax_amount" :min="0" placeholder="Pajak" size="sm" />
            </div>

            <div class="border-t border-slate-200 pt-3 dark:border-slate-700">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">Total PO</span>
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ formatCurrency(total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================ -->
    <!-- ACTIONS (sticky)                             -->
    <!-- ============================================ -->
    <div
      class="sticky bottom-0 -mx-5 -mb-5 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
    >
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        @click="emit('close')"
      >
        Batal
      </button>

      <button
        type="submit"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canSubmit"
      >
        <Save class="h-4 w-4" />
        {{ isEdit ? 'Simpan Perubahan' : 'Simpan Purchase Order' }}
      </button>
    </div>
  </form>
</template>
