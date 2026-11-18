<script setup lang="ts">
import { onMounted, ref } from "vue";
import { inventory.api } from "../api/inventory.api";
import type { InventoryPagination, StockMovement } from "../types/inventory";
import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

const rows = ref<StockMovement[]>([]);
const loading = ref(false);

const search = ref("");
const movementType = ref("");
const dateFrom = ref("");
const dateTo = ref("");

const page = ref(1);
const perPage = ref(10);

const pagination = ref<InventoryPagination>({
  page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
});

async function loadData(): Promise<void> {
  loading.value = true;

  try {
    const result = await inventory.api.getMovements({
      page: page.value,
      per_page: perPage.value,
      search: search.value.trim() || undefined,
      movement_type: movementType.value || undefined,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
    });

    rows.value = result.items ?? [];
    pagination.value = result.pagination;
  } catch (error) {
    console.error("Gagal memuat mutasi stok:", error);
    toast.error("Gagal memuat riwayat mutasi stok.");
  } finally {
    loading.value = false;
  }
}

function searchData(): void {
  page.value = 1;
  loadData();
}

function resetFilters(): void {
  search.value = "";
  movementType.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  page.value = 1;
  loadData();
}

function changePage(nextPage: number): void {
  if (nextPage < 1 || nextPage > pagination.value.total_pages || nextPage === page.value) {
    return;
  }

  page.value = nextPage;
  loadData();
}

function changePerPage(value: number | string): void {
  perPage.value = Number(value);
  page.value = 1;
  loadData();
}

function formatNumber(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

onMounted(loadData);
</script>

<template>
  <div class="w-full">
    <div class="d-md-flex items-center justify-between mb-4">
      <div>
        <h4 class="mb-1">Stock Movements</h4>
        <p class="text-slate-500 mb-0">Riwayat seluruh transaksi stok masuk dan keluar.</p>
      </div>

      <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 mt-3 mt-md-0" :disabled="loading" @click="loadData">
        <i class="ti ti-refresh me-1"></i>
        Refresh
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-3 items-end mb-3">
          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cari Mutasi</label>
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="SKU, produk, batch, atau catatan..." @keyup.enter="searchData" />
          </div>

          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Jenis Mutasi</label>
            <select v-model="movementType" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option value="">Semua</option>
              <option value="in">Stok Masuk</option>
              <option value="out">Stok Keluar</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Dari Tanggal</label>
            <input v-model="dateFrom" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>

          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Sampai Tanggal</label>
            <input v-model="dateTo" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>

          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Per Halaman</label>
            <select class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :value="perPage" @change="changePerPage(($event.target as HTMLSelectElement).value)">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="col-span-12 flex gap-2">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="loading" @click="searchData">
              <i class="ti ti-search me-1"></i>
              Terapkan Filter
            </button>

            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="loading" @click="resetFilters">Reset</button>
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th>No.</th>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Batch</th>
                <th>Referensi</th>
                <th class="text-right">Masuk</th>
                <th class="text-right">Keluar</th>
                <th class="text-right">Biaya / Unit</th>
                <th>Catatan</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></div>
                  Memuat mutasi stok...
                </td>
              </tr>

              <tr v-else-if="rows.length === 0">
                <td colspan="9" class="text-center text-slate-500 py-5">Riwayat mutasi stok tidak ditemukan.</td>
              </tr>

              <tr v-for="(item, index) in rows" :key="item.id">
                <td>{{ (page - 1) * perPage + index + 1 }}</td>

                <td>{{ formatDate(item.movement_date) }}</td>

                <td>
                  <div class="font-semibold">{{ item.product_name }}</div>
                  <small class="text-slate-500">{{ item.sku }}</small>
                </td>

                <td>{{ item.batch_number || "-" }}</td>

                <td>
                  <div>{{ item.reference_type }}</div>
                  <small class="text-slate-500"> #{{ item.reference_id }} </small>
                </td>

                <td class="text-right">
                  <span :class="Number(item.quantity_in) > 0 ? 'text-success fw-semibold' : 'text-muted'">
                    {{ formatNumber(item.quantity_in) }}
                  </span>
                </td>

                <td class="text-right">
                  <span :class="Number(item.quantity_out) > 0 ? 'text-danger fw-semibold' : 'text-muted'">
                    {{ formatNumber(item.quantity_out) }}
                  </span>
                </td>

                <td class="text-right">
                  {{ formatCurrency(item.unit_cost) }}
                </td>

                <td>
                  <span class="text-slate-500">
                    {{ item.notes || "-" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.total > 0" class="flex flex-wrap items-center justify-between gap-3 mt-3">
          <small class="text-slate-500"> Total {{ pagination.total }} mutasi · Halaman {{ pagination.page }} dari {{ pagination.total_pages }} </small>

          <div class="btn-group">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 text-xs" :disabled="!pagination.has_prev || loading" @click="changePage(page - 1)">Sebelumnya</button>
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 text-xs" :disabled="!pagination.has_next || loading" @click="changePage(page + 1)">Berikutnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
