<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import report.api from "../api/report.api";
import type { StockSummaryFilter, StockSummaryItem, StockSummaryReport } from "../api/report.api";

const loading = ref(false);
const exporting = ref(false);
const errorMessage = ref("");

const items = ref<StockSummaryItem[]>([]);
const report = ref<StockSummaryReport | null>(null);

const keyword = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const page = ref(1);
const perPage = ref(20);

const pagination = computed(() => report.value?.pagination);
const summary = computed(() => report.value?.summary);

const formatNumber = (value: number | string | null | undefined) =>
  Number(value || 0).toLocaleString("id-ID", {
    maximumFractionDigits: 3,
  });

const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value: string) => {
  if (!value) return "-";

  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function getToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function getMonthStart(): string {
  return `${getToday().slice(0, 7)}-01`;
}

function getFilters(): StockSummaryFilter {
  return {
    keyword: keyword.value.trim() || undefined,
    date_from: dateFrom.value,
    date_to: dateTo.value,
    page: page.value,
    per_page: perPage.value,
  };
}

function getExportFilters(): StockSummaryFilter {
  return {
    keyword: keyword.value.trim() || undefined,
    date_from: dateFrom.value,
    date_to: dateTo.value,
  };
}

function validatePeriod(): boolean {
  if (!dateFrom.value || !dateTo.value) {
    errorMessage.value = "Tanggal mulai dan tanggal akhir wajib diisi.";
    return false;
  }

  if (dateFrom.value > dateTo.value) {
    errorMessage.value = "Tanggal mulai tidak boleh melebihi tanggal akhir.";
    return false;
  }

  return true;
}

async function loadData() {
  if (!validatePeriod()) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const result = await report.api.getStockSummary(getFilters());

    report.value = result;
    items.value = result.items || [];
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || "Gagal memuat laporan ringkasan stok.";

    items.value = [];
    report.value = null;
  } finally {
    loading.value = false;
  }
}

function search() {
  page.value = 1;
  loadData();
}

function resetFilter() {
  keyword.value = "";
  dateFrom.value = getMonthStart();
  dateTo.value = getToday();
  page.value = 1;

  loadData();
}

function changePage(nextPage: number) {
  if (!pagination.value || nextPage < 1 || nextPage > pagination.value.total_pages) {
    return;
  }

  page.value = nextPage;
  loadData();
}

function changePerPage() {
  page.value = 1;
  loadData();
}

/**
 * Mengunduh Blob dari backend.
 */
function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function getFilename(extension: string): string {
  return `stock-summary-${dateFrom.value}-${dateTo.value}.${extension}`;
}

/**
 * Ekspor CSV melalui backend.
 */
async function exportCsv() {
  if (loading.value || exporting.value) return;
  if (!validatePeriod()) return;

  exporting.value = true;
  errorMessage.value = "";

  try {
    const blob = await report.api.downloadStockSummaryCsv(getExportFilters());

    saveBlob(blob, getFilename("csv"));
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || "Gagal mengekspor CSV.";
  } finally {
    exporting.value = false;
  }
}

/**
 * Ekspor Excel melalui backend.
 */
async function exportExcel() {
  if (loading.value || exporting.value) return;
  if (!validatePeriod()) return;

  exporting.value = true;
  errorMessage.value = "";

  try {
    const blob = await report.api.downloadStockSummaryExcel(getExportFilters());

    saveBlob(blob, getFilename("xlsx"));
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || "Gagal mengekspor Excel.";
  } finally {
    exporting.value = false;
  }
}

/**
 * Membuka PDF dari backend.
 * PDF dapat dicetak melalui PDF viewer browser.
 */
async function printReport() {
  if (loading.value || exporting.value) return;
  if (!validatePeriod()) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    errorMessage.value = "Jendela PDF diblokir browser. Izinkan pop-up untuk membuka laporan.";
    return;
  }

  exporting.value = true;
  errorMessage.value = "";

  try {
    printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <title>Menyiapkan PDF</title>
            </head>
            <body style="font-family:Arial,sans-serif;padding:24px">
                Menyiapkan laporan PDF...
            </body>
            </html>
        `);

    printWindow.document.close();

    const blob = await report.api.downloadStockSummaryPdf(getExportFilters());

    const pdfUrl = URL.createObjectURL(blob);

    printWindow.location.href = pdfUrl;
  } catch (error: any) {
    printWindow.close();

    errorMessage.value = error?.response?.data?.message || error?.message || "Gagal menyiapkan PDF.";
  } finally {
    exporting.value = false;
  }
}

onMounted(() => {
  dateFrom.value = getMonthStart();
  dateTo.value = getToday();

  loadData();
});
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
      <div>
        <h4 class="mb-1">Stock Summary</h4>
        <p class="text-slate-500 mb-0">Laporan posisi dan mutasi stok per produk berdasarkan periode.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="loading || exporting" @click="printReport">
          <i class="ti ti-printer me-1"></i>
          Cetak / PDF
        </button>

        <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-outline-success" :disabled="loading || exporting" @click="exportCsv">
          <i class="ti ti-file-type-csv me-1"></i>
          CSV
        </button>

        <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-outline-success" :disabled="loading || exporting" @click="exportExcel">
          <i class="ti ti-file-spreadsheet me-1"></i>
          Excel
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" class="rounded-lg border px-4 py-3 text-sm border-rose-200 bg-rose-50 text-rose-800 alert-dismissible" role="alert">
      {{ errorMessage }}

      <button type="button" class="btn-close" aria-label="Close" @click="errorMessage = ''"></button>
    </div>
    <!-- Summary -->
    <div v-if="summary" class="grid grid-cols-12 g-3 mb-4">
      <div class="col-span-12 md:col-span-4 col-xl-2">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
          <div class="p-5">
            <small class="text-slate-500"> Jumlah Produk </small>

            <h4 class="mb-0">
              {{ formatNumber(summary.product_count) }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-4 col-xl-2">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
          <div class="p-5">
            <small class="text-slate-500"> Saldo Awal </small>

            <h4 class="mb-0">
              {{ formatNumber(summary.opening_stock) }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-4 col-xl-2">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
          <div class="p-5">
            <small class="text-slate-500"> Stok Masuk </small>

            <h4 class="mb-0 text-emerald-600">
              {{ formatNumber(summary.total_in) }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-4 col-xl-2">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
          <div class="p-5">
            <small class="text-slate-500"> Stok Keluar </small>

            <h4 class="mb-0 text-rose-600">
              {{ formatNumber(summary.total_out) }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-4 col-xl-2">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
          <div class="p-5">
            <small class="text-slate-500"> Saldo Akhir </small>

            <h4 class="mb-0">
              {{ formatNumber(summary.closing_stock) }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-4 col-xl-2">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
          <div class="p-5">
            <small class="text-slate-500"> Nilai Persediaan </small>

            <h5 class="mb-0">
              {{ formatCurrency(summary.stock_value) }}
            </h5>
          </div>
        </div>
      </div>
    </div>

    <!-- Expiry Summary -->
    <div v-if="summary" class="grid grid-cols-12 g-3 mb-4">
      <div class="col-span-12 md:col-span-6">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm">
          <div class="p-5">
            <small class="text-slate-500"> Batch Kedaluwarsa </small>

            <h5 class="mb-0 text-rose-600">
              {{ formatNumber(summary.expired_batch_count) }}
            </h5>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-6">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm">
          <div class="p-5">
            <small class="text-slate-500"> Batch Kedaluwarsa dalam 30 Hari </small>

            <h5 class="mb-0 text-warning">
              {{ formatNumber(summary.expiring_batch_count) }}
            </h5>
          </div>
        </div>
      </div>
    </div>
    <!-- Filters -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm mb-4">
      <div class="p-5">
        <form class="grid grid-cols-12 g-3 items-end" @submit.prevent="search">
          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Mulai </label>

            <input v-model="dateFrom" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Akhir </label>

            <input v-model="dateTo" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Cari Produk </label>

            <input v-model="keyword" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nama, SKU, atau barcode..." />
          </div>

          <div class="col-span-12 md:col-span-2 flex gap-2">
            <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="loading || exporting">
              <i class="ti ti-search me-1"></i>
              Terapkan
            </button>

            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="loading || exporting" @click="resetFilter">Reset</button>
          </div>
        </form>

        <div class="mt-3 small text-slate-500">
          Periode laporan:

          <strong>
            {{ formatDate(dateFrom) }}
            –
            {{ formatDate(dateTo) }}
          </strong>

          <span v-if="exporting" class="ms-2 text-primary-600">
            <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
            Menyiapkan file ekspor...
          </span>
        </div>
      </div>
    </div>

    <!-- Stock Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm">
      <div class="p-5">
        <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
          <h5 class="mb-0">Detail Stok per Produk</h5>

          <select v-model.number="perPage" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-select-sm" style="width: 100px" :disabled="loading || exporting" @change="changePerPage">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 table-bordered border-3 align-middle">
            <thead class="">
              <tr>
                <th>No.</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th class="text-right">Saldo Awal</th>
                <th class="text-right">Masuk</th>
                <th class="text-right">Keluar</th>
                <th class="text-right">Saldo Akhir</th>
                <th class="text-right">Harga Beli</th>
                <th class="text-right">Nilai Persediaan</th>
                <th class="text-center">Batch Expired</th>
              </tr>
            </thead>

            <tbody v-if="loading">
              <tr>
                <td colspan="10" class="text-center py-4">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></span>

                  Memuat laporan...
                </td>
              </tr>
            </tbody>

            <tbody v-else-if="items.length">
              <tr v-for="(item, index) in items" :key="item.product_id">
                <td>
                  {{ (page - 1) * perPage + index + 1 }}
                </td>

                <td>
                  <div class="font-semibold">
                    {{ item.product_name }}
                  </div>

                  <small class="text-slate-500">
                    {{ item.sku }}
                  </small>
                </td>

                <td>
                  {{ item.category_name || "-" }}
                </td>

                <td class="text-right">
                  {{ formatNumber(item.opening_stock) }}
                </td>

                <td class="text-right text-emerald-600">
                  {{ formatNumber(item.total_in) }}
                </td>

                <td class="text-right text-rose-600">
                  {{ formatNumber(item.total_out) }}
                </td>

                <td class="text-right font-semibold">
                  {{ formatNumber(item.closing_stock) }}
                  {{ item.unit_abbreviation || "" }}
                </td>

                <td class="text-right">
                  {{ formatCurrency(item.purchase_price) }}
                </td>

                <td class="text-right">
                  {{ formatCurrency(item.stock_value) }}
                </td>

                <td class="text-center">
                  <span v-if="Number(item.expired_batch_count) > 0" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-rose-100 text-rose-700">
                    {{ item.expired_batch_count }}
                  </span>

                  <span v-else class="text-slate-500"> 0 </span>
                </td>
              </tr>
            </tbody>

            <tbody v-else>
              <tr>
                <td colspan="10" class="text-center text-slate-500 py-4">Tidak ada data untuk periode ini.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-wrap justify-between items-center mt-3 gap-2">
          <small class="text-slate-500"> Menampilkan {{ items.length }} dari {{ pagination?.total || 0 }} produk </small>

          <div class="flex items-center gap-2">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="loading || exporting || page <= 1" @click="changePage(page - 1)">Sebelumnya</button>

            <span class="small">
              {{ pagination?.page || 1 }}
              /
              {{ pagination?.total_pages || 1 }}
            </span>

            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="loading || exporting || page >= (pagination?.total_pages || 1)" @click="changePage(page + 1)">Berikutnya</button>
          </div>
        </div>

        <!-- Report Notes -->
        <div class="small text-slate-500 mt-3">
          <div>Nilai persediaan merupakan estimasi berdasarkan saldo akhir dikalikan harga beli pada master produk.</div>

          <div>Data saldo dihitung dari histori stock movements.</div>

          <div>Jumlah batch kedaluwarsa mengikuti kondisi batch saat ini, bukan rekonstruksi historis pada tanggal laporan.</div>
        </div>
      </div>
    </div>
  </div>
</template>
