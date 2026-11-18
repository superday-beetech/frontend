<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import { useToast } from "@/shared/composables/useToast";
import { useConfirm } from "@/shared/composables/useConfirm";
import { useModal } from "@/shared/composables/useModal";
import { useMasterOptions } from "@/modules/pharmacy/master/composables/useMasterOptions";

import product.api, { type Product, type ProductPagination } from "../api/product.api";

import ProductFormModal from "../components/ProductFormModal.vue";
import ProductDetailModal from "../components/ProductDetailModal.vue";
import OptionSelect from "@/shared/components/ui/form/OptionSelect.vue";
import type { OptionItem } from "@/shared/composables/useOption";

const toast = useToast();
const { confirm } = useConfirm();

const modalStore = useModal();
const masterOptions = useMasterOptions();

const products = ref<Product[]>([]);
const loading = ref(false);

const search = ref("");
const currentPage = ref(1);
const perPage = ref(10);

const pagination = ref<ProductPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
});

const status = ref<string>("");
const categoryId = ref<number | string>("");

const dateFrom = ref("");
const dateTo = ref("");

// Opsi filter
const statusOptions: OptionItem[] = [
  { value: "", label: "Semua Status" },
  { value: "1", label: "Aktif" },
  { value: "0", label: "Tidak Aktif" },
];

// Kategori otomatis dari useMasterOptions (module: pharmacy)
const categoryFilterOptions = computed<OptionItem[]>(() => [{ value: "", label: "Semua Kategori" }, ...masterOptions.categoryOptions.value]);

const visiblePages = computed<(number | string)[]>(() => {
  const total = pagination.value.total_pages;
  const current = currentPage.value;

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total - 1, total];
  if (current >= total - 3) return [1, 2, "...", total - 4, total - 3, total - 2, total - 1, total];

  return [1, 2, "...", current - 1, current, current + 1, "...", total - 1, total];
});

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return error?.message || "Terjadi kesalahan.";
}

function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

async function loadProducts(page = currentPage.value): Promise<void> {
  loading.value = true;

  try {
    const response = await product.api.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
      is_active: status.value === "" ? undefined : Number(status.value),
      category_id: categoryId.value === "" ? undefined : Number(categoryId.value),
    });

    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal mengambil data produk.");
    }

    products.value = result.data.items;
    pagination.value = result.data.pagination;
    currentPage.value = result.data.pagination.current_page;
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  } finally {
    loading.value = false;
  }
}

function openCreateForm(): void {
  modalStore.open({
    title: "Tambah Produk",
    component: ProductFormModal,
    props: { product: null },
    size: "lg",
    centered: true,
    scrollable: true,
    onSelect: async () => {
      await loadProducts(1);
    },
  });
}

function openEditForm(product: Product): void {
  modalStore.open({
    title: "Ubah Produk",
    component: ProductFormModal,
    props: { product },
    size: "lg",
    centered: true,
    scrollable: true,
    onSelect: async () => {
      await loadProducts(currentPage.value);
    },
  });
}

async function openDetail(product: Product): Promise<void> {
  try {
    const response = await product.api.getById(product.id);
    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal mengambil detail produk.");
    }

    modalStore.open({
      title: "Detail Produk",
      component: ProductDetailModal,
      props: { product: result.data },
      size: "lg",
      centered: true,
      scrollable: true,
      onSelect: (value) => {
        openEditForm(value as Product);
      },
    });
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  }
}

async function deleteProduct(product: Product): Promise<void> {
  const confirmed = await confirm({
    title: "Konfirmasi Hapus",
    message: `Hapus produk "${product.name}"?`,
    confirmText: "Ya, Hapus",
    variant: "danger",
  });
  if (!confirmed) return;

  try {
    const response = await product.api.delete(product.id);
    const result = response.data;

    if (result.error) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal menghapus produk.");
    }

    toast.success("Produk berhasil dihapus.");

    const nextPage = products.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;
    await loadProducts(nextPage);
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  }
}

function changePage(page: number): void {
  if (loading.value || page < 1 || page > pagination.value.total_pages || page === currentPage.value) return;
  loadProducts(page);
}

function resetFilters(): void {
  search.value = "";
  status.value = "";
  categoryId.value = "";
  dateFrom.value = "";
  dateTo.value = "";
}

watch([search, dateFrom, dateTo, status, categoryId], () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProducts(1);
  }, 350);
});

watch(perPage, () => {
  loadProducts(1);
});

onMounted(async () => {
  await masterOptions.load();
  await loadProducts(1);
});
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="mb-1">Produk</h4>
        <p class="text-slate-500 mb-0">Kelola data produk apotek.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="openCreateForm">
        <i class="ti ti-plus me-1"></i>
        Tambah Produk
      </button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <!-- Filter -->
        <div class="grid grid-cols-12 g-3 mb-3 items-end">
          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 small mb-1">Tampilkan</label>
            <select v-model.number="perPage" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-select-sm">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 small mb-1">Kategori</label>
            <OptionSelect v-model="categoryId" :options="categoryFilterOptions" placeholder="Semua kategori" search-placeholder="Cari kategori..." />
          </div>

          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 small mb-1">Status</label>
            <OptionSelect v-model="status" :options="statusOptions" placeholder="Semua status" :searchable="false" />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 small mb-1">Pencarian</label>
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm" placeholder="SKU, barcode, produk..." />
          </div>

          <div class="col-span-12 md:col-span-2">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 w-full" @click="resetFilters">
              <i class="ti ti-refresh me-1"></i>
              Reset
            </button>
          </div>
        </div>

        <!-- Tabel Produk -->
        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th style="width: 60px">No.</th>
                <th>Produk</th>
                <th>SKU / Barcode</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th class="text-right">Harga Beli</th>
                <th class="text-right">Harga Jual</th>
                <th>Status</th>
                <th class="text-center" style="width: 130px">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="9" class="text-center py-4">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></span>
                  Memuat data...
                </td>
              </tr>

              <tr v-else-if="products.length === 0">
                <td colspan="9" class="text-center text-slate-500 py-4">Data produk tidak ditemukan.</td>
              </tr>

              <tr v-for="(product, index) in products" :key="product.id">
                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>

                <td>
                  <div class="font-semibold">{{ product.name }}</div>
                  <small class="text-slate-500">
                    {{ product.description || "-" }}
                  </small>
                </td>

                <td>
                  <div>{{ product.sku || "-" }}</div>
                  <small class="text-slate-500">{{ product.barcode || "-" }}</small>
                </td>

                <td>{{ product.category_name || "-" }}</td>
                <td>{{ product.unit_name || "-" }}</td>

                <td class="text-right whitespace-nowrap">
                  {{ formatCurrency(product.purchase_price) }}
                </td>
                <td class="text-right whitespace-nowrap">
                  {{ formatCurrency(product.selling_price) }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="Number(product.is_active) === 1 ? 'bg-success' : 'bg-secondary'">
                    {{ Number(product.is_active) === 1 ? "Aktif" : "Tidak Aktif" }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="flex justify-center gap-1">
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Detail" @click="openDetail(product)">
                      <i class="ti ti-eye"></i>
                    </button>
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Ubah" @click="openEditForm(product)">
                      <i class="ti ti-edit"></i>
                    </button>
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 text-rose-600" title="Hapus" @click="deleteProduct(product)">
                      <i class="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-wrap justify-between items-center gap-2 mt-3">
          <div class="text-slate-500 small">
            Menampilkan
            {{ products.length ? (currentPage - 1) * perPage + 1 : 0 }}
            sampai
            {{ (currentPage - 1) * perPage + products.length }}
            dari {{ pagination.total }} data
          </div>

          <nav v-if="pagination.total_pages > 0" aria-label="Navigasi halaman">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" type="button" :disabled="currentPage === 1" @click="changePage(1)">Pertama</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Sebelumnya</button>
              </li>

              <li
                v-for="(page, index) in visiblePages"
                :key="`${page}-${index}`"
                class="page-item"
                :class="{
                  active: page === currentPage,
                  disabled: page === '...',
                }"
              >
                <span v-if="page === '...'" class="page-link">...</span>
                <button v-else class="page-link" type="button" @click="changePage(Number(page))">
                  {{ page }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === pagination.total_pages }">
                <button class="page-link" type="button" :disabled="currentPage === pagination.total_pages" @click="changePage(currentPage + 1)">Selanjutnya</button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === pagination.total_pages }">
                <button class="page-link" type="button" :disabled="currentPage === pagination.total_pages" @click="changePage(pagination.total_pages)">Akhir</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
