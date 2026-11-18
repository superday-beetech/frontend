<script setup lang="ts">
import { onMounted, ref } from "vue";
import { inventory.api } from "../api/inventory.api";
import type { InventoryPagination, ProductBatch } from "../types/inventory";
import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

const rows = ref<ProductBatch[]>([]);
const loading = ref(false);
const detailLoading = ref(false);

const search = ref("");
const status = ref("");
const page = ref(1);
const perPage = ref(10);

const selectedBatch = ref<ProductBatch | null>(null);

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
    const result = await inventory.api.getBatches({
      page: page.value,
      per_page: perPage.value,
      search: search.value.trim() || undefined,
      status: status.value || undefined,
    });

    rows.value = result.items ?? [];
    pagination.value = result.pagination;
  } catch (error) {
    console.error("Gagal memuat batch:", error);
    toast.error("Gagal memuat data batch.");
  } finally {
    loading.value = false;
  }
}

async function showDetail(id: number): Promise<void> {
  detailLoading.value = true;
  selectedBatch.value = null;

  try {
    selectedBatch.value = await inventory.api.getBatchDetail(id);
  } catch (error) {
    console.error("Gagal memuat detail batch:", error);
    toast.error("Gagal memuat detail batch.");
  } finally {
    detailLoading.value = false;
  }
}

function searchData(): void {
  page.value = 1;
  selectedBatch.value = null;
  loadData();
}

function changePage(nextPage: number): void {
  if (nextPage < 1 || nextPage > pagination.value.total_pages || nextPage === page.value) {
    return;
  }

  page.value = nextPage;
  selectedBatch.value = null;
  loadData();
}

function changePerPage(value: number | string): void {
  perPage.value = Number(value);
  page.value = 1;
  selectedBatch.value = null;
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

function formatDate(value: string | null): string {
  if (!value) return "-";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isExpired(value: string | null): boolean {
  if (!value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${value.slice(0, 10)}T00:00:00`);

  return expiry < today;
}

onMounted(loadData);
</script>

<template>
  <div class="w-full">
    <div class="d-md-flex items-center justify-between mb-4">
      <div>
        <h4 class="mb-1">Product Batches</h4>
        <p class="text-slate-500 mb-0">Daftar batch, tanggal kedaluwarsa, dan sisa persediaan.</p>
      </div>

      <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 mt-3 mt-md-0" :disabled="loading" @click="loadData">
        <i class="ti ti-refresh me-1"></i>
        Refresh
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-2 items-end mb-3">
          <div class="col-md-5">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cari Batch / Produk</label>
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nomor batch, SKU, atau nama produk..." @keyup.enter="searchData" />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select v-model="status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option value="">Semua Status</option>
              <option value="available">Available</option>
            </select>
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
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 w-full" :disabled="loading" @click="searchData">
              <i class="ti ti-search me-1"></i>
              Cari
            </button>
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th>No.</th>
                <th>Produk</th>
                <th>Nomor Batch</th>
                <th>Kedaluwarsa</th>
                <th class="text-right">Diterima</th>
                <th class="text-right">Sisa Stok</th>
                <th class="text-right">Biaya / Unit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-5">
                  <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></div>
                  Memuat batch...
                </td>
              </tr>

              <tr v-else-if="rows.length === 0">
                <td colspan="9" class="text-center text-slate-500 py-5">Data batch tidak ditemukan.</td>
              </tr>

              <tr v-for="(item, index) in rows" :key="item.id">
                <td>{{ (page - 1) * perPage + index + 1 }}</td>

                <td>
                  <div class="font-semibold">{{ item.product_name }}</div>
                  <small class="text-slate-500">{{ item.sku }}</small>
                </td>

                <td>{{ item.batch_number }}</td>

                <td>
                  <span :class="isExpired(item.expired_at) ? 'text-danger fw-semibold' : ''">
                    {{ formatDate(item.expired_at) }}
                  </span>
                </td>

                <td class="text-right">
                  {{ formatNumber(item.received_quantity) }}
                </td>

                <td class="text-right font-semibold">
                  {{ formatNumber(item.quantity_remaining) }}
                </td>

                <td class="text-right">
                  {{ formatCurrency(item.unit_cost) }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="item.status === 'available' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                    {{ item.status }}
                  </span>
                </td>

                <td class="text-right">
                  <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" :disabled="detailLoading" @click="showDetail(Number(item.id))">Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.total > 0" class="flex flex-wrap items-center justify-between gap-3 mt-3">
          <small class="text-slate-500"> Total {{ pagination.total }} batch · Halaman {{ pagination.page }} dari {{ pagination.total_pages }} </small>

          <div class="btn-group">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 text-xs" :disabled="!pagination.has_prev || loading" @click="changePage(page - 1)">Sebelumnya</button>
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 text-xs" :disabled="!pagination.has_next || loading" @click="changePage(page + 1)">Berikutnya</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="detailLoading || selectedBatch" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-4">
      <div class="card-header flex items-center justify-between">
        <h5 class="mb-0">Detail Product Batch</h5>

        <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" @click="selectedBatch = null">Tutup</button>
      </div>

      <div v-if="detailLoading" class="p-5 text-center py-4">
        <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></div>
        Memuat detail batch...
      </div>

      <div v-else-if="selectedBatch" class="p-5">
        <div class="grid grid-cols-12 g-3">
          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Produk</small>
            <strong>{{ selectedBatch.product_name }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">SKU</small>
            <strong>{{ selectedBatch.sku }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Nomor Batch</small>
            <strong>{{ selectedBatch.batch_number }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Tanggal Kedaluwarsa</small>
            <strong>{{ formatDate(selectedBatch.expired_at) }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Jumlah Diterima</small>
            <strong>{{ formatNumber(selectedBatch.received_quantity) }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Sisa Stok</small>
            <strong>{{ formatNumber(selectedBatch.quantity_remaining) }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Biaya per Unit</small>
            <strong>{{ formatCurrency(selectedBatch.unit_cost) }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Status</small>
            <strong>{{ selectedBatch.status }}</strong>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block">Goods Receipt Item ID</small>
            <strong>{{ selectedBatch.goods_receipt_item_id }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
