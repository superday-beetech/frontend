<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { usePharmacyDashboard } from "@/modules/pharmacy/master/composables/usePharmacyDashboard";

import type { DashboardOverview, ExpiringBatch, CashFlowItem, TopSellingItem } from "@/modules/pharmacy/master/types/dashboard";

const { loading, error, overview, cashFlow, topSelling, setDateRange, refresh } = usePharmacyDashboard();

function localDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = new Date();

const fromDate = ref(localDate(new Date(today.getFullYear(), today.getMonth(), 1)));

const toDate = ref(localDate(today));

const overviewData = computed<DashboardOverview | null>(() => overview.value?.data ?? null);

const expiringData = computed<ExpiringBatch[]>(() => overviewData.value?.expiring_batches ?? []);

const cashFlowData = computed<CashFlowItem[]>(() => cashFlow.value?.data ?? []);

const topSellingData = computed<TopSellingItem[]>(() => topSelling.value?.data ?? []);

const cashFlowMax = computed(() => {
  const values = cashFlowData.value.flatMap((item) => [Number(item.cash_in), Number(item.cash_out)]);

  return Math.max(...values, 1);
});

const hasDateRange = computed(() => fromDate.value <= toDate.value);

async function applyPeriod(): Promise<void> {
  if (!hasDateRange.value) return;

  await setDateRange({
    from: fromDate.value,
    to: toDate.value,
  });
}

function formatNumber(value: number | string | null | undefined): string {
  return Number(value ?? 0).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function formatCurrency(value: number | string | null | undefined): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function barHeight(value: number): string {
  return `${Math.max(2, (Number(value) / cashFlowMax.value) * 100)}%`;
}

function daysUntilExpired(value: string): number {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const expiredDate = new Date(`${value}T00:00:00`);

  return Math.ceil((expiredDate.getTime() - todayDate.getTime()) / 86400000);
}

function expiryLabel(value: string): string {
  const days = daysUntilExpired(value);

  if (days < 0) return "Kedaluwarsa";
  if (days === 0) return "Hari ini";
  if (days === 1) return "Besok";

  return `${days} hari lagi`;
}

onMounted(() => {
  void applyPeriod();
});
</script>

<template>
  <div class="pharmacy-dashboard">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1 font-bold">Dashboard Pharmacy</h4>
        <p class="text-slate-500 mb-0">Ringkasan operasional dan keuangan apotek.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50" :disabled="loading" @click="refresh">
        <span v-if="loading" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></span>
        {{ loading ? "Memuat..." : "Refresh Data" }}
      </button>
    </div>

    <!-- Filter Periode -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm mb-4">
      <div class="p-5">
        <div class="grid grid-cols-12 items-end g-3">
          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Awal</label>
            <input v-model="fromDate" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Akhir</label>
            <input v-model="toDate" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :min="fromDate" />
          </div>

          <div class="col-span-12 md:col-span-4">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 w-full" :disabled="loading || !hasDateRange" @click="applyPeriod">Terapkan Periode</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border px-4 py-3 text-sm border-amber-200 bg-amber-50 text-amber-800" role="alert">
      <strong>Informasi:</strong>
      <pre class="mb-0 mt-2 text-wrap">{{ error }}</pre>
      Sebagian data dashboard mungkin belum berhasil dimuat.
    </div>

    <!-- Loading -->
    <div v-if="loading && !overviewData" class="text-center py-5">
      <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
      <p class="text-slate-500 mt-3 mb-0">Memuat data dashboard...</p>
    </div>

    <template v-else>
      <!-- Stock Cards -->
      <div class="section-heading mb-3">
        <h5 class="font-bold mb-0">Ringkasan Persediaan</h5>
      </div>

      <div class="grid grid-cols-12 g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="text-slate-500 mb-2">Total Produk</div>
              <h3 class="font-bold mb-1">
                {{ formatNumber(overviewData?.stock.total_products) }}
              </h3>
              <small class="text-slate-500">Produk terdaftar</small>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="text-slate-500 mb-2">Total Batch</div>
              <h3 class="font-bold mb-1">
                {{ formatNumber(overviewData?.stock.total_batches) }}
              </h3>
              <small class="text-slate-500">Batch dengan stok tersedia</small>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="text-slate-500 mb-2">Kuantitas Stok</div>
              <h3 class="font-bold mb-1">
                {{ formatNumber(overviewData?.stock.total_quantity) }}
              </h3>
              <small class="text-slate-500">Total kuantitas tersedia</small>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="text-slate-500 mb-2">Nilai Persediaan</div>
              <h3 class="font-bold mb-1 dashboard-value">
                {{ formatCurrency(overviewData?.stock.stock_value) }}
              </h3>
              <small class="text-slate-500">
                {{ formatNumber(overviewData?.stock.expired_batches) }}
                batch kedaluwarsa
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Procurement & Distribution -->
      <div class="grid grid-cols-12 g-3 mb-4">
        <div class="col-xl-6">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 font-bold">Pengadaan</h5>
            </div>

            <div class="p-5">
              <div class="grid grid-cols-12 g-3">
                <div class="col-6">
                  <div class="metric-label">Purchase Order</div>
                  <h4 class="font-bold">
                    {{ formatNumber(overviewData?.procurement.total_orders) }}
                  </h4>
                </div>

                <div class="col-6">
                  <div class="metric-label">Penerimaan Barang</div>
                  <h4 class="font-bold">
                    {{ formatNumber(overviewData?.procurement.total_receipts) }}
                  </h4>
                </div>

                <div class="col-6">
                  <div class="metric-label">Nilai Purchase Order</div>
                  <div class="font-semibold">
                    {{ formatCurrency(overviewData?.procurement.total_order_value) }}
                  </div>
                </div>

                <div class="col-6">
                  <div class="metric-label">Nilai Penerimaan</div>
                  <div class="font-semibold">
                    {{ formatCurrency(overviewData?.procurement.total_received_value) }}
                  </div>
                </div>

                <div class="col-span-12">
                  <div class="metric-label">Kuantitas Diterima</div>
                  <h5 class="font-bold mb-0">
                    {{ formatNumber(overviewData?.procurement.total_received_quantity) }}
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 font-bold">Distribusi</h5>
            </div>

            <div class="p-5">
              <div class="grid grid-cols-12 g-3">
                <div class="col-6">
                  <div class="metric-label">Distribution Order</div>
                  <h4 class="font-bold">
                    {{ formatNumber(overviewData?.distribution.total_orders) }}
                  </h4>
                </div>

                <div class="col-6">
                  <div class="metric-label">Pengiriman</div>
                  <h4 class="font-bold">
                    {{ formatNumber(overviewData?.distribution.total_deliveries) }}
                  </h4>
                </div>

                <div class="col-6">
                  <div class="metric-label">Nilai Order</div>
                  <div class="font-semibold">
                    {{ formatCurrency(overviewData?.distribution.total_order_value) }}
                  </div>
                </div>

                <div class="col-6">
                  <div class="metric-label">Nilai Distribusi</div>
                  <div class="font-semibold">
                    {{ formatCurrency(overviewData?.distribution.total_dispatched_value) }}
                  </div>
                </div>

                <div class="col-span-12">
                  <div class="metric-label">Kuantitas Terkirim</div>
                  <h5 class="font-bold mb-0">
                    {{ formatNumber(overviewData?.distribution.total_dispatched_quantity) }}
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Finance -->
      <div class="section-heading mb-3">
        <h5 class="font-bold mb-0">Keuangan</h5>
      </div>

      <div class="grid grid-cols-12 g-3 mb-4">
        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="metric-label">Kas Masuk</div>
              <h5 class="font-bold text-emerald-600">
                {{ formatCurrency(overviewData?.finance.cash_in) }}
              </h5>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="metric-label">Kas Keluar</div>
              <h5 class="font-bold text-rose-600">
                {{ formatCurrency(overviewData?.finance.cash_out) }}
              </h5>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="metric-label">Arus Kas Bersih</div>
              <h5 class="font-bold">
                {{ formatCurrency(overviewData?.finance.net_cash_flow) }}
              </h5>
            </div>
          </div>
        </div>

        <div class="col-sm-6 col-xl-3">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dashboard-card border-0 shadow-sm h-full">
            <div class="p-5">
              <div class="metric-label">Total Pengeluaran</div>
              <h5 class="font-bold">
                {{ formatCurrency(overviewData?.finance.expense_amount) }}
              </h5>
              <small class="text-slate-500">
                {{ formatNumber(overviewData?.finance.total_expenses) }}
                transaksi biaya
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Outstanding -->
      <div class="section-heading mb-3">
        <h5 class="font-bold mb-0">Utang dan Piutang</h5>
      </div>

      <div class="grid grid-cols-12 g-3 mb-4">
        <div class="col-xl-6">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
            <div class="p-5">
              <h6 class="font-bold mb-3">Utang Supplier</h6>

              <div class="flex justify-between mb-2">
                <span class="text-slate-500">Total</span>
                <strong>
                  {{ formatCurrency(overviewData?.outstanding.supplier.total_amount) }}
                </strong>
              </div>

              <div class="flex justify-between mb-2">
                <span class="text-slate-500">Terbayar</span>
                <strong class="text-emerald-600">
                  {{ formatCurrency(overviewData?.outstanding.supplier.paid_amount) }}
                </strong>
              </div>

              <hr />

              <div class="flex justify-between">
                <span class="font-bold">Outstanding</span>
                <strong class="text-rose-600">
                  {{ formatCurrency(overviewData?.outstanding.supplier.outstanding_amount) }}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm h-full">
            <div class="p-5">
              <h6 class="font-bold mb-3">Piutang Pelanggan</h6>

              <div class="flex justify-between mb-2">
                <span class="text-slate-500">Total</span>
                <strong>
                  {{ formatCurrency(overviewData?.outstanding.customer.total_amount) }}
                </strong>
              </div>

              <div class="flex justify-between mb-2">
                <span class="text-slate-500">Terbayar</span>
                <strong class="text-emerald-600">
                  {{ formatCurrency(overviewData?.outstanding.customer.paid_amount) }}
                </strong>
              </div>

              <hr />

              <div class="flex justify-between">
                <span class="font-bold">Outstanding</span>
                <strong class="text-rose-600">
                  {{ formatCurrency(overviewData?.outstanding.customer.outstanding_amount) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Returns -->
      <div class="section-heading mb-3">
        <h5 class="font-bold mb-0">Retur</h5>
      </div>

      <div class="grid grid-cols-12 g-3 mb-4">
        <div class="col-span-12 md:col-span-6">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm">
            <div class="p-5">
              <h6 class="font-bold">Retur Pembelian</h6>
              <h4 class="font-bold">
                {{ formatNumber(overviewData?.returns.purchase.total_returns) }}
              </h4>
              <div class="metric-label">Total nilai retur</div>
              <strong>
                {{ formatCurrency(overviewData?.returns.purchase.total_value) }}
              </strong>
            </div>
          </div>
        </div>

        <div class="col-span-12 md:col-span-6">
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm">
            <div class="p-5">
              <h6 class="font-bold">Retur Penjualan</h6>
              <h4 class="font-bold">
                {{ formatNumber(overviewData?.returns.sales.total_returns) }}
              </h4>
              <div class="metric-label">Total nilai retur</div>
              <strong>
                {{ formatCurrency(overviewData?.returns.sales.total_value) }}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Cash Flow Chart -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="font-bold mb-0">Grafik Arus Kas</h5>
        </div>

        <div class="p-5">
          <div class="flex gap-4 mb-3 flex-wrap">
            <span>
              <span class="legend-dot bg-emerald-100 text-emerald-700"></span>
              Kas Masuk
            </span>
            <span>
              <span class="legend-dot bg-rose-100 text-rose-700"></span>
              Kas Keluar
            </span>
          </div>

          <div v-if="cashFlowData.length" class="cash-chart">
            <div v-for="item in cashFlowData" :key="item.date" class="cash-chart-item">
              <div class="cash-bars">
                <div class="cash-bar bg-emerald-100 text-emerald-700" :style="{ height: barHeight(item.cash_in) }" :title="`Masuk: ${formatCurrency(item.cash_in)}`"></div>

                <div class="cash-bar bg-rose-100 text-rose-700" :style="{ height: barHeight(item.cash_out) }" :title="`Keluar: ${formatCurrency(item.cash_out)}`"></div>
              </div>

              <small class="text-slate-500">
                {{ item.date.slice(8, 10) }}
              </small>
            </div>
          </div>

          <div v-else class="text-center text-slate-500 py-5">Belum ada transaksi kas pada periode ini.</div>
        </div>
      </div>

      <!-- Expiring Batches -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3 flex justify-between items-center">
          <h5 class="font-bold mb-0">Batch Mendekati Kedaluwarsa</h5>
          <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 text-dark"> {{ expiringData.length }} batch </span>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Produk</th>
                <th>Nomor Batch</th>
                <th>Kedaluwarsa</th>
                <th>Sisa Stok</th>
                <th>Nilai Stok</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in expiringData" :key="item.id">
                <td>
                  <div class="font-semibold">
                    {{ item.product_name }}
                  </div>
                  <small class="text-slate-500">
                    {{ item.sku }}
                  </small>
                </td>

                <td>{{ item.batch_number }}</td>

                <td>{{ formatDate(item.expired_at) }}</td>

                <td>{{ formatNumber(item.quantity_remaining) }}</td>

                <td>{{ formatCurrency(item.stock_value) }}</td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="daysUntilExpired(item.expired_at) <= 7 ? 'bg-danger' : 'bg-warning text-dark'">
                    {{ expiryLabel(item.expired_at) }}
                  </span>
                </td>
              </tr>

              <tr v-if="!expiringData.length">
                <td colspan="6" class="text-center text-slate-500 py-4">Tidak ada batch yang mendekati kedaluwarsa.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Selling -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="font-bold mb-0">Produk Terlaris</h5>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th width="60">#</th>
                <th>Produk</th>
                <th>Total Terjual</th>
                <th>Nilai Penjualan</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in topSellingData" :key="item.product_id">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="font-semibold">
                    {{ item.product_name }}
                  </div>
                  <small class="text-slate-500">
                    {{ item.sku }}
                  </small>
                </td>
                <td>{{ formatNumber(item.total_quantity) }}</td>
                <td>{{ formatCurrency(item.total_value) }}</td>
              </tr>

              <tr v-if="!topSellingData.length">
                <td colspan="4" class="text-center text-slate-500 py-4">Belum ada data penjualan pada periode ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pharmacy-dashboard {
  width: 100%;
}

.dashboard-card {
  transition: box-shadow 0.2s ease;
}

.dashboard-card:hover {
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.08) !important;
}

.dashboard-value {
  font-size: 1.35rem;
  overflow-wrap: anywhere;
}

.metric-label {
  color: var(--bs-secondary-color, #6c757d);
  font-size: 0.85rem;
  margin-bottom: 7px;
}

.section-heading {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--bs-border-color, #dee2e6);
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.cash-chart {
  height: 230px;
  display: flex;
  align-items: stretch;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 5px 0;
  border-bottom: 1px solid var(--bs-border-color, #dee2e6);
}

.cash-chart-item {
  min-width: 35px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.cash-bars {
  width: 100%;
  height: 190px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 3px;
}

.cash-bar {
  width: 12px;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
  transition: height 0.2s ease;
}

.table th {
  white-space: nowrap;
  font-size: 0.85rem;
}

.table td {
  font-size: 0.875rem;
}
</style>
