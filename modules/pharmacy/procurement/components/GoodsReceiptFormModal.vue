<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import purchaseOrderService from '../services/purchaseOrderService'
import type { PurchaseOrder } from '../types/purchaseOrder'
import type { GoodsReceiptPayload } from '../types/goodsReceipt'
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'
import type { OptionItem } from '@/shared/composables/useOption'

interface PurchaseOrderOption {
  id: number
  order_number: string
  supplier_name?: string
  status: string
}

interface ReceiptFormItem {
  purchase_order_item_id: number
  product_id: number
  product_name: string
  sku: string
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  notes: string
}

const emit = defineEmits<{
  select: [payload: GoodsReceiptPayload]
  close: []
}>()

const loadingOrders = ref(false)
const loadingOrderDetail = ref(false)
const submitting = ref(false)

const purchaseOrders = ref<PurchaseOrderOption[]>([])
const selectedOrder = ref<PurchaseOrder | null>(null)

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  receipt_number: '',
  purchase_order_id: 0,
  received_date: today,
  supplier_delivery_number: '',
  notes: '',
  items: [] as ReceiptFormItem[],
})

const canSubmit = computed(
  () =>
    form.receipt_number.trim() !== '' &&
    form.purchase_order_id > 0 &&
    form.received_date !== '' &&
    form.items.length > 0 &&
    form.items.some((item) => item.quantity_received > 0)
)

const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value || 0)

async function loadPurchaseOrders() {
  loadingOrders.value = true
  try {
    const response = await purchaseOrderService.getAll({ page: 1, per_page: 100 })
    const result = response.data

    purchaseOrders.value = (result?.items ?? [])
      .filter((order: PurchaseOrder) => ['draft', 'approved', 'ordered', 'partial'].includes(order.status))
      .map((order: PurchaseOrder) => ({
        id: order.id,
        order_number: order.order_number,
        supplier_name: order.supplier_name,
        status: order.status,
      }))
  } catch (error) {
    console.error('Gagal memuat Purchase Order:', error)
  } finally {
    loadingOrders.value = false
  }
}

async function selectPurchaseOrder() {
  selectedOrder.value = null
  form.items = []

  if (!form.purchase_order_id) return

  loadingOrderDetail.value = true
  try {
    const response = await purchaseOrderService.getById(form.purchase_order_id)
    const order = response.data

    if (!order) {
      selectedOrder.value = null
      form.items = []
      return
    }

    selectedOrder.value = order
    form.items = (order.items ?? []).map((item) => ({
      purchase_order_item_id: Number(item.id),
      product_id: Number(item.product_id),
      product_name: item.product_name ?? '-',
      sku: item.sku ?? '-',
      quantity_ordered: Number(item.quantity),
      quantity_received: 0,
      unit_cost: Number(item.unit_cost),
      notes: '',
    }))
  } catch (error) {
    console.error('Gagal memuat detail PO:', error)
  } finally {
    loadingOrderDetail.value = false
  }
}

function submit() {
  if (!canSubmit.value || submitting.value) return

  const payload: GoodsReceiptPayload = {
    receipt_number: form.receipt_number.trim(),
    purchase_order_id: form.purchase_order_id,
    received_date: form.received_date,
    supplier_delivery_number: form.supplier_delivery_number.trim() || null,
    notes: form.notes.trim() || null,
    items: form.items
      .filter((item) => item.quantity_received > 0)
      .map((item) => ({
        purchase_order_item_id: item.purchase_order_item_id,
        quantity_received: item.quantity_received,
        unit_cost: item.unit_cost,
        notes: item.notes.trim() || null,
      })),
  }

  emit('select', payload)
}
const purchaseOrderOptions = computed<OptionItem[]>(() =>
  purchaseOrders.value.map((order) => ({
    value: order.id,
    label: order.order_number,
    description: order.supplier_name,
    keywords: `${order.order_number} ${order.supplier_name}`,
  }))
)

onMounted(loadPurchaseOrders)
</script>

<template>
  <div class="space-y-4">
    <!-- Receipt number -->
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Nomor Penerimaan
        <span class="text-rose-600">*</span>
      </label>
      <input
        v-model="form.receipt_number"
        type="text"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        placeholder="Contoh: GR-2026-0001"
      />
    </div>

    <!-- PO + date -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <OptionSelect
          v-model.number="form.purchase_order_id"
          label="Purchase Order"
          required
          :options="purchaseOrderOptions"
          :placeholder="loadingOrders ? 'Memuat PO...' : 'Pilih PO'"
          search-placeholder="Cari nomor PO atau supplier..."
          :disabled="loadingOrders || loadingOrderDetail"
          @update:model-value="selectPurchaseOrder"
        />
        <p v-if="!loadingOrders && purchaseOrders.length === 0" class="mt-1 text-xs text-slate-500">
          Tidak ada PO yang dapat menerima barang.
        </p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tanggal Penerimaan
          <span class="text-rose-600">*</span>
        </label>
        <input
          v-model="form.received_date"
          type="date"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>
    </div>

    <!-- Delivery number -->
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Surat Jalan Supplier</label>
      <input
        v-model="form.supplier_delivery_number"
        type="text"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        placeholder="Nomor surat jalan"
      />
    </div>

    <!-- Selected PO summary -->
    <div v-if="selectedOrder" class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor PO</p>
          <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ selectedOrder.order_number }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</p>
          <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ selectedOrder.supplier_name || '-' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading detail -->
    <div
      v-if="loadingOrderDetail"
      class="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-r-primary-600" />
      Memuat detail PO...
    </div>

    <!-- Items -->
    <template v-else-if="form.items.length > 0">
      <div>
        <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Item Penerimaan</h3>

        <div class="overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
          <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Produk
                </th>
                <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Qty PO
                </th>
                <th class="w-32 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Qty Diterima
                </th>
                <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Harga Satuan
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              <tr
                v-for="item in form.items"
                :key="item.purchase_order_item_id"
                class="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
              >
                <td class="px-4 py-2.5">
                  <p class="font-medium text-slate-900 dark:text-slate-100">
                    {{ item.product_name }}
                  </p>
                  <p class="text-xs text-slate-500">{{ item.sku }}</p>
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {{ formatNumber(item.quantity_ordered) }}
                </td>
                <td class="px-4 py-2.5">
                  <input
                    v-model.number="item.quantity_received"
                    type="number"
                    min="0"
                    step="0.001"
                    class="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {{ formatNumber(item.unit_cost) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-2 text-xs text-slate-500">Isi jumlah aktual yang diterima. Item dengan jumlah nol tidak akan dikirim.</p>
      </div>
    </template>

    <!-- Empty state -->
    <div
      v-else-if="form.purchase_order_id > 0"
      class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Purchase Order ini tidak memiliki item.
    </div>

    <!-- Notes -->
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
      <textarea
        v-model="form.notes"
        rows="2"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        placeholder="Catatan penerimaan..."
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      <button
        type="button"
        class="inline-flex items-center rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        :disabled="submitting"
        @click="emit('close')"
      >
        Batal
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50"
        :disabled="!canSubmit || submitting"
        @click="submit"
      >
        <span v-if="submitting" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-r-white" />
        Simpan Draft
      </button>
    </div>
  </div>
</template>
