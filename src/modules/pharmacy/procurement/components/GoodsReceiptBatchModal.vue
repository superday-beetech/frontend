<script setup lang="ts">
import { computed, reactive } from 'vue'

import type { GoodsReceiptItem } from '../types/goodsReceipt'
import type { GoodsReceiptPostPayload, GoodsReceiptBatchRow } from '../services/goodsReceiptService'

const props = defineProps<{
  items: GoodsReceiptItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [payload: GoodsReceiptPostPayload]
  close: []
}>()

const rows = reactive<Record<number, GoodsReceiptBatchRow[]>>({})

props.items.forEach((item) => {
  rows[item.id] = [
    {
      batch_number: '',
      quantity: Number(item.quantity_received),
      expired_at: null,
    },
  ]
})

const totals = computed(() => {
  const result: Record<number, number> = {}

  props.items.forEach((item) => {
    result[item.id] = (rows[item.id] ?? []).reduce((sum, batch) => sum + Number(batch.quantity || 0), 0)
  })

  return result
})

function isQuantityValid(item: GoodsReceiptItem): boolean {
  const received = Number(item.quantity_received)
  const allocated = totals.value[item.id] ?? 0
  return Math.abs(received - allocated) <= 0.0001
}

const canSubmit = computed(() => {
  if (!props.items.length) return false

  return props.items.every((item) => {
    const batches = rows[item.id] ?? []
    if (!batches.length || !isQuantityValid(item)) return false

    return batches.every(
      (batch) => batch.batch_number.trim() !== '' && Number.isFinite(Number(batch.quantity)) && Number(batch.quantity) > 0
    )
  })
})

function addBatch(itemId: number) {
  rows[itemId].push({
    batch_number: '',
    quantity: 0,
    expired_at: null,
  })
}

function removeBatch(itemId: number, index: number) {
  if (rows[itemId].length <= 1) return
  rows[itemId].splice(index, 1)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(Number(value) || 0)
}

function submit() {
  if (!canSubmit.value || props.loading) return

  const batchBreakdown: Record<number, GoodsReceiptBatchRow[]> = {}

  props.items.forEach((item) => {
    batchBreakdown[item.id] = rows[item.id].map((batch) => ({
      batch_number: batch.batch_number.trim(),
      quantity: Number(batch.quantity),
      expired_at: batch.expired_at || null,
    }))
  })

  emit('select', { batch_breakdown: batchBreakdown })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Info banner -->
    <div
      class="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900/50 dark:bg-sky-900/20 dark:text-sky-200"
    >
      <i class="ti ti-info-circle mt-0.5 shrink-0 text-base" />
      <p>
        Bagi jumlah penerimaan ke dalam satu atau beberapa batch.
        <span class="font-medium">Total jumlah batch harus sama dengan jumlah yang diterima.</span>
      </p>
    </div>

    <!-- Per-item batch card -->
    <div
      v-for="item in props.items"
      :key="item.id"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <!-- Card header -->
      <div
        class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ item.product_name || `Produk #${item.product_id}` }}
          </p>
          <p class="mt-0.5 text-xs text-slate-500">
            SKU:
            <span class="font-medium text-slate-700 dark:text-slate-300">{{ item.sku || '-' }}</span>
          </p>
        </div>

        <div class="text-right">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Jumlah diterima</p>
          <p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {{ formatNumber(item.quantity_received) }}
          </p>
        </div>
      </div>

      <!-- Card body -->
      <div class="space-y-3 p-4">
        <div v-for="(batch, index) in rows[item.id]" :key="index" class="grid grid-cols-12 items-end gap-3">
          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Nomor Batch</label>
            <input
              v-model="batch.batch_number"
              type="text"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
              placeholder="Contoh: BATCH-001"
              :disabled="loading"
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Jumlah</label>
            <input
              v-model.number="batch.quantity"
              type="number"
              min="0.0001"
              step="0.0001"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm tabular-nums text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
              :disabled="loading"
            />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Tanggal Kedaluwarsa</label>
            <input
              v-model="batch.expired_at"
              type="date"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
              :disabled="loading"
            />
          </div>

          <div class="col-span-12 md:col-span-1">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-lg bg-rose-50 px-2.5 py-2 text-rose-600 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
              :disabled="loading || rows[item.id].length <= 1"
              title="Hapus batch"
              aria-label="Hapus batch"
              @click="removeBatch(item.id, index)"
            >
              <i class="ti ti-trash" />
            </button>
          </div>
        </div>

        <!-- Footer per item -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/40"
            :disabled="loading"
            @click="addBatch(item.id)"
          >
            <i class="ti ti-plus" />
            Tambah Batch
          </button>

          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-500">Total alokasi:</span>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset"
              :class="
                isQuantityValid(item)
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-700/40'
                  : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-700/40'
              "
            >
              {{ formatNumber(totals[item.id] ?? 0) }}
              <span class="mx-1 opacity-50">/</span>
              {{ formatNumber(item.quantity_received) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      <button
        type="button"
        class="inline-flex items-center rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        :disabled="loading"
        @click="emit('close')"
      >
        Batal
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canSubmit || loading"
        @click="submit"
      >
        <span v-if="loading" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-r-white" />
        <i v-else class="ti ti-package-import" />

        {{ loading ? 'Memposting...' : 'Posting Goods Receipt' }}
      </button>
    </div>
  </div>
</template>
