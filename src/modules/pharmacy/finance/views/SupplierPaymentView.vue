<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { http as api } from "@/core/api/client";
import { useModal } from "@/shared/composables/useModal";
import { useToast } from "@/shared/composables/useToast";

import financeService from "../services/financeService";
import type { SupplierPaymentPayload } from "../types/finance";

import SupplierPaymentFormModal from "./SupplierPaymentFormModal.vue";

const toast = useToast();

interface Supplier {
  id: number;
  name: string;
}

interface SupplierPayment {
  id: number;
  payment_number: string;
  supplier_id: number;
  purchase_order_id: number | null;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_at?: string;
}

const modalStore = useModal();

const payments = ref<SupplierPayment[]>([]);
const suppliers = ref<Supplier[]>([]);

const loading = ref(false);
const supplierLoading = ref(false);
const saving = ref(false);

const totalPayment = computed(() => payments.value.reduce((total, item) => total + Number(item.amount || 0), 0));

const supplierName = (supplierId: number) => {
  return suppliers.value.find((supplier) => supplier.id === supplierId)?.name ?? `Supplier #${supplierId}`;
};

const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDate = (value: string) => {
  if (!value) return "-";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const generatePaymentNumber = () => {
  const now = new Date();

  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");

  const time = [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join("");

  return `SP-${date}-${time}`;
};

const loadPayments = async () => {
  loading.value = true;

  try {
    const response = await financeService.getSupplierPayments();
    const result = response.data?.data;

    payments.value = Array.isArray(result) ? result : [];
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal memuat pembayaran supplier.", "error");
  } finally {
    loading.value = false;
  }
};

const loadSuppliers = async () => {
  supplierLoading.value = true;

  try {
    const response = await api.get("/pharmacy/supplier-api");
    const result = response.data?.data;

    suppliers.value = Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : [];
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal memuat daftar supplier.", "error");
  } finally {
    supplierLoading.value = false;
  }
};

const savePayment = async (payload: SupplierPaymentPayload) => {
  saving.value = true;

  try {
    const response = await financeService.createSupplierPayment(payload);

    toast.success(response.data?.message ?? "Pembayaran supplier berhasil dicatat.", "success");

    await loadPayments();
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal mencatat pembayaran supplier.", "error");
  } finally {
    saving.value = false;
  }
};

const openCreateModal = async () => {
  if (supplierLoading.value) return;

  if (suppliers.value.length === 0) {
    await loadSuppliers();
  }

  if (suppliers.value.length === 0) {
    toast.warning("Daftar supplier kosong. Tambahkan supplier terlebih dahulu.", "warning");
    return;
  }

  modalStore.open({
    title: "Input Pembayaran Supplier",
    component: SupplierPaymentFormModal,
    size: "lg",
    centered: true,
    props: {
      suppliers: suppliers.value,
      paymentNumber: generatePaymentNumber(),
    },
    onSelect: async (value: unknown) => {
      if (typeof value !== "object" || value === null || !("payment_number" in value) || !("supplier_id" in value)) {
        return;
      }

      const payload = value as SupplierPaymentPayload;

      modalStore.close();
      await savePayment(payload);
    },
  });
};

onMounted(async () => {
  await Promise.all([loadPayments(), loadSuppliers()]);
});
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap justify-between items-center gap-2 mb-4">
      <div>
        <h4 class="mb-1">Pembayaran Supplier</h4>
        <p class="text-slate-500 mb-0">Pencatatan pembayaran utang kepada supplier.</p>
      </div>

      <div class="flex gap-2">
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="loading" @click="loadPayments">
          <i class="ti ti-refresh me-1"></i>
          Refresh
        </button>

        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="supplierLoading || saving" @click="openCreateModal">
          <i class="ti ti-plus me-1"></i>
          Pembayaran Baru
        </button>
      </div>
    </div>

    <div class="grid grid-cols-12 g-3 mb-4">
      <div class="col-span-12 md:col-span-6">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-0">
          <div class="p-5">
            <div class="text-slate-500 small mb-1">Jumlah Transaksi</div>
            <h4 class="mb-0">{{ payments.length }}</h4>
          </div>
        </div>
      </div>

      <div class="col-span-12 md:col-span-6">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-0">
          <div class="p-5">
            <div class="text-slate-500 small mb-1">Total Pembayaran</div>
            <h4 class="mb-0">
              {{ formatCurrency(totalPayment) }}
            </h4>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="card-header">
        <h5 class="mb-0">Riwayat Pembayaran Supplier</h5>
      </div>

      <div class="p-5 p-0">
        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Nomor Pembayaran</th>
                <th>Tanggal</th>
                <th>Supplier</th>
                <th>Purchase Order</th>
                <th>Metode</th>
                <th class="text-right">Nominal</th>
                <th>Referensi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">Memuat data pembayaran...</td>
              </tr>

              <tr v-else-if="payments.length === 0">
                <td colspan="7" class="text-center text-slate-500 py-4">Belum ada pembayaran supplier.</td>
              </tr>

              <tr v-for="item in payments" :key="item.id">
                <td>
                  <strong>{{ item.payment_number }}</strong>
                </td>

                <td>{{ formatDate(item.payment_date) }}</td>

                <td>{{ supplierName(item.supplier_id) }}</td>

                <td>
                  {{ item.purchase_order_id ?? "Umum" }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 text-dark">
                    {{ item.payment_method }}
                  </span>
                </td>

                <td class="text-right">
                  <strong>
                    {{ formatCurrency(item.amount) }}
                  </strong>
                </td>

                <td>{{ item.reference_number || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
