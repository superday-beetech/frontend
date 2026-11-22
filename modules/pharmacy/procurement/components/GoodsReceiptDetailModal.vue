<script setup lang="ts">
import { onMounted, ref } from 'vue'

import GoodsReceiptBatchModal from './GoodsReceiptBatchModal.vue'
import goodsReceiptService, { type GoodsReceiptPostPayload } from '../services/goodsReceiptService'

import type { GoodsReceipt } from '../types/goodsReceipt'

import { useToast } from '@/shared/composables/useToast'

const toast = useToast()

const props = defineProps<{
  receiptId: number
}>()

const emit = defineEmits<{
  select: [id: number]
  close: []
}>()

const receipt = ref<GoodsReceipt | null>(null)
const loading = ref(false)
const posting = ref(false)
const showBatchForm = ref(false)

const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

function statusBadgeClass(value: string) {
  switch (value) {
    case 'posted':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-700/40'
    case 'draft':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-700/40'
    case 'cancelled':
      return 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
    default:
      return 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  }
}

function statusDotClass(value: string) {
  switch (value) {
    case 'posted':
      return 'bg-emerald-500'
    case 'draft':
      return 'bg-amber-500'
    case 'cancelled':
      return 'bg-slate-400'
    default:
      return 'bg-slate-400'
  }
}

async function loadDetail() {
  loading.value = true
  try {
    receipt.value = (await goodsReceiptService.getById(props.receiptId)) ?? null
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Gagal memuat detail Goods Receipt.')
  } finally {
    loading.value = false
  }
}

function openBatchForm() {
  if (!receipt.value || receipt.value.status !== 'draft' || !receipt.value.items?.length) return
  showBatchForm.value = true
}

async function handleBatchPosting(payload: GoodsReceiptPostPayload) {
  if (!receipt.value || receipt.value.status !== 'draft' || posting.value) return

  posting.value = true
  try {
    await goodsReceiptService.post(props.receiptId, payload)
    toast.success('Goods Receipt berhasil diposting.')
    showBatchForm.value = false
    await loadDetail()
    emit('select', props.receiptId)
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || 'Gagal mem-post Goods Receipt.')
  } finally {
    posting.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center gap-2 py-10 text-slate-500">
      <div class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-r-primary-600" />
      <p class="text-sm">Memuat detail penerimaan...</p>
    </div>

    <div v-else-if="receipt" class="space-y-5">
      <!-- Header info card -->
      <div
        class="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor Penerimaan</p>
          <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ receipt.receipt_number }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
          <div class="mt-1">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
              :class="statusBadgeClass(receipt.status)"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(receipt.status)" />
              {{ receipt.status }}
            </span>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor Purchase Order</p>
          <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ receipt.order_number || '-' }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</p>
          <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ receipt.supplier_name || '-' }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Tanggal Penerimaan</p>
          <p class="mt-1 text-sm text-slate-900 dark:text-slate-100">
            {{ receipt.received_date }}
          </p>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor Surat Jalan</p>
          <p class="mt-1 text-sm text-slate-900 dark:text-slate-100">
            {{ receipt.supplier_delivery_number || '-' }}
          </p>
        </div>
      </div>

      <!-- Items -->
      <div>
        <h3 class="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Detail Barang</h3>

        <div class="overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
          <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Produk
                </th>
                <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Jumlah Diterima
                </th>
                <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Harga Satuan
                </th>
                <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
              <tr v-for="item in receipt.items || []" :key="item.id" class="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                <td class="px-4 py-2.5">
                  <p class="font-medium text-slate-900 dark:text-slate-100">
                    {{ item.product_name || `Produk #${item.product_id}` }}
                  </p>
                  <p v-if="item.sku" class="text-xs text-slate-500">{{ item.sku }}</p>
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {{ formatNumber(item.quantity_received) }}
                </td>
                <td class="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {{ formatNumber(item.unit_cost) }}
                </td>
                <td class="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                  {{ item.notes || '-' }}
                </td>
              </tr>

              <tr v-if="!receipt.items?.length">
                <td colspan="4" class="px-4 py-8 text-center text-sm text-slate-500">Tidak ada detail barang.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="receipt.notes" class="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Catatan</p>
        <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ receipt.notes }}</p>
      </div>

      <!-- Batch form -->
      <div
        v-if="showBatchForm && receipt.status === 'draft'"
        class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
      >
        <h3 class="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Pembagian Batch</h3>
        <GoodsReceiptBatchModal
          :items="receipt.items || []"
          :loading="posting"
          @select="handleBatchPosting"
          @close="showBatchForm = false"
        />
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          class="inline-flex items-center rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          :disabled="posting"
          @click="emit('close')"
        >
          Tutup
        </button>

        <button
          v-if="receipt.status === 'draft' && !showBatchForm"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="posting || !receipt.items?.length"
          @click="openBatchForm"
        >
          <i class="ti ti-package-import" />
          Posting Penerimaan
        </button>
      </div>
    </div>

    <!-- Not found -->
    <div
      v-else
      class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Data Goods Receipt tidak ditemukan.
    </div>
  </div>
</template>
