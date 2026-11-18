<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import distributionService from "../api/distribution.api";
import type { DistributionOrder } from "../types/distribution";

import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

const router = useRouter();

const orders = ref<DistributionOrder[]>([]);
const loading = ref(false);
const search = ref("");
const statusFilter = ref("");

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "partially_delivered", label: "Sebagian Terkirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const filteredOrders = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  return orders.value.filter((order) => {
    const matchesSearch = !keyword || order.order_number.toLowerCase().includes(keyword) || String(order.customer_id).includes(keyword) || (order.customer_name ?? "").toLowerCase().includes(keyword);

    const matchesStatus = !statusFilter.value || order.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const totalOrders = computed(() => orders.value.length);

const draftCount = computed(() => orders.value.filter((item) => item.status === "draft").length);

const partialCount = computed(() => orders.value.filter((item) => item.status === "partially_delivered").length);

const completedCount = computed(() => orders.value.filter((item) => item.status === "completed").length);

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string | null): string {
  if (!value) return "-";

  const date = new Date(`${value.substring(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    partially_delivered: "Sebagian Terkirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return labels[status] ?? status;
}

function statusClass(status: string): string {
  const classes: Record<string, string> = {
    draft: "bg-light text-secondary",
    partially_delivered: "bg-warning-subtle text-warning",
    completed: "bg-success-subtle text-success",
    cancelled: "bg-danger-subtle text-danger",
  };

  return classes[status] ?? "bg-light text-secondary";
}

async function loadOrders() {
  loading.value = true;

  try {
    orders.value = await distributionService.getOrders();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal memuat pesanan distribusi.");
  } finally {
    loading.value = false;
  }
}

function openDetail(id: number | string) {
  router.push({
    path: "/pharmacy/distribution/distribution-order-detail",
    query: { id: String(id) },
  });
}

function createOrder() {
  router.push("/pharmacy/distribution/distribution-order-form");
}

onMounted(loadOrders);
</script>

<template>
  <div class="w-full">
    <!-- Page Header -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Pesanan Distribusi</h4>
        <p class="text-slate-500 mb-0">Pengelolaan pesanan penjualan dan distribusi produk.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="createOrder">
        <i class="ti ti-plus me-1"></i>
        Buat Pesanan
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-12 g-3 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-slate-500 mb-1">Total Pesanan</p>
                <h4 class="mb-0">{{ totalOrders }}</h4>
              </div>
              <div class="rounded-circle bg-primary-subtle p-3">
                <i class="ti ti-clipboard-list text-primary-600 fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-slate-500 mb-1">Draft</p>
                <h4 class="mb-0">{{ draftCount }}</h4>
              </div>
              <div class="rounded-circle bg-secondary-subtle p-3">
                <i class="ti ti-file-text text-secondary fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-slate-500 mb-1">Sebagian Terkirim</p>
                <h4 class="mb-0">{{ partialCount }}</h4>
              </div>
              <div class="rounded-circle bg-warning-subtle p-3">
                <i class="ti ti-truck text-warning fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-slate-500 mb-1">Selesai</p>
                <h4 class="mb-0">{{ completedCount }}</h4>
              </div>
              <div class="rounded-circle bg-success-subtle p-3">
                <i class="ti ti-circle-check text-emerald-600 fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="card-header flex flex-wrap justify-between items-center gap-3">
        <h5 class="mb-0">Daftar Pesanan</h5>

        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="loading" @click="loadOrders">
          <i class="ti ti-refresh me-1"></i>
          Muat Ulang
        </button>
      </div>

      <div class="p-5">
        <!-- Filters -->
        <div class="grid grid-cols-12 g-3 mb-4">
          <div class="col-md-7 col-lg-8">
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Cari nomor pesanan atau ID pelanggan..." />
          </div>

          <div class="col-md-5 col-span-12 lg:col-span-4">
            <select v-model="statusFilter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600" role="status"></div>
          <p class="text-slate-500 mt-2 mb-0">Memuat pesanan distribusi...</p>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-5">
          <i class="ti ti-clipboard-off fs-1 text-slate-500"></i>
          <h6 class="mt-3">Belum Ada Pesanan</h6>
          <p class="text-slate-500 mb-0">Tidak ada pesanan yang sesuai dengan pencarian atau filter.</p>
        </div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th>Nomor Pesanan</th>
                <th>Pelanggan</th>
                <th>Tanggal Pesanan</th>
                <th>Rencana Pengiriman</th>
                <th class="text-right">Total</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="order in filteredOrders" :key="String(order.id)">
                <td>
                  <span class="font-semibold">
                    {{ order.order_number }}
                  </span>
                </td>

                <td>
                  {{ order.customer_name || `Pelanggan #${order.customer_id}` }}
                </td>

                <td>{{ formatDate(order.order_date) }}</td>

                <td>
                  {{ formatDate(order.requested_delivery_date) }}
                </td>

                <td class="text-right font-semibold">
                  {{ formatCurrency(order.total_amount) }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(order.status)">
                    {{ statusLabel(order.status) }}
                  </span>
                </td>

                <td class="text-center">
                  <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Lihat detail" @click="openDetail(order.id)">
                    <i class="ti ti-eye"></i>
                    Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && filteredOrders.length > 0" class="text-slate-500 small mt-3">Menampilkan {{ filteredOrders.length }} dari {{ totalOrders }} pesanan.</div>
      </div>
    </div>
  </div>
</template>
