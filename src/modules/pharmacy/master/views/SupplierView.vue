<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import supplierService, { type Supplier, type SupplierPagination } from "../services/supplierService";

import SupplierFormModal from "../components/SupplierFormModal.vue";
import SupplierDetailModal from "../components/SupplierDetailModal.vue";

import { useModal } from "@/shared/composables/useModal";
import { useToast } from "@/shared/composables/useToast";
import { useConfirm } from "@/shared/composables/useConfirm";

const toast = useToast();
const { confirm } = useConfirm();

const modalStore = useModal();

const suppliers = ref<Supplier[]>([]);
const loading = ref(false);

const search = ref("");
const status = ref("");

const currentPage = ref(1);
const perPage = ref(10);

const pagination = ref<SupplierPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
});

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

const visiblePages = computed<(number | string)[]>(() => {
  const total = pagination.value.total_pages;
  const current = currentPage.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
});

async function loadSuppliers(page = currentPage.value) {
  if (loading.value) return;

  loading.value = true;

  try {
    const response = await supplierService.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
      is_active: status.value === "" ? undefined : Number(status.value),
    });

    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(Array.isArray(result.message) ? result.message.join(", ") : result.message || "Gagal mengambil data supplier.");
    }

    suppliers.value = result.data.items;
    pagination.value = result.data.pagination;
    currentPage.value = result.data.pagination.current_page;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal mengambil data supplier.");
  } finally {
    loading.value = false;
  }
}

function changePage(page: number) {
  if (loading.value || page < 1 || page > pagination.value.total_pages || page === currentPage.value) {
    return;
  }

  loadSuppliers(page);
}

function openCreateForm() {
  modalStore.open({
    title: "Tambah Supplier",
    component: SupplierFormModal,
    size: "lg",
    centered: true,
    props: {
      supplier: null,
    },
    onSelect: () => loadSuppliers(1),
  });
}

function openEditForm(supplier: Supplier) {
  modalStore.open({
    title: "Edit Supplier",
    component: SupplierFormModal,
    size: "lg",
    centered: true,
    props: {
      supplier,
    },
    onSelect: () => loadSuppliers(),
  });
}

function openDetail(supplier: Supplier) {
  modalStore.open({
    title: "Detail Supplier",
    component: SupplierDetailModal,
    size: "lg",
    centered: true,
    props: {
      supplier,
    },
    onSelect: (value) => {
      modalStore.close();
      openEditForm(value as Supplier);
    },
  });
}

async function deleteSupplier(supplier: Supplier) {
  const confirmed = await confirm({
    title: "Konfirmasi Hapus",
    message: `Hapus supplier "${supplier.name}"?`,
    confirmText: "Ya, Hapus",
    variant: "danger",
  });

  if (!confirmed) return;

  try {
    const response = await supplierService.delete(supplier.id);
    const result = response.data;

    if (result.error) {
      throw new Error(Array.isArray(result.message) ? result.message.join(", ") : result.message || "Gagal menghapus supplier.");
    }

    toast.success("Supplier berhasil dihapus.");

    const nextPage = suppliers.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;

    await loadSuppliers(nextPage);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || error?.message || "Gagal menghapus supplier.");
  }
}

function resetFilters() {
  search.value = "";
  status.value = "";
}

watch([search, status], () => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    loadSuppliers(1);
  }, 350);
});

watch(perPage, () => loadSuppliers(1));

onMounted(() => {
  loadSuppliers(1);
});
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="mb-1">Supplier</h4>
        <p class="text-slate-500 mb-0">Pengelolaan data pemasok barang dan produk.</p>
      </div>

      <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="openCreateForm">
        <i class="ti ti-plus me-1" />
        Tambah Supplier
      </button>
    </div>

    <!-- Filter -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-3 items-end">
          <div class="col-span-12 md:col-span-6">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pencarian</label>
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Cari kode, nama, telepon, atau email..." />
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select v-model="status" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <option value="">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-3">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200 w-full" type="button" @click="resetFilters">
              <i class="ti ti-refresh me-1" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4" style="width: 60px">No.</th>
              <th style="width: 140px">Kode</th>
              <th>Nama Supplier</th>
              <th>Telepon</th>
              <th>Email</th>
              <th>Status</th>
              <th class="text-right pe-4" style="width: 150px">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-5">
                <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2" />
                Memuat data supplier...
              </td>
            </tr>

            <tr v-else-if="suppliers.length === 0">
              <td colspan="7" class="text-center text-slate-500 py-5">Belum ada data supplier.</td>
            </tr>

            <tr v-for="(supplier, index) in suppliers" v-else :key="supplier.id">
              <td class="ps-4">
                {{ (currentPage - 1) * perPage + index + 1 }}
              </td>

              <td>
                <span class="font-semibold">{{ supplier.code }}</span>
              </td>

              <td>
                <div class="font-semibold">{{ supplier.name }}</div>
                <small class="text-slate-500">
                  {{ supplier.address || "-" }}
                </small>
              </td>

              <td>{{ supplier.phone || "-" }}</td>
              <td>{{ supplier.email || "-" }}</td>

              <td>
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="Number(supplier.is_active) === 1 ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                  {{ Number(supplier.is_active) === 1 ? "Aktif" : "Nonaktif" }}
                </span>
              </td>

              <td class="text-right pe-4">
                <div class="flex justify-end gap-1">
                  <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Detail" @click="openDetail(supplier)">
                    <i class="ti ti-eye" />
                  </button>

                  <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Edit" @click="openEditForm(supplier)">
                    <i class="ti ti-edit" />
                  </button>

                  <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 text-rose-600" title="Hapus" @click="deleteSupplier(supplier)">
                    <i class="ti ti-trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="p-5 border-top flex flex-wrap justify-between items-center gap-3">
        <div class="flex items-center gap-2">
          <small class="text-slate-500">Tampilkan</small>

          <select v-model.number="perPage" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-select-sm" style="width: 75px">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>

          <small class="text-slate-500"> Total {{ pagination.total }} supplier </small>
        </div>

        <nav aria-label="Supplier pagination">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 || loading }">
              <button class="page-link" @click="changePage(1)">Pertama</button>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === 1 || loading }">
              <button class="page-link" @click="changePage(currentPage - 1)">Sebelumnya</button>
            </li>

            <li
              v-for="(page, index) in visiblePages"
              :key="`${page}-${index}`"
              class="page-item"
              :class="{
                active: page === currentPage,
                disabled: page === '...' || loading,
              }"
            >
              <button v-if="typeof page === 'number'" class="page-link" @click="changePage(page)">
                {{ page }}
              </button>

              <span v-else class="page-link">...</span>
            </li>

            <li
              class="page-item"
              :class="{
                disabled: currentPage === pagination.total_pages || loading,
              }"
            >
              <button class="page-link" @click="changePage(currentPage + 1)">Selanjutnya</button>
            </li>

            <li
              class="page-item"
              :class="{
                disabled: currentPage === pagination.total_pages || loading,
              }"
            >
              <button class="page-link" @click="changePage(pagination.total_pages)">Akhir</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>
