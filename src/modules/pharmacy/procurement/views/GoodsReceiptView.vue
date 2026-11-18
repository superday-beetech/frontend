<script setup lang="ts">
import { onMounted, ref } from "vue";

import { useToast } from "@/shared/composables/useToast";
import { useModal } from "@/shared/composables/useModal";

import goodsReceiptService from "../api/goods-receipt.api";
import GoodsReceiptFormModal from "../components/GoodsReceiptFormModal.vue";
import GoodsReceiptDetailModal from "../components/GoodsReceiptDetailModal.vue";

import type { GoodsReceipt, GoodsReceiptPayload, GoodsReceiptPagination, GoodsReceiptStatus } from "../types/goodsReceipt";

const toast = useToast();

const modalStore = useModal();

const loading = ref(false);
const receipts = ref<GoodsReceipt[]>([]);

const search = ref("");
const status = ref<GoodsReceiptStatus | "">("");
const pagination = ref<GoodsReceiptPagination>({
  page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
});

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(Number(value) || 0);

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return err.response?.data?.message || err.message || "Terjadi kesalahan.";
}

async function loadReceipts(page = 1) {
  loading.value = true;

  try {
    const result = await goodsReceiptService.getAll({
      page,
      per_page: pagination.value.per_page,
      search: search.value.trim() || undefined,
      status: status.value || undefined,
    });

    if (!result) {
      throw new Error("Gagal memuat daftar penerimaan barang.");
    }

    receipts.value = result.items;
    pagination.value = result.pagination;
  } catch (error) {
    toast.error(getErrorMessage(error));
  } finally {
    loading.value = false;
  }
}

function searchReceipts() {
  loadReceipts(1);
}

function changeStatus() {
  loadReceipts(1);
}

function changePage(page: number) {
  if (page < 1 || page > pagination.value.total_pages) {
    return;
  }

  loadReceipts(page);
}

function openCreateModal() {
  modalStore.open({
    title: "Buat Goods Receipt",
    component: GoodsReceiptFormModal,
    size: "xl",
    centered: true,

    onSelect: async (value: unknown) => {
      const payload = value as GoodsReceiptPayload;
      await createReceipt(payload);
    },
  });
}

async function createReceipt(payload: GoodsReceiptPayload) {
  try {
    await goodsReceiptService.create(payload);

    toast.success("Goods Receipt berhasil dibuat sebagai draft.");

    modalStore.close();

    await loadReceipts(1);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
}

function openDetailModal(receipt: GoodsReceipt) {
  modalStore.open({
    title: `Detail Goods Receipt - ${receipt.receipt_number}`,
    component: GoodsReceiptDetailModal,
    props: {
      receiptId: Number(receipt.id),
    },
    size: "xl",
    centered: true,

    // Event select dari DetailModal hanya untuk refresh daftar.
    // Proses posting sudah dilakukan oleh DetailModal.
    onSelect: async () => {
      await loadReceipts(pagination.value.page);
    },
  });
}

function statusClass(value: string) {
  switch (value) {
    case "posted":
      return "bg-success";

    case "draft":
      return "bg-warning text-dark";

    case "cancelled":
      return "bg-secondary";

    default:
      return "bg-light text-dark";
  }
}

onMounted(() => loadReceipts());
</script>

<template>
  <div class="goods-receipt-page">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h4 class="mb-1">Goods Receipt</h4>
        <p class="text-slate-500 mb-0">Pengelolaan penerimaan barang dari supplier.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="openCreateModal">
        <i class="ti ti-plus me-1" />
        Buat Penerimaan
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-2 mb-3">
          <div class="col-md-5">
            <div class="flex w-full items-stretch">
              <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Cari nomor GR, PO, supplier..." @keyup.enter="searchReceipts" />

              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50" @click="searchReceipts">
                <i class="ti ti-search" />
                Cari
              </button>
            </div>
          </div>

          <div class="col-span-12 md:col-span-3">
            <select v-model="status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @change="changeStatus">
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-4 text-md-end">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="loading" @click="loadReceipts(pagination.page)">
              <i class="ti ti-refresh me-1" />
              Muat Ulang
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600" />
          <div class="mt-2 text-slate-500">Memuat data penerimaan...</div>
        </div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead class="table-light">
              <tr>
                <th>Nomor Penerimaan</th>
                <th>Purchase Order</th>
                <th>Supplier</th>
                <th>Tanggal Terima</th>
                <th>Status</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="receipt in receipts" :key="receipt.id">
                <td class="font-semibold">
                  {{ receipt.receipt_number }}
                </td>

                <td>
                  {{ receipt.order_number || "-" }}
                </td>

                <td>
                  {{ receipt.supplier_name || "-" }}
                </td>

                <td>
                  {{ receipt.received_date }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(receipt.status)">
                    {{ receipt.status }}
                  </span>
                </td>

                <td class="text-right">
                  <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" title="Detail" @click="openDetailModal(receipt)">
                    <i class="ti ti-eye" />
                    Detail
                  </button>
                </td>
              </tr>

              <tr v-if="receipts.length === 0">
                <td colspan="6" class="text-center text-slate-500 py-5">Belum ada data Goods Receipt.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && pagination.total > 0" class="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div class="text-slate-500 small">
            Menampilkan
            {{ (pagination.page - 1) * pagination.per_page + 1 }}
            -
            {{ Math.min(pagination.page * pagination.per_page, pagination.total) }}
            dari {{ formatNumber(pagination.total) }} data
          </div>

          <div class="flex items-center gap-2">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="!pagination.has_prev" @click="changePage(pagination.page - 1)">Sebelumnya</button>

            <span class="small"> Halaman {{ pagination.page }} / {{ Math.max(1, pagination.total_pages) }} </span>

            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="!pagination.has_next" @click="changePage(pagination.page + 1)">Berikutnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
