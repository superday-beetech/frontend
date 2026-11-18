<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useToast } from "@/shared/composables/useToast";

import distribution.api from "../api/distribution.api";
import delivery.api from "../api/delivery.api";

import type { Delivery, DistributionOrder } from "../types/distribution";

const toast = useToast();

interface DeliveryRow extends Delivery {
  order_number?: string;
  customer_name?: string;
  customer_id?: number | string;
}

const router = useRouter();

const loading = ref(false);

const deliveries = ref<DeliveryRow[]>([]);
const orders = ref<DistributionOrder[]>([]);

const search = ref("");
const statusFilter = ref("");

const filteredDeliveries = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  return deliveries.value.filter((delivery) => {
    const matchesSearch =
      !keyword ||
      delivery.delivery_number.toLowerCase().includes(keyword) ||
      String(delivery.order_number ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(delivery.recipient_name ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(delivery.shipping_address ?? "")
        .toLowerCase()
        .includes(keyword);

    const matchesStatus = !statusFilter.value || delivery.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const summary = computed(() => ({
  total: deliveries.value.length,
  draft: deliveries.value.filter((item) => item.status === "draft").length,
  posted: deliveries.value.filter((item) => item.status === "posted").length,
  cancelled: deliveries.value.filter((item) => item.status === "cancelled").length,
}));

function formatDate(value: string | null | undefined): string {
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
    posted: "Sudah Diposting",
    cancelled: "Dibatalkan",
  };

  return labels[status] ?? status;
}

function statusClass(status: string): string {
  const classes: Record<string, string> = {
    draft: "bg-light text-secondary",
    posted: "bg-success-subtle text-success",
    cancelled: "bg-danger-subtle text-danger",
  };

  return classes[status] ?? "bg-light text-secondary";
}

async function loadDeliveries() {
  loading.value = true;

  try {
    const [deliveryResponse, orderResponse] = await Promise.all([
      deliveryService.getDeliveries({
        page: 1,
        per_page: 100,
      }),
      distributionService.getOrders(),
    ]);

    orders.value = orderResponse;

    const orderMap = new Map(orders.value.map((order) => [Number(order.id), order]));

    deliveries.value = deliveryResponse.items.map((delivery) => {
      const relatedOrder = orderMap.get(Number(delivery.distribution_order_id));

      return {
        ...delivery,
        order_number: (delivery as DeliveryRow).order_number ?? relatedOrder?.order_number,
        customer_name: (delivery as DeliveryRow).customer_name ?? relatedOrder?.customer_name,
        customer_id: (delivery as DeliveryRow).customer_id ?? relatedOrder?.customer_id,
      };
    });
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal memuat daftar pengiriman.");
  } finally {
    loading.value = false;
  }
}

function openDetail(delivery: DeliveryRow) {
  router.push({
    path: "/pharmacy/distribution/delivery-detail",
    query: {
      id: String(delivery.id),
      order_id: String(delivery.distribution_order_id),
    },
  });
}

function openOrder(delivery: DeliveryRow) {
  router.push({
    path: "/pharmacy/distribution/order-detail",
    query: {
      id: String(delivery.distribution_order_id),
    },
  });
}

function goToOrders() {
  router.push("/pharmacy/distribution/distribution-order");
}

onMounted(loadDeliveries);
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Dokumen Pengiriman</h4>
        <p class="text-slate-500 mb-0">Daftar delivery dari pesanan distribusi.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="goToOrders">
        <i class="ti ti-shopping-cart me-1"></i>
        Daftar Pesanan
      </button>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-12 g-3 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <p class="text-slate-500 mb-1">Total Dokumen</p>
            <h4 class="mb-0">{{ summary.total }}</h4>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <p class="text-slate-500 mb-1">Draft</p>
            <h4 class="mb-0 text-secondary">
              {{ summary.draft }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <p class="text-slate-500 mb-1">Sudah Diposting</p>
            <h4 class="mb-0 text-emerald-600">
              {{ summary.posted }}
            </h4>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
          <div class="p-5">
            <p class="text-slate-500 mb-1">Dibatalkan</p>
            <h4 class="mb-0 text-rose-600">
              {{ summary.cancelled }}
            </h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Delivery Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="card-header">
        <h5 class="mb-0">Daftar Pengiriman</h5>
      </div>

      <div class="p-5">
        <!-- Filters -->
        <div class="grid grid-cols-12 g-3 mb-4">
          <div class="col-span-12 md:col-span-8">
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Cari nomor delivery, nomor pesanan, atau penerima..." />
          </div>

          <div class="col-span-12 md:col-span-4">
            <select v-model="statusFilter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="posted">Sudah Diposting</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
          <p class="text-slate-500 mt-2 mb-0">Memuat daftar pengiriman...</p>
        </div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th>Nomor Pengiriman</th>
                <th>Nomor Pesanan</th>
                <th>Tanggal</th>
                <th>Penerima</th>
                <th>Alamat</th>
                <th>Status</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="delivery in filteredDeliveries" :key="String(delivery.id)">
                <td>
                  <div class="font-semibold">
                    {{ delivery.delivery_number }}
                  </div>
                </td>

                <td>
                  <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-link p-0 text-decoration-none" @click="openOrder(delivery)">
                    {{ delivery.order_number || `Pesanan #${delivery.distribution_order_id}` }}
                  </button>
                </td>

                <td>
                  {{ formatDate(delivery.delivery_date) }}
                </td>

                <td>
                  {{ delivery.recipient_name || "-" }}
                </td>

                <td>
                  <span class="d-inline-block text-truncate" style="max-width: 180px" :title="delivery.shipping_address || ''">
                    {{ delivery.shipping_address || "-" }}
                  </span>
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(delivery.status)">
                    {{ statusLabel(delivery.status) }}
                  </span>
                </td>

                <td class="text-center">
                  <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" @click="openDetail(delivery)">
                    <i class="ti ti-eye me-1"></i>
                    Detail
                  </button>
                </td>
              </tr>

              <tr v-if="filteredDeliveries.length === 0">
                <td colspan="7" class="text-center text-slate-500 py-5">
                  <i class="ti ti-truck-off fs-1 block mb-2"></i>
                  Tidak ada dokumen pengiriman.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
