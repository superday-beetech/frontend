<script setup lang="ts">
import { computed, reactive } from "vue";

import type { GoodsReceiptItem } from "../types/goodsReceipt";
import type { GoodsReceiptPostPayload, GoodsReceiptBatchRow } from "../api/goods-receipt.api";

const props = defineProps<{
  items: GoodsReceiptItem[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [payload: GoodsReceiptPostPayload];
  close: [];
}>();

const rows = reactive<Record<number, GoodsReceiptBatchRow[]>>({});

props.items.forEach((item) => {
  rows[item.id] = [
    {
      batch_number: "",
      quantity: Number(item.quantity_received),
      expired_at: null,
    },
  ];
});

const totals = computed(() => {
  const result: Record<number, number> = {};

  props.items.forEach((item) => {
    result[item.id] = (rows[item.id] ?? []).reduce((sum, batch) => sum + Number(batch.quantity || 0), 0);
  });

  return result;
});

function isQuantityValid(item: GoodsReceiptItem): boolean {
  const received = Number(item.quantity_received);
  const allocated = totals.value[item.id] ?? 0;

  return Math.abs(received - allocated) <= 0.0001;
}

const canSubmit = computed(() => {
  if (!props.items.length) return false;

  return props.items.every((item) => {
    const batches = rows[item.id] ?? [];

    if (!batches.length || !isQuantityValid(item)) {
      return false;
    }

    return batches.every((batch) => {
      return batch.batch_number.trim() !== "" && Number.isFinite(Number(batch.quantity)) && Number(batch.quantity) > 0;
    });
  });
});

function addBatch(itemId: number) {
  rows[itemId].push({
    batch_number: "",
    quantity: 0,
    expired_at: null,
  });
}

function removeBatch(itemId: number, index: number) {
  if (rows[itemId].length <= 1) return;

  rows[itemId].splice(index, 1);
}

function submit() {
  if (!canSubmit.value || props.loading) return;

  const batchBreakdown: Record<number, GoodsReceiptBatchRow[]> = {};

  props.items.forEach((item) => {
    batchBreakdown[item.id] = rows[item.id].map((batch) => ({
      batch_number: batch.batch_number.trim(),
      quantity: Number(batch.quantity),
      expired_at: batch.expired_at || null,
    }));
  });

  emit("select", {
    batch_breakdown: batchBreakdown,
  });
}
</script>

<template>
  <div>
    <div class="rounded-lg border px-4 py-3 text-sm alert-info">
      <i class="ti ti-info-circle me-2"></i>
      Bagi jumlah penerimaan ke dalam satu atau beberapa batch. Total jumlah batch harus sama dengan jumlah yang diterima.
    </div>

    <div v-for="item in props.items" :key="item.id" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-3">
      <div class="card-header flex justify-between items-center">
        <div>
          <h6 class="mb-1">
            {{ item.product_name || `Produk #${item.product_id}` }}
          </h6>

          <small class="text-slate-500"> SKU: {{ item.sku || "-" }} </small>
        </div>

        <div class="text-right">
          <small class="text-slate-500 block"> Jumlah diterima </small>

          <strong>
            {{ item.quantity_received }}
          </strong>
        </div>
      </div>

      <div class="p-5">
        <div v-for="(batch, index) in rows[item.id]" :key="index" class="grid grid-cols-12 g-2 items-end mb-3">
          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nomor Batch </label>

            <input v-model="batch.batch_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: BATCH-001" :disabled="loading" />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Jumlah </label>

            <input v-model.number="batch.quantity" type="number" min="0.0001" step="0.0001" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="loading" />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Kedaluwarsa </label>

            <input v-model="batch.expired_at" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="loading" />
          </div>

          <div class="col-md-1">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-rose-50 text-rose-700 w-full" :disabled="loading || rows[item.id].length <= 1" title="Hapus batch" @click="removeBatch(item.id, index)">
              <i class="ti ti-trash"></i>
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center flex-wrap gap-2">
          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-primary-50 text-primary-700" :disabled="loading" @click="addBatch(item.id)">
            <i class="ti ti-plus me-1"></i>
            Tambah Batch
          </button>

          <div class="text-right">
            <small class="text-slate-500 me-2"> Total alokasi: </small>

            <strong :class="isQuantityValid(item) ? 'text-success' : 'text-danger'">
              {{ totals[item.id] ?? 0 }}
              / {{ item.quantity_received }}
            </strong>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="loading" @click="emit('close')">Batal</button>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="!canSubmit || loading" @click="submit">
        <span v-if="loading" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>

        <i v-else class="ti ti-package-import me-1"></i>

        {{ loading ? "Memposting..." : "Posting Goods Receipt" }}
      </button>
    </div>
  </div>
</template>
