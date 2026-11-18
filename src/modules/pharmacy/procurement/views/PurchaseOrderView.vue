<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

import { http as api } from "@/core/api/client";
import { useToast } from "@/shared/composables/useToast";
import { useConfirm } from "@/shared/composables/useConfirm";
import { useModal } from "@/shared/composables/useModal";

import purchase-order.api from "../api/purchase-order.api";

import PurchaseOrderFormModal from "../components/PurchaseOrderFormModal.vue";
import PurchaseOrderDetailModal from "../components/PurchaseOrderDetailModal.vue";

import OptionSelect from "@/shared/components/ui/form/OptionSelect.vue";
import type { OptionItem } from "@/shared/composables/useOption";

import type { CreatePurchaseOrderPayload, PurchaseOrder, PurchaseOrderPagination } from "../types/purchaseOrder";

const toast = useToast();
const { confirm } = useConfirm();

interface SupplierOption {
  id: number;
  name: string;
  code?: string;
}

interface ProductOption {
  id: number;
  name: string;
  sku?: string;
  purchase_price?: number | string;
}

const modalStore = useModal();

const orders = ref<PurchaseOrder[]>([]);
const suppliers = ref<SupplierOption[]>([]);
const products = ref<ProductOption[]>([]);

const loading = ref(false);
const saving = ref(false);

const filters = reactive({
  search: "",
  status: "",
  supplier_id: "",
});

const pagination = ref<PurchaseOrderPagination>({
  page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
});

function extractList<T>(response: any): T[] {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

const supplierFilterOptions = computed<OptionItem[]>(() => [
  {
    value: "",
    label: "Semua Supplier",
  },
  ...suppliers.value.map((supplier) => ({
    value: String(supplier.id),
    label: supplier.name,
    description: supplier.code ?? undefined,
    keywords: supplier.code ?? "",
  })),
]);

const statusFilterOptions: OptionItem[] = [
  { value: "", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "ordered", label: "Ordered" },
  { value: "partial", label: "Partially Received" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];
const getErrorMessage = (message: string | string[]): string => (Array.isArray(message) ? message.join(", ") : message);
async function loadMasterOptions() {
  try {
    const [supplierResponse, productResponse] = await Promise.all([
      api.get("/pharmacy/supplier-api"),
      api.get("/pharmacy/product-api", {
        params: { per_page: 100 },
      }),
    ]);

    suppliers.value = extractList<SupplierOption>(supplierResponse);
    products.value = extractList<ProductOption>(productResponse);
  } catch (error) {
    console.error("Gagal memuat supplier dan produk:", error);
    toast.error("Gagal memuat pilihan supplier dan produk.");
  }
}

async function loadOrders(page = 1) {
  loading.value = true;

  try {
    const response = await purchaseOrderService.getAll({
      search: filters.search.trim() || undefined,
      status: filters.status || undefined,
      supplier_id: filters.supplier_id ? Number(filters.supplier_id) : undefined,
      page,
      per_page: pagination.value.per_page,
    });

    if (response.error) {
      throw new Error(getErrorMessage(response.message));
    }

    if (!response.data) {
      throw new Error(getErrorMessage(response.message));
    }

    orders.value = response.data.items ?? [];
    pagination.value = response.data.pagination;
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message || "Gagal mengambil data Purchase Order.");
  } finally {
    loading.value = false;
  }
}

function searchOrders() {
  loadOrders(1);
}

function resetFilters() {
  filters.search = "";
  filters.status = "";
  filters.supplier_id = "";

  loadOrders(1);
}

function openCreateModal() {
  modalStore.open({
    title: "Buat Purchase Order",
    component: PurchaseOrderFormModal,
    size: "xl",
    centered: true,
    props: {
      suppliers: suppliers.value,
      products: products.value,
    },
    onSelect: async (value: unknown) => {
      const payload = value as CreatePurchaseOrderPayload;
      await createOrder(payload);
    },
  });
}

async function createOrder(payload: CreatePurchaseOrderPayload) {
  if (saving.value) return;

  saving.value = true;

  try {
    const response = await purchaseOrderService.create(payload);

    if (response.error) {
      throw new Error(getErrorMessage(response.message));
    }

    modalStore.close();
    toast.success("Purchase Order berhasil dibuat.");

    await loadOrders(1);
  } catch (error: any) {
    console.error(error);
    toast.error(error?.response?.data?.message || error?.message || "Gagal membuat Purchase Order.");
  } finally {
    saving.value = false;
  }
}

async function openDetail(order: PurchaseOrder) {
  try {
    const response = await purchaseOrderService.getById(order.id);

    if (response.error) {
      throw new Error(getErrorMessage(response.message));
    }

    modalStore.open({
      title: `Detail Purchase Order - ${order.order_number}`,
      component: PurchaseOrderDetailModal,
      size: "xl",
      centered: true,
      props: {
        order: response.data,
      },
    });
  } catch (error: any) {
    console.error(error);
    toast.error(error?.message || "Gagal mengambil detail Purchase Order.");
  }
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    draft: "bg-light-secondary text-secondary",
    approved: "bg-light-info text-info",
    ordered: "bg-light-primary text-primary",
    partial: "bg-light-warning text-warning",
    received: "bg-light-success text-success",
    cancelled: "bg-light-danger text-danger",
  };

  return classes[status] ?? "bg-light-secondary text-secondary";
}

async function openEditModal(order: PurchaseOrder) {
  if (order.status !== "draft") {
    toast.warning("Hanya PO draft yang dapat diedit.");
    return;
  }

  try {
    const response = await purchaseOrderService.getById(order.id);

    if (response.error) {
      throw new Error(getErrorMessage(response.message));
    }

    modalStore.open({
      title: `Edit Purchase Order - ${order.order_number}`,
      component: PurchaseOrderFormModal,
      size: "xl",
      centered: true,
      props: {
        suppliers: suppliers.value,
        products: products.value,
        order: response.data,
      },
      onSelect: async (value: unknown) => {
        await updateOrder(order.id, value as CreatePurchaseOrderPayload);
      },
    });
  } catch (error: any) {
    toast.error(error?.message || "Gagal mengambil data Purchase Order.");
  }
}

async function updateOrder(id: number, payload: CreatePurchaseOrderPayload) {
  try {
    const response = await purchaseOrderService.update(id, payload);

    if (response.error) {
      throw new Error(getErrorMessage(response.message));
    }

    modalStore.close();
    toast.success("Purchase Order berhasil diperbarui.");

    await loadOrders(pagination.value.page);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal memperbarui Purchase Order.");
  }
}

async function deleteOrder(order: PurchaseOrder) {
  if (order.status !== "draft") {
    toast.warning("Hanya PO draft yang dapat dihapus.");
    return;
  }

  const confirmed = await confirm({
    title: "Konfirmasi Hapus",
    message: `Hapus Purchase Order ${order.order_number}? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: "Ya, Hapus",
    variant: "danger",
  });

  if (!confirmed) return;

  try {
    const response = await purchaseOrderService.delete(order.id);

    if (response.error) {
      throw new Error(getErrorMessage(response.message));
    }

    toast.success("Purchase Order berhasil dihapus.");

    const currentPage = orders.value.length === 1 && pagination.value.page > 1 ? pagination.value.page - 1 : pagination.value.page;

    await loadOrders(currentPage);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal menghapus Purchase Order.");
  }
}

onMounted(async () => {
  await Promise.all([loadMasterOptions(), loadOrders()]);
});
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap justify-between items-center mb-4 gap-3">
      <div>
        <h4 class="mb-1">Purchase Order</h4>
        <p class="text-slate-500 mb-0">Pengelolaan pesanan pembelian kepada supplier.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="loading" @click="openCreateModal">
        <i class="ti ti-plus me-1"></i>
        Buat Purchase Order
      </button>
    </div>

    <!-- Filters -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-3 items-end">
          <div class="col-span-12 lg:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pencarian</label>
            <input v-model="filters.search" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nomor PO atau nama supplier" @keyup.enter="searchOrders" />
          </div>

          <div class="col-span-12 lg:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Supplier</label>

            <OptionSelect v-model="filters.supplier_id" :options="supplierFilterOptions" placeholder="Semua Supplier" search-placeholder="Cari supplier..." empty-text="Supplier tidak ditemukan" />
          </div>

          <div class="col-span-12 lg:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>

            <OptionSelect v-model="filters.status" :options="statusFilterOptions" placeholder="Semua Status" search-placeholder="Cari status..." empty-text="Status tidak ditemukan" />
          </div>

          <div class="col-lg-2 flex gap-2">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 flex-1" @click="searchOrders">
              <i class="ti ti-search me-1"></i>
              Cari
            </button>

            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="resetFilters">Reset</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="flex justify-between items-center mb-3">
          <h5 class="text-base font-semibold mb-0">Daftar Purchase Order</h5>

          <span class="text-slate-500 small"> Total {{ pagination.total }} data </span>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th>Nomor PO</th>
                <th>Supplier</th>
                <th>Tanggal Order</th>
                <th>Estimasi</th>
                <th>Status</th>
                <th class="text-right">Total</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm text-primary-600 me-2"></div>
                  Memuat data...
                </td>
              </tr>

              <tr v-else-if="orders.length === 0">
                <td colspan="7" class="text-center text-slate-500 py-5">Belum ada Purchase Order.</td>
              </tr>

              <tr v-for="order in orders" :key="order.id">
                <td>
                  <span class="font-semibold">
                    {{ order.order_number }}
                  </span>
                </td>

                <td>{{ order.supplier_name || "-" }}</td>

                <td>{{ formatDate(order.order_date) }}</td>

                <td>{{ formatDate(order.expected_date) }}</td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>

                <td class="text-right font-semibold">
                  {{ formatCurrency(order.total_amount) }}
                </td>

                <td class="text-center">
                  <div class="flex justify-center gap-1">
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-primary-50 text-primary-700" title="Detail" @click="openDetail(order)">
                      <i class="ti ti-eye"></i>
                    </button>

                    <button v-if="order.status === 'draft'" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-amber-50 text-amber-700" title="Edit" @click="openEditModal(order)">
                      <i class="ti ti-edit"></i>
                    </button>

                    <button v-if="order.status === 'draft'" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-rose-50 text-rose-700" title="Hapus" @click="deleteOrder(order)">
                      <i class="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="flex flex-wrap justify-between items-center gap-3 mt-3">
          <div class="flex items-center gap-2">
            <span class="text-slate-500 small">Tampilkan</span>

            <select v-model.number="pagination.per_page" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-select-sm" style="width: 80px" @change="loadOrders(1)">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>

            <span class="text-slate-500 small">data</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-slate-500 small">
              Halaman {{ pagination.page }} dari
              {{ pagination.total_pages }}
            </span>

            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="!pagination.has_prev || loading" @click="loadOrders(pagination.page - 1)">
              <i class="ti ti-chevron-left"></i>
            </button>

            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="!pagination.has_next || loading" @click="loadOrders(pagination.page + 1)">
              <i class="ti ti-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
