<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import distributionService from "../services/distributionService";
import deliveryService from "../services/deliveryService";

import type { DistributionOrderDetail } from "../types/distribution";

import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);

const orderDetail = ref<DistributionOrderDetail | null>(null);

function getTodayDate(): string {
  const now = new Date();

  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

function generateDeliveryNumber(date: string): string {
  const now = new Date();
  const [year, month, day] = date.split("-");

  const datePart = `${year}${month}${day}`;

  const timePart = [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join("");

  const randomPart = String(Math.floor(1000 + Math.random() * 9000));

  return `DLV-${datePart}-${timePart}-${randomPart}`;
}

const form = reactive({
  delivery_number: "",
  delivery_date: getTodayDate(),
  recipient_name: "",
  recipient_phone: "",
  shipping_address: "",
  notes: "",
});

const orderId = computed(() => Number(route.query.order_id));

const order = computed(() => orderDetail.value?.order ?? null);
const items = computed(() => orderDetail.value?.items ?? []);

const canCreateDelivery = computed(() => {
  return !!order.value && !["completed", "cancelled"].includes(order.value.status);
});

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(Number(value || 0));
}

async function loadOrder() {
  if (!Number.isInteger(orderId.value) || orderId.value <= 0) {
    toast.error("ID pesanan tidak valid.");
    router.replace("/pharmacy/distribution");
    return;
  }

  loading.value = true;

  try {
    orderDetail.value = await distributionService.getOrderDetail(orderId.value);

    if (!orderDetail.value?.order) {
      throw new Error("Data pesanan tidak ditemukan.");
    }

    if (!canCreateDelivery.value) {
      toast.warning("Pesanan ini tidak dapat dibuatkan pengiriman.");
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal memuat data pesanan.");
  } finally {
    loading.value = false;
  }
}

function goBack() {
  if (order.value) {
    router.push({
      path: "/pharmacy/distribution/order-detail",
      query: {
        id: String(order.value.id),
      },
    });

    return;
  }

  router.push("/pharmacy/distribution");
}

async function submit() {
  if (!order.value || !canCreateDelivery.value) {
    toast.warning("Pesanan tidak dapat dibuatkan pengiriman.");
    return;
  }

  if (!form.delivery_number.trim()) {
    toast.warning("Nomor pengiriman wajib diisi.");
    return;
  }

  if (!form.delivery_date) {
    toast.warning("Tanggal pengiriman wajib diisi.");
    return;
  }

  saving.value = true;

  try {
    const newDeliveryId = await deliveryService.createDelivery({
      delivery_number: form.delivery_number.trim(),
      distribution_order_id: Number(order.value.id),
      delivery_date: form.delivery_date,
      recipient_name: form.recipient_name.trim() || null,
      recipient_phone: form.recipient_phone.trim() || null,
      shipping_address: form.shipping_address.trim() || null,
      notes: form.notes.trim() || null,
    });

    toast.success("Dokumen pengiriman berhasil dibuat.");

    router.push({
      path: "/pharmacy/distribution/delivery-detail",
      query: {
        id: String(newDeliveryId),
        order_id: String(order.value.id),
      },
    });
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal membuat dokumen pengiriman.");
  } finally {
    saving.value = false;
  }
}
watch(
  () => form.delivery_date,
  (date) => {
    form.delivery_number = date ? generateDeliveryNumber(date) : "";
  },
  { immediate: true },
);
onMounted(loadOrder);
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Buat Dokumen Pengiriman</h4>
        <p class="text-slate-500 mb-0">Buat delivery berdasarkan pesanan distribusi.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="goBack">
        <i class="ti ti-arrow-left me-1"></i>
        Kembali
      </button>
    </div>

    <div v-if="loading" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5 text-center py-5">
        <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
        <p class="text-slate-500 mt-2 mb-0">Memuat data pesanan...</p>
      </div>
    </div>

    <template v-else-if="order">
      <div v-if="!canCreateDelivery" class="rounded-lg border px-4 py-3 text-sm border-amber-200 bg-amber-50 text-amber-800">Pesanan ini sudah selesai atau dibatalkan. Dokumen pengiriman baru tidak dapat dibuat.</div>

      <!-- Order Reference -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="card-header">
          <h5 class="mb-0">Referensi Pesanan</h5>
        </div>

        <div class="p-5">
          <div class="grid grid-cols-12 g-3">
            <div class="col-span-12 md:col-span-4">
              <label class="text-slate-500 small"> Nomor Pesanan </label>
              <div class="font-semibold">
                {{ order.order_number }}
              </div>
            </div>

            <div class="col-span-12 md:col-span-4">
              <label class="text-slate-500 small"> Pelanggan </label>
              <div class="font-semibold">
                {{ order.customer_name || `Pelanggan #${order.customer_id}` }}
              </div>
            </div>

            <div class="col-span-12 md:col-span-4">
              <label class="text-slate-500 small"> Tanggal Pesanan </label>
              <div>{{ order.order_date }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="card-header">
          <h5 class="mb-0">Produk dalam Pesanan</h5>
        </div>

        <div class="p-5">
          <div class="w-full overflow-x-auto">
            <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th class="text-right">Kuantitas Pesanan</th>
                  <th class="text-right">Harga Satuan</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in items" :key="String(item.id)">
                  <td>
                    <div class="font-semibold">
                      {{ item.product_name || `Produk #${item.product_id}` }}
                    </div>
                    <small class="text-slate-500">
                      {{ item.sku || "-" }}
                    </small>
                  </td>

                  <td class="text-right">
                    {{ formatNumber(item.quantity) }}
                  </td>

                  <td class="text-right">
                    {{ formatCurrency(item.unit_price) }}
                  </td>

                  <td class="text-right">
                    {{ formatCurrency(item.subtotal) }}
                  </td>
                </tr>

                <tr v-if="items.length === 0">
                  <td colspan="4" class="text-center text-slate-500 py-3">Tidak ada item pesanan.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Delivery Form -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="card-header">
          <h5 class="mb-0">Informasi Pengiriman</h5>
        </div>

        <div class="p-5">
          <form @submit.prevent="submit">
            <div class="grid grid-cols-12 g-3">
              <div class="col-span-12 md:col-span-6">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nomor Pengiriman
                  <span class="text-rose-600">*</span>
                </label>

                <input v-model="form.delivery_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: DO-2026-001" maxlength="100" required :disabled="!canCreateDelivery || saving" />
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tanggal Pengiriman
                  <span class="text-rose-600">*</span>
                </label>

                <input v-model="form.delivery_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required :disabled="!canCreateDelivery || saving" />
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Penerima </label>

                <input v-model="form.recipient_name" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="150" placeholder="Nama penerima barang" :disabled="!canCreateDelivery || saving" />
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nomor Telepon Penerima </label>

                <input v-model="form.recipient_phone" type="tel" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="30" placeholder="Nomor telepon penerima" :disabled="!canCreateDelivery || saving" />
              </div>

              <div class="col-span-12">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Alamat Pengiriman </label>

                <textarea v-model="form.shipping_address" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Alamat tujuan pengiriman" :disabled="!canCreateDelivery || saving"></textarea>
              </div>

              <div class="col-span-12">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>

                <textarea v-model="form.notes" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Catatan tambahan pengiriman" :disabled="!canCreateDelivery || saving"></textarea>
              </div>
            </div>

            <hr class="my-4" />

            <div class="flex justify-end gap-2">
              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="saving" @click="goBack">Batal</button>

              <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="saving || !canCreateDelivery">
                <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>

                <i v-else class="ti ti-device-floppy me-1"></i>

                {{ saving ? "Menyimpan..." : "Simpan Dokumen Pengiriman" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5 text-center py-5">
        <i class="ti ti-file-off fs-1 text-slate-500"></i>
        <h6 class="mt-3">Data pesanan tidak tersedia</h6>

        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200 mt-2" @click="goBack">Kembali</button>
      </div>
    </div>
  </div>
</template>
