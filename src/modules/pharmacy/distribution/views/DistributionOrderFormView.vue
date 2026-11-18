<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import { http as api } from "@/core/api/client";
import { useToast } from "@/shared/composables/useToast";

import distributionService from "../api/distribution.api";
import type { DistributionOrderItemPayload, DistributionOrderPayload } from "../types/distribution";

const toast = useToast();

function generateOrderNumber(date: string): string {
  const now = new Date();

  const [year, month, day] = (date || "").split("-").map(Number);

  const datePart = year && month && day ? `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}` : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const timePart = [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join("");

  const randomPart = String(Math.floor(1000 + Math.random() * 9000));

  return `DO-${datePart}-${timePart}-${randomPart}`;
}

interface CustomerOption {
  id: number;
  code?: string;
  name: string;
}

interface ProductOption {
  id: number;
  sku?: string;
  name: string;
  selling_price: number | string;
  unit_name?: string;
}

interface OrderItemForm {
  product_id: number | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  notes: string;
}

const router = useRouter();

const loadingMaster = ref(false);
const saving = ref(false);

const customers = ref<CustomerOption[]>([]);
const products = ref<ProductOption[]>([]);

const today = getTodayDate();

const form = ref({
  order_number: "",
  customer_id: null as number | null,
  order_date: today,
  requested_delivery_date: today,
  discount_amount: 0,
  tax_amount: 0,
  notes: "",
});

watch(
  () => form.value.order_date,
  (date) => {
    if (date) {
      form.value.order_number = generateOrderNumber(date);
    }
  },
  { immediate: true },
);

const items = ref<OrderItemForm[]>([
  {
    product_id: null,
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    notes: "",
  },
]);

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeList<T>(response: any): T[] {
  const data = response?.data?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

const subtotal = computed(() => items.value.reduce((total, item) => total + item.quantity * item.unit_price, 0));

const itemDiscountTotal = computed(() => items.value.reduce((total, item) => total + Number(item.discount_amount || 0), 0));

const totalDiscount = computed(() => itemDiscountTotal.value + Number(form.value.discount_amount || 0));

const totalAmount = computed(() => subtotal.value - totalDiscount.value + Number(form.value.tax_amount || 0));

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

async function loadMasterData() {
  loadingMaster.value = true;

  try {
    const [customerResponse, productResponse] = await Promise.all([api.get("/pharmacy/customer-api"), api.get("/pharmacy/product-api")]);

    customers.value = normalizeList<CustomerOption>(customerResponse);
    products.value = normalizeList<ProductOption>(productResponse);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal memuat data pelanggan dan produk.");
  } finally {
    loadingMaster.value = false;
  }
}

function addItem() {
  items.value.push({
    product_id: null,
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    notes: "",
  });
}

function removeItem(index: number) {
  if (items.value.length === 1) {
    toast.warning("Pesanan minimal harus memiliki satu produk.");
    return;
  }

  items.value.splice(index, 1);
}

function onProductChange(item: OrderItemForm) {
  const product = products.value.find((product) => product.id === Number(item.product_id));

  if (product) {
    item.unit_price = Number(product.selling_price || 0);
  }
}

function lineSubtotal(item: OrderItemForm): number {
  return Number(item.quantity || 0) * Number(item.unit_price || 0) - Number(item.discount_amount || 0);
}

function validateForm(): boolean {
  if (!form.value.order_number.trim()) {
    toast.warning("Nomor pesanan wajib diisi.");
    return false;
  }

  if (!form.value.customer_id) {
    toast.warning("Pilih pelanggan terlebih dahulu.");
    return false;
  }

  if (!form.value.order_date) {
    toast.warning("Tanggal pesanan wajib diisi.");
    return false;
  }

  if (items.value.length === 0) {
    toast.warning("Tambahkan minimal satu produk.");
    return false;
  }

  for (let index = 0; index < items.value.length; index++) {
    const item = items.value[index];

    if (!item.product_id) {
      toast.warning(`Pilih produk pada baris ${index + 1}.`);
      return false;
    }

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      toast.warning(`Kuantitas baris ${index + 1} tidak valid.`);
      return false;
    }

    if (!Number.isFinite(item.unit_price) || item.unit_price < 0) {
      toast.warning(`Harga baris ${index + 1} tidak valid.`);
      return false;
    }

    if (!Number.isFinite(item.discount_amount) || item.discount_amount < 0 || item.discount_amount > item.quantity * item.unit_price) {
      toast.warning(`Diskon baris ${index + 1} tidak valid.`);
      return false;
    }
  }

  if (form.value.discount_amount < 0 || form.value.tax_amount < 0 || totalAmount.value < 0) {
    toast.warning("Periksa kembali diskon, pajak, dan total pesanan.");
    return false;
  }

  return true;
}

async function saveOrder() {
  if (!validateForm()) return;

  const payload: DistributionOrderPayload = {
    order_number: form.value.order_number.trim(),
    customer_id: Number(form.value.customer_id),
    order_date: form.value.order_date,
    requested_delivery_date: form.value.requested_delivery_date || null,
    discount_amount: Number(form.value.discount_amount || 0),
    tax_amount: Number(form.value.tax_amount || 0),
    notes: form.value.notes || null,
    items: items.value.map(
      (item): DistributionOrderItemPayload => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_amount: Number(item.discount_amount || 0),
        notes: item.notes || null,
      }),
    ),
  };

  saving.value = true;

  try {
    const id = await distributionService.createOrder(payload);

    toast.success("Pesanan distribusi berhasil dibuat.");

    router.push({
      path: "/pharmacy/distribution/distribution-order-detail",
      query: { id: String(id) },
    });
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal membuat pesanan distribusi.");
  } finally {
    saving.value = false;
  }
}

function cancel() {
  router.push("/pharmacy/distribution/distribution-order");
}

onMounted(loadMasterData);
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div>
        <h4 class="mb-1">Buat Pesanan Distribusi</h4>
        <p class="text-slate-500 mb-0">Masukkan informasi pelanggan dan produk yang dipesan.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="cancel">
        <i class="ti ti-arrow-left me-1"></i>
        Kembali
      </button>
    </div>

    <div v-if="loadingMaster" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5 text-center py-5">
        <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
        <p class="text-slate-500 mt-2 mb-0">Memuat data master...</p>
      </div>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="card-header">
          <h5 class="mb-0">Informasi Pesanan</h5>
        </div>

        <div class="p-5">
          <div class="grid grid-cols-12 g-3">
            <div class="col-span-12 md:col-span-6">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nomor Pesanan <span class="text-rose-600">*</span> </label>
              <input v-model="form.order_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: DO-2026-001" />
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Pelanggan <span class="text-rose-600">*</span> </label>
              <select v-model.number="form.customer_id" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <option :value="null">Pilih pelanggan</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.code ? `${customer.code} - ` : "" }}
                  {{ customer.name }}
                </option>
              </select>

              <small v-if="customers.length === 0" class="text-slate-500"> Belum ada data pelanggan aktif. </small>
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Pesanan <span class="text-rose-600">*</span> </label>
              <input v-model="form.order_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </div>

            <div class="col-span-12 md:col-span-6">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Rencana Pengiriman</label>
              <input v-model="form.requested_delivery_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </div>

            <div class="col-span-12">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
              <textarea v-model="form.notes" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="2" placeholder="Catatan pesanan..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="card-header flex justify-between items-center">
          <h5 class="mb-0">Detail Produk</h5>

          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" @click="addItem">
            <i class="ti ti-plus me-1"></i>
            Tambah Produk
          </button>
        </div>

        <div class="p-5">
          <div v-for="(item, index) in items" :key="index" class="border rounded p-3 mb-3">
            <div class="flex justify-between items-center mb-3">
              <h6 class="mb-0">Produk {{ index + 1 }}</h6>

              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs btn-outline-danger" @click="removeItem(index)">
                <i class="ti ti-trash me-1"></i>
                Hapus
              </button>
            </div>

            <div class="grid grid-cols-12 g-3">
              <div class="col-span-12 lg:col-span-4">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Produk</label>
                <select v-model.number="item.product_id" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @change="onProductChange(item)">
                  <option :value="null">Pilih produk</option>
                  <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.sku ? `${product.sku} - ` : "" }}
                    {{ product.name }}
                  </option>
                </select>
              </div>

              <div class="col-sm-4 col-lg-2">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kuantitas</label>
                <input v-model.number="item.quantity" type="number" min="0.001" step="0.001" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>

              <div class="col-sm-4 col-lg-2">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Harga Satuan</label>
                <input v-model.number="item.unit_price" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>

              <div class="col-sm-4 col-lg-2">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Diskon</label>
                <input v-model.number="item.discount_amount" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
              </div>

              <div class="col-lg-2">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Subtotal</label>
                <div class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 bg-slate-100 text-slate-700">
                  {{ formatCurrency(lineSubtotal(item)) }}
                </div>
              </div>

              <div class="col-span-12">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan Item</label>
                <input v-model="item.notes" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Catatan produk..." />
              </div>
            </div>
          </div>

          <div v-if="products.length === 0" class="rounded-lg border px-4 py-3 text-sm border-amber-200 bg-amber-50 text-amber-800 mb-0">Data produk belum tersedia. Pastikan produk sudah dibuat dan berstatus aktif.</div>
        </div>
      </div>

      <!-- Summary -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
        <div class="card-header">
          <h5 class="mb-0">Ringkasan Pembayaran</h5>
        </div>

        <div class="p-5">
          <div class="grid grid-cols-12 g-3 justify-end">
            <div class="col-span-12 md:col-span-6 col-span-12 lg:col-span-4">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Diskon Pesanan</label>
              <input v-model.number="form.discount_amount" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </div>

            <div class="col-span-12 md:col-span-6 col-span-12 lg:col-span-4">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pajak</label>
              <input v-model.number="form.tax_amount" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </div>

            <div class="col-span-12 col-lg-8">
              <div class="border rounded p-3">
                <div class="flex justify-between mb-2">
                  <span class="text-slate-500">Subtotal</span>
                  <span>{{ formatCurrency(subtotal) }}</span>
                </div>

                <div class="flex justify-between mb-2">
                  <span class="text-slate-500">Total Diskon</span>
                  <span>{{ formatCurrency(totalDiscount) }}</span>
                </div>

                <div class="flex justify-between mb-2">
                  <span class="text-slate-500">Pajak</span>
                  <span>{{ formatCurrency(form.tax_amount) }}</span>
                </div>

                <hr />

                <div class="flex justify-between">
                  <strong>Total Pesanan</strong>
                  <strong class="text-primary-600 fs-5">
                    {{ formatCurrency(totalAmount) }}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2 mb-4">
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="saving" @click="cancel">Batal</button>

        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="saving || loadingMaster" @click="saveOrder">
          <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
          <i v-else class="ti ti-device-floppy me-1"></i>
          Simpan Pesanan
        </button>
      </div>
    </template>
  </div>
</template>
