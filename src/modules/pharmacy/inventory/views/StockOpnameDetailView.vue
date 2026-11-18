<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "@/shared/composables/useToast";
import { inventory.api } from "../api/inventory.api";
import type { StockOpnameDetail, StockOpnameItem, SaveStockOpnameCountsPayload } from "../types/inventory";

const toast = useToast();

const route = useRoute();
const router = useRouter();

const opnameId = Number(route.query.id);

const loading = ref(false);
const saving = ref(false);
const posting = ref(false);

const detail = ref<StockOpnameDetail | null>(null);

const isDraft = computed(() => detail.value?.opname.status === "draft");

const allCounted = computed(() => {
  const items = detail.value?.items ?? [];

  return items.length > 0 && items.every((item) => item.counted_quantity !== null && item.counted_quantity !== undefined && Number(item.counted_quantity) >= 0);
});

const totalDifference = computed(() => {
  return (detail.value?.items ?? []).reduce((total, item) => total + Number(item.difference_quantity ?? 0), 0);
});

async function loadDetail() {
  if (!Number.isInteger(opnameId) || opnameId < 1) {
    toast.error("Stock Opname ID tidak valid.");
    router.back();
    return;
  }

  loading.value = true;

  try {
    detail.value = await inventoryService.getOpnameDetail(opnameId);
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? "Gagal memuat detail stock opname.");
  } finally {
    loading.value = false;
  }
}

function updateCount(item: StockOpnameItem, value: string) {
  if (value.trim() === "") {
    item.counted_quantity = null;
    item.difference_quantity = null;
    return;
  }

  const counted = Number(value);

  if (!Number.isFinite(counted) || counted < 0) {
    return;
  }

  item.counted_quantity = counted;
  item.difference_quantity = Math.round((counted - Number(item.system_quantity)) * 1000) / 1000;
}

async function saveCounts() {
  if (!detail.value || !isDraft.value) return;

  const payload: SaveStockOpnameCountsPayload = {
    items: detail.value.items
      .filter((item) => item.counted_quantity !== null && item.counted_quantity !== undefined)
      .map((item) => ({
        item_id: Number(item.id),
        counted_quantity: Number(item.counted_quantity),
        notes: item.notes ?? "",
      })),
  };

  if (payload.items.length === 0) {
    toast.warning("Belum ada hasil penghitungan yang diisi.");
    return;
  }

  saving.value = true;

  try {
    await inventoryService.saveStockOpnameCounts(opnameId, payload);
    toast.success("Hasil penghitungan berhasil disimpan.");
    await loadDetail();
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? "Gagal menyimpan hasil penghitungan.");
  } finally {
    saving.value = false;
  }
}

async function postOpname() {
  if (!detail.value || !isDraft.value) return;

  if (!allCounted.value) {
    toast.warning("Semua batch harus dihitung sebelum opname diposting.");
    return;
  }

  const confirmed = window.confirm("Posting stock opname akan menyimpan hasil penghitungan dan menyesuaikan saldo stok. Proses ini tidak dapat dibatalkan. Lanjutkan?");

  if (!confirmed) return;

  const payload: SaveStockOpnameCountsPayload = {
    items: detail.value.items.map((item) => ({
      item_id: Number(item.id),
      counted_quantity: Number(item.counted_quantity),
      notes: item.notes ?? "",
    })),
  };

  posting.value = true;

  try {
    // Simpan hasil penghitungan terlebih dahulu
    await inventoryService.saveStockOpnameCounts(opnameId, payload);

    // Lanjutkan posting setelah penyimpanan berhasil
    await inventoryService.postStockOpname(opnameId);

    toast.success("Stock opname berhasil disimpan dan diposting.");

    await loadDetail();
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? "Gagal menyimpan atau memposting stock opname.");
  } finally {
    posting.value = false;
  }
}

function formatNumber(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("id-ID", {
    maximumFractionDigits: 3,
  });
}

onMounted(loadDetail);
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center flex-wrap gap-2 mb-4">
      <div>
        <h4 class="mb-1">Detail Stock Opname</h4>
        <p class="text-slate-500 mb-0">Penghitungan fisik dan penyesuaian saldo batch.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="router.back()">
        <i class="ti ti-arrow-left me-1"></i>
        Kembali
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
      <p class="text-slate-500 mt-2">Memuat detail...</p>
    </div>

    <template v-else-if="detail">
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="p-5">
          <div class="grid grid-cols-12 g-3">
            <div class="col-span-12 md:col-span-3">
              <small class="text-slate-500 block">Nomor Opname</small>
              <strong>{{ detail.opname.opname_number }}</strong>
            </div>

            <div class="col-span-12 md:col-span-3">
              <small class="text-slate-500 block">Tanggal</small>
              <strong>{{ detail.opname.opname_date }}</strong>
            </div>

            <div class="col-span-12 md:col-span-3">
              <small class="text-slate-500 block">Status</small>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="detail.opname.status === 'posted' ? 'bg-success' : 'bg-warning text-dark'">
                {{ detail.opname.status }}
              </span>
            </div>

            <div class="col-span-12 md:col-span-3">
              <small class="text-slate-500 block">Jumlah Batch</small>
              <strong>{{ detail.items.length }}</strong>
            </div>

            <div class="col-span-12">
              <small class="text-slate-500 block">Catatan</small>
              {{ detail.opname.notes || "-" }}
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="card-header flex justify-between items-center flex-wrap gap-2">
          <div>
            <h5 class="mb-0">Penghitungan Batch</h5>
            <small class="text-slate-500"> Saldo sistem dibandingkan dengan jumlah fisik. </small>
          </div>

          <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 text-dark"> {{ detail.items.length }} batch </span>
        </div>

        <div class="p-5">
          <div class="w-full overflow-x-auto">
            <table class="w-full border-collapse text-sm align-middle">
              <thead>
                <tr>
                  <th>Produk / Batch</th>
                  <th>Expired</th>
                  <th class="text-right">Saldo Sistem</th>
                  <th style="min-width: 140px">Jumlah Fisik</th>
                  <th class="text-right">Selisih</th>
                  <th style="min-width: 180px">Catatan</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in detail.items" :key="item.id">
                  <td>
                    <strong>{{ item.product_name || item.sku || `Produk #${item.product_id}` }}</strong>
                    <small class="block text-slate-500">
                      {{ item.batch_number || `Batch #${item.batch_id}` }}
                    </small>
                  </td>

                  <td>{{ item.expired_at || "-" }}</td>

                  <td class="text-right">
                    {{ formatNumber(item.system_quantity) }}
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm"
                      :value="item.counted_quantity !== null && item.counted_quantity !== undefined ? Number(item.counted_quantity) : ''"
                      :disabled="!isDraft"
                      placeholder="Jumlah fisik"
                      @input="updateCount(item, ($event.target as HTMLInputElement).value)"
                    />
                  </td>

                  <td class="text-right">
                    <span v-if="item.difference_quantity !== null" :class="Number(item.difference_quantity) < 0 ? 'text-danger' : Number(item.difference_quantity) > 0 ? 'text-success' : 'text-muted'">
                      {{ formatNumber(item.difference_quantity) }}
                    </span>
                    <span v-else class="text-slate-500">-</span>
                  </td>

                  <td>
                    <input v-model="item.notes" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm" :disabled="!isDraft" placeholder="Catatan" />
                  </td>
                </tr>

                <tr v-if="detail.items.length === 0">
                  <td colspan="6" class="text-center text-slate-500 py-4">Tidak ada batch dalam stock opname ini.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex flex-wrap justify-between items-center gap-3 mt-3">
            <div>
              <small class="text-slate-500 block">Total selisih kuantitas</small>
              <strong>{{ formatNumber(totalDifference) }}</strong>
            </div>

            <div v-if="isDraft" class="flex gap-2">
              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50" :disabled="saving || posting || !detail.items.length" @click="saveCounts">
                <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
                Simpan Penghitungan
              </button>

              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-success" :disabled="!allCounted || saving || posting" @click="postOpname">
                <span v-if="posting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
                Posting Opname
              </button>
            </div>

            <span v-else class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700"> Stock Opname sudah diposting </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
