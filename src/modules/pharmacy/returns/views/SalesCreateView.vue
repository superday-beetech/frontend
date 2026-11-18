<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import deliveryService from "@/modules/pharmacy/distribution/api/delivery.api";
import returnsService from "../api/returns.api";

interface Delivery {
  id: number;
  delivery_number: string;
  order_number?: string;
  customer_name?: string;
  delivery_date: string;
  status: string;
}

interface DeliveryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku?: string;
  batch_id: number;
  batch_number?: string;
  quantity_dispatched: number;
  unit_price: number;
}

interface ReturnItemForm {
  deliveryItemId: number;
  productName: string;
  sku?: string;
  batchNumber?: string;
  batchId: number;
  dispatchedQuantity: number;
  unitPrice: number;
  quantity: number;
  restockable: boolean;
  conditionNotes: string;
}

const deliveries = ref<Delivery[]>([]);
const selectedDeliveryId = ref<number | "">("");
const selectedDelivery = ref<any>(null);
const items = ref<ReturnItemForm[]>([]);

const loadingDeliveries = ref(false);
const loadingDetail = ref(false);
const submitting = ref(false);

const errorMessage = ref("");
const successMessage = ref("");
const createdReturnId = ref<number | null>(null);

const today = new Date().toISOString().slice(0, 10);

const form = ref({
  return_number: "",
  return_date: today,
  reason: "",
  notes: "",
});

const totalQuantity = computed(() => items.value.reduce((total, item) => total + Number(item.quantity || 0), 0));

const totalAmount = computed(() => items.value.reduce((total, item) => total + Number(item.quantity || 0) * item.unitPrice, 0));

const totalRestockable = computed(() => items.value.reduce((total, item) => total + (item.restockable ? Number(item.quantity || 0) : 0), 0));

function generateReturnNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `SR-${date}-${suffix}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

async function loadDeliveries() {
  loadingDeliveries.value = true;
  errorMessage.value = "";

  try {
    const data = await deliveryService.getDeliveries({
      page: 1,
      per_page: 100,
    });

    deliveries.value = data.items.filter((delivery) => delivery.status === "posted");
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Gagal mengambil daftar pengiriman.";
  } finally {
    loadingDeliveries.value = false;
  }
}

async function loadDeliveryDetail() {
  selectedDelivery.value = null;
  items.value = [];
  createdReturnId.value = null;
  successMessage.value = "";
  errorMessage.value = "";

  if (!selectedDeliveryId.value) return;

  loadingDetail.value = true;

  try {
    const data = await deliveryService.getDeliveryDetail(Number(selectedDeliveryId.value));

    const delivery = data?.delivery;

    if (!delivery || delivery.status !== "posted") {
      throw new Error("Hanya pengiriman yang sudah diposting yang dapat diretur.");
    }

    selectedDelivery.value = delivery;

    const deliveryItems: DeliveryItem[] = Array.isArray(data?.items) ? data.items : [];

    items.value = deliveryItems.map((item) => ({
      deliveryItemId: Number(item.id),
      productName: item.product_name,
      sku: item.sku,
      batchNumber: item.batch_number,
      batchId: Number(item.batch_id),
      dispatchedQuantity: Number(item.quantity_dispatched),
      unitPrice: Number(item.unit_price),
      quantity: 0,
      restockable: true,
      conditionNotes: "",
    }));
  } catch (error: any) {
    selectedDelivery.value = null;
    items.value = [];

    errorMessage.value = error.response?.data?.message || error.message || "Gagal mengambil detail pengiriman.";
  } finally {
    loadingDetail.value = false;
  }
}

async function submitReturn() {
  errorMessage.value = "";
  successMessage.value = "";
  createdReturnId.value = null;

  if (!selectedDeliveryId.value || !selectedDelivery.value) {
    errorMessage.value = "Pilih pengiriman terlebih dahulu.";
    return;
  }

  const selectedItems = items.value.filter((item) => Number(item.quantity) > 0);

  if (selectedItems.length === 0) {
    errorMessage.value = "Masukkan minimal satu barang yang diretur.";
    return;
  }

  for (const item of selectedItems) {
    if (item.quantity <= 0 || item.quantity > item.dispatchedQuantity) {
      errorMessage.value = `Kuantitas retur ${item.productName} tidak valid.`;
      return;
    }
  }

  submitting.value = true;

  try {
    if (!form.value.return_number.trim()) {
      form.value.return_number = generateReturnNumber();
    }

    const payload = {
      return_number: form.value.return_number,
      delivery_id: Number(selectedDeliveryId.value),
      return_date: form.value.return_date,
      reason: form.value.reason,
      notes: form.value.notes,
      items: selectedItems.map((item) => ({
        delivery_item_id: item.deliveryItemId,
        quantity: Number(item.quantity),
        restockable: item.restockable,
        condition_notes: item.conditionNotes,
      })),
    };

    const response = await returnsService.createSales(payload);

    const data = getResponseData(response);

    createdReturnId.value = Number(data?.return_id);

    successMessage.value = response.data?.message || "Draft Sales Return berhasil dibuat.";
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Gagal membuat Sales Return.";
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  form.value.return_number = generateReturnNumber();
  loadDeliveries();
});
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="mb-1">Buat Sales Return</h4>
        <p class="text-slate-500 mb-0">Mencatat barang yang dikembalikan pelanggan.</p>
      </div>
    </div>

    <div v-if="errorMessage" class="rounded-lg border px-4 py-3 text-sm border-rose-200 bg-rose-50 text-rose-800 alert-dismissible" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <div v-if="successMessage" class="rounded-lg border px-4 py-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-800" role="alert">
      {{ successMessage }}

      <div v-if="createdReturnId" class="mt-2">
        Nomor retur:
        <strong>{{ form.return_number }}</strong>
        <br />
        Return ID:
        <strong>{{ createdReturnId }}</strong>
        <br />
        Status: <strong>Draft</strong>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
      <div class="card-header">
        <h5 class="mb-0">Informasi Retur</h5>
      </div>

      <div class="p-5">
        <div class="grid grid-cols-12 g-3">
          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nomor Sales Return </label>
            <input v-model="form.return_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="submitting" />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Retur </label>
            <input v-model="form.return_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="submitting" />
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Delivery </label>
            <select v-model="selectedDeliveryId" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="loadingDeliveries || loadingDetail || submitting" @change="loadDeliveryDetail">
              <option value="">Pilih pengiriman</option>
              <option v-for="delivery in deliveries" :key="delivery.id" :value="delivery.id">
                {{ delivery.delivery_number }}
                — {{ delivery.customer_name || "Customer" }}
              </option>
            </select>

            <small v-if="loadingDeliveries" class="text-slate-500"> Memuat daftar pengiriman... </small>
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Alasan Retur </label>
            <input v-model="form.reason" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: Barang tidak sesuai pesanan" :disabled="submitting" />
          </div>

          <div class="col-span-12 md:col-span-6">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Catatan </label>
            <input v-model="form.notes" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Catatan tambahan" :disabled="submitting" />
          </div>
        </div>

        <div v-if="selectedDelivery" class="rounded-lg border px-4 py-3 text-sm border mt-3 mb-0">
          <div class="grid grid-cols-12 g-3">
            <div class="col-span-12 md:col-span-4">
              <small class="text-slate-500 block"> Nomor Delivery </small>
              <strong>
                {{ selectedDelivery.delivery_number }}
              </strong>
            </div>

            <div class="col-span-12 md:col-span-4">
              <small class="text-slate-500 block"> Nomor Order </small>
              <strong>
                {{ selectedDelivery.order_number || "-" }}
              </strong>
            </div>

            <div class="col-span-12 md:col-span-4">
              <small class="text-slate-500 block"> Customer </small>
              <strong>
                {{ selectedDelivery.customer_name || "-" }}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
      <div class="card-header flex justify-between">
        <h5 class="mb-0">Barang yang Dikembalikan</h5>

        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-primary"> {{ items.length }} Item </span>
      </div>

      <div class="p-5">
        <div v-if="loadingDetail" class="text-center py-4">
          <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
          <p class="text-slate-500 mt-2 mb-0">Memuat detail pengiriman...</p>
        </div>

        <div v-else-if="!selectedDelivery" class="text-center text-slate-500 py-5">
          <i class="ti ti-package fs-7"></i>
          <p class="mt-2 mb-0">Pilih Delivery untuk menampilkan barang.</p>
        </div>

        <div v-else-if="items.length === 0" class="text-center text-slate-500 py-4">Tidak ada item pada pengiriman ini.</div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm table-bordered align-middle">
            <thead class="">
              <tr>
                <th style="min-width: 170px">Produk</th>
                <th style="min-width: 130px">Batch</th>
                <th class="text-right">Dikirim</th>
                <th style="width: 120px">Qty Retur</th>
                <th style="min-width: 130px">Layak Masuk Stok</th>
                <th style="min-width: 180px">Kondisi / Catatan</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in items" :key="item.deliveryItemId">
                <td>
                  <strong>{{ item.productName }}</strong>
                  <small v-if="item.sku" class="block text-slate-500"> SKU: {{ item.sku }} </small>
                </td>

                <td>
                  {{ item.batchNumber || `Batch #${item.batchId}` }}
                </td>

                <td class="text-right">
                  {{ item.dispatchedQuantity }}
                </td>

                <td>
                  <input v-model.number="item.quantity" type="number" min="0" :max="item.dispatchedQuantity" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm" :disabled="submitting" />

                  <small class="text-slate-500"> Maks. {{ item.dispatchedQuantity }} </small>
                </td>

                <td>
                  <select v-model="item.restockable" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-select-sm" :disabled="submitting || item.quantity <= 0">
                    <option :value="true">Ya</option>
                    <option :value="false">Tidak</option>
                  </select>
                </td>

                <td>
                  <input v-model="item.conditionNotes" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm" placeholder="Kondisi barang" :disabled="submitting || item.quantity <= 0" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
      <div class="p-5">
        <div class="grid grid-cols-12 g-3">
          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block"> Total Kuantitas Retur </small>
            <h5 class="mb-0">{{ totalQuantity }}</h5>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block"> Kuantitas Masuk Kembali ke Stok </small>
            <h5 class="mb-0">{{ totalRestockable }}</h5>
          </div>

          <div class="col-span-12 md:col-span-4">
            <small class="text-slate-500 block"> Estimasi Nilai Retur </small>
            <h5 class="mb-0">
              {{ formatCurrency(totalAmount) }}
            </h5>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5 flex justify-end">
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="submitting || loadingDetail || !selectedDelivery || totalQuantity <= 0 || !!createdReturnId" @click="submitReturn">
          <span v-if="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></span>

          {{ submitting ? "Menyimpan..." : "Simpan Draft Sales Return" }}
        </button>
      </div>
    </div>
  </div>
</template>
