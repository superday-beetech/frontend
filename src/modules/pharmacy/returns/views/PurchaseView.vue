<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import returnsService from "../api/returns.api";

interface PurchaseReturn {
  id: number;
  return_number: string;
  supplier_id: number;
  supplier_name: string;
  goods_receipt_id: number;
  receipt_number: string;
  return_date: string;
  status: string;
  reason: string | null;
  total_amount: number;
  notes: string | null;
  created_at?: string;
  items?: PurchaseReturnItem[];
}

interface PurchaseReturnItem {
  id: number;
  product_name: string;
  sku?: string;
  batch_number: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  notes?: string;
}

const returns = ref<PurchaseReturn[]>([]);
const selectedReturn = ref<PurchaseReturn | null>(null);

const loading = ref(false);
const loadingDetail = ref(false);
const posting = ref(false);

const errorMessage = ref("");
const successMessage = ref("");

const search = ref("");
const statusFilter = ref("");

const filteredReturns = computed(() => {
  const keyword = search.value.toLowerCase().trim();

  return returns.value.filter((item) => {
    const matchesSearch = !keyword || item.return_number?.toLowerCase().includes(keyword) || item.supplier_name?.toLowerCase().includes(keyword) || item.receipt_number?.toLowerCase().includes(keyword);

    const matchesStatus = !statusFilter.value || item.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

function getResponseData(response: any): any {
  return response?.data?.data;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string): string {
  if (!value) return "-";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    posted: "Sudah Diposting",
    cancelled: "Dibatalkan",
  };

  return labels[status] || status;
}

function statusClass(status: string): string {
  const classes: Record<string, string> = {
    draft: "bg-warning text-dark",
    posted: "bg-success",
    cancelled: "bg-danger",
  };

  return classes[status] || "bg-secondary";
}

async function loadReturns() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await returnsService.listPurchase();

    const data = getResponseData(response);

    returns.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Gagal mengambil daftar Purchase Return.";
  } finally {
    loading.value = false;
  }
}

async function showDetail(id: number) {
  selectedReturn.value = null;
  loadingDetail.value = true;
  errorMessage.value = "";

  try {
    const response = await returnsService.showPurchase(id);

    selectedReturn.value = getResponseData(response);
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Gagal mengambil detail Purchase Return.";
  } finally {
    loadingDetail.value = false;
  }
}

async function postReturn(item: PurchaseReturn) {
  if (item.status !== "draft") {
    return;
  }

  const confirmed = window.confirm(`Posting Purchase Return ${item.return_number}?\n\n` + "Stok batch akan dikurangi dan transaksi tidak dapat diposting ulang.");

  if (!confirmed) return;

  posting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await returnsService.postPurchase(item.id);

    successMessage.value = response.data?.message || "Purchase Return berhasil diposting.";

    await loadReturns();

    if (selectedReturn.value?.id === item.id) {
      await showDetail(item.id);
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Gagal memposting Purchase Return.";
  } finally {
    posting.value = false;
  }
}

onMounted(loadReturns);
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="mb-1">Purchase Return</h4>
        <p class="text-slate-500 mb-0">Pengelolaan retur pembelian kepada supplier.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="$router.push('/pharmacy/returns/purchase/purchase-create')">
        <i class="ti ti-plus me-1"></i>
        Buat Purchase Return
      </button>
    </div>

    <div v-if="errorMessage" class="rounded-lg border px-4 py-3 text-sm border-rose-200 bg-rose-50 text-rose-800 alert-dismissible" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div v-if="successMessage" class="rounded-lg border px-4 py-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-800 alert-dismissible" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
      <div class="p-5">
        <div class="grid grid-cols-12 g-3">
          <div class="col-span-12 md:col-span-6">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pencarian</label>
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nomor retur, supplier, atau receipt..." />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select v-model="statusFilter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="posted">Sudah Diposting</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-3 flex items-end">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-slate-300 text-slate-700 hover:bg-slate-50 w-full" :disabled="loading" @click="loadReturns">
              <i class="ti ti-refresh me-1"></i>
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="card-header flex justify-between items-center">
        <h5 class="mb-0">Daftar Purchase Return</h5>

        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-primary"> {{ filteredReturns.length }} Transaksi </span>
      </div>

      <div class="p-5">
        <div v-if="loading" class="text-center py-5">
          <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
          <p class="text-slate-500 mt-2 mb-0">Memuat data Purchase Return...</p>
        </div>

        <div v-else-if="filteredReturns.length === 0" class="text-center text-slate-500 py-5">
          <i class="ti ti-file-off fs-7"></i>
          <p class="mt-2 mb-0">Belum ada Purchase Return.</p>
        </div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead class="table-light">
              <tr>
                <th>Nomor Retur</th>
                <th>Tanggal</th>
                <th>Supplier</th>
                <th>Goods Receipt</th>
                <th class="text-right">Total</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredReturns" :key="item.id">
                <td>
                  <strong>{{ item.return_number }}</strong>
                </td>

                <td>{{ formatDate(item.return_date) }}</td>

                <td>{{ item.supplier_name || "-" }}</td>

                <td>{{ item.receipt_number || "-" }}</td>

                <td class="text-right">
                  {{ formatCurrency(item.total_amount) }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="flex justify-center gap-1">
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" title="Detail" @click="showDetail(item.id)">
                      <i class="ti ti-eye"></i>
                    </button>

                    <button v-if="item.status === 'draft'" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs btn-success" title="Posting" :disabled="posting" @click="postReturn(item)">
                      <i class="ti ti-check"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="loadingDetail" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-4">
      <div class="p-5 text-center py-4">
        <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
        <p class="text-slate-500 mt-2 mb-0">Memuat detail retur...</p>
      </div>
    </div>

    <div v-if="selectedReturn" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-4">
      <div class="card-header flex justify-between items-center">
        <div>
          <h5 class="mb-1">Detail {{ selectedReturn.return_number }}</h5>
          <small class="text-slate-500"> Purchase Return #{{ selectedReturn.id }} </small>
        </div>

        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" @click="selectedReturn = null">
          <i class="ti ti-x me-1"></i>
          Tutup
        </button>
      </div>

      <div class="p-5">
        <div class="grid grid-cols-12 g-3 mb-4">
          <div class="col-span-12 md:col-span-3">
            <small class="text-slate-500 block">Supplier</small>
            <strong>{{ selectedReturn.supplier_name || "-" }}</strong>
          </div>

          <div class="col-span-12 md:col-span-3">
            <small class="text-slate-500 block">Goods Receipt</small>
            <strong>{{ selectedReturn.receipt_number || "-" }}</strong>
          </div>

          <div class="col-span-12 md:col-span-3">
            <small class="text-slate-500 block">Tanggal Retur</small>
            <strong>{{ formatDate(selectedReturn.return_date) }}</strong>
          </div>

          <div class="col-span-12 md:col-span-3">
            <small class="text-slate-500 block">Status</small>
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(selectedReturn.status)">
              {{ statusLabel(selectedReturn.status) }}
            </span>
          </div>

          <div class="col-span-12 md:col-span-6">
            <small class="text-slate-500 block">Alasan</small>
            {{ selectedReturn.reason || "-" }}
          </div>

          <div class="col-span-12 md:col-span-6">
            <small class="text-slate-500 block">Catatan</small>
            {{ selectedReturn.notes || "-" }}
          </div>
        </div>

        <h6 class="mb-3">Item Retur</h6>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th>Produk</th>
                <th>Batch</th>
                <th class="text-right">Kuantitas</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Subtotal</th>
                <th>Catatan</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in selectedReturn.items || []" :key="item.id">
                <td>
                  <strong>{{ item.product_name || "-" }}</strong>
                  <small v-if="item.sku" class="block text-slate-500"> SKU: {{ item.sku }} </small>
                </td>

                <td>{{ item.batch_number || "-" }}</td>

                <td class="text-right">{{ item.quantity }}</td>

                <td class="text-right">
                  {{ formatCurrency(item.unit_cost) }}
                </td>

                <td class="text-right">
                  {{ formatCurrency(item.subtotal) }}
                </td>

                <td>{{ item.notes || "-" }}</td>
              </tr>

              <tr v-if="!selectedReturn.items?.length">
                <td colspan="6" class="text-center text-slate-500">Tidak ada item retur.</td>
              </tr>
            </tbody>

            <tfoot>
              <tr>
                <th colspan="4" class="text-right">Total Retur</th>
                <th class="text-right">
                  {{ formatCurrency(selectedReturn.total_amount) }}
                </th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div v-if="selectedReturn.status === 'draft'" class="text-right mt-3">
          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-success" :disabled="posting" @click="postReturn(selectedReturn)">
            <i class="ti ti-check me-1"></i>
            Posting Purchase Return
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
