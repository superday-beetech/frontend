<script setup lang="ts">
import { onMounted, ref } from "vue";
import { inventory.api } from "../api/inventory.api";
import type { InventoryPagination, StockOverview } from "../types/inventory";
import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

const rows = ref<StockOverview[]>([]);
const loading = ref(false);
const search = ref("");
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
    const result = await inventory.api.getStockOverview({
      page: page.value,
      per_page: perPage.value,
      search: search.value.trim() || undefined,
    });

    rows.value = result.items ?? [];
    pagination.value = result.pagination;
  } catch (error) {
    console.error("Gagal memuat ringkasan stok:", error);
    toast.error("Gagal memuat ringkasan stok.");
  } finally {
    loading.value = false;
  }
}

function searchData(): void {
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

onMounted(loadData);
</script>

<template>
  <div class="w-full">
    <div class="d-md-flex items-center justify-between mb-4">
      <div>
        <h4 class="mb-1">Stock Overview</h4>
        <p class="text-slate-500 mb-0">Ringkasan persediaan produk berdasarkan batch.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 mt-3 mt-md-0" :disabled="loading" @click="loadData">
        <i class="ti ti-refresh me-1"></i>
        Refresh
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-2 items-end mb-3">
          <div class="col-span-12 md:col-span-6">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cari Produk</label>
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="SKU, barcode, atau nama produk..." @keyup.enter="searchData" />
          </div>

          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Per Halaman</label>
            <select class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :value="perPage" @change="changePerPage(($event.target as HTMLSelectElement).value)">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-2">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 w-full" :disabled="loading" @click="searchData">
              <i class="ti ti-search me-1"></i>
              Cari
            </button>
          </div>

          <div class="col-span-12 md:col-span-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200 w-full"
              :disabled="loading"
              @click="
                search = '';
                searchData();
              "
            >
              Reset
            </button>
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th style="width: 50px">No.</th>
                <th>SKU</th>
                <th>Produk</th>
                <th class="text-right">Stok Tersedia</th>
                <th class="text-right">Stok Kedaluwarsa</th>
                <th class="text-center">Jumlah Batch</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></div>
                  Memuat data stok...
                </td>
              </tr>

              <tr v-else-if="rows.length === 0">
                <td colspan="6" class="text-center text-slate-500 py-5">Data stok tidak ditemukan.</td>
              </tr>

              <tr v-for="(item, index) in rows" :key="item.product_id">
                <td>
                  {{ (page - 1) * perPage + index + 1 }}
                </td>
                <td>
                  <span class="font-semibold">{{ item.sku }}</span>
                  <div class="small text-slate-500">
                    {{ item.barcode || "-" }}
                  </div>
                </td>
                <td>{{ item.product_name }}</td>
                <td class="text-right font-semibold">
                  {{ formatNumber(item.available_stock) }}
                </td>
                <td class="text-right">
                  <span :class="Number(item.expired_stock) > 0 ? 'text-danger fw-semibold' : 'text-muted'">
                    {{ formatNumber(item.expired_stock) }}
                  </span>
                </td>
                <td class="text-center">
                  {{ item.batch_count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.total > 0" class="flex flex-wrap items-center justify-between gap-3 mt-3">
          <small class="text-slate-500"> Total {{ pagination.total }} produk · Halaman {{ pagination.page }} dari {{ pagination.total_pages }} </small>

          <div class="btn-group">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 text-xs" :disabled="!pagination.has_prev || loading" @click="changePage(page - 1)">Sebelumnya</button>
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 text-xs" :disabled="!pagination.has_next || loading" @click="changePage(page + 1)">Berikutnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
