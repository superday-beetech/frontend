<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import { useToast } from "@/shared/composables/useToast";
import { useConfirm } from "@/shared/composables/useConfirm";
import { useModal } from "@/shared/composables/useModal";

import unitService, { type Unit, type UnitPagination } from "../services/unitService";

import UnitFormModal from "../components/UnitFormModal.vue";
import UnitDetailModal from "../components/UnitDetailModal.vue";

const toast = useToast();
const { confirm } = useConfirm();

const modalStore = useModal();

const units = ref<Unit[]>([]);
const loading = ref(false);

const search = ref("");
const currentPage = ref(1);
const perPage = ref(10);

const pagination = ref<UnitPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
});

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return error?.message || "Terjadi kesalahan.";
}

async function loadUnits(page = currentPage.value): Promise<void> {
  loading.value = true;

  try {
    const response = await unitService.getAll({
      page,
      per_page: perPage.value,
      search: search.value.trim(),
    });

    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal mengambil data satuan.");
    }

    units.value = result.data.items;
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
    title: "Tambah Satuan",
    component: UnitFormModal,
    props: {
      unit: null,
    },
    size: "default",
    centered: true,
    onSelect: async () => {
      await loadUnits(1);
    },
  });
}

function openEditForm(unit: Unit): void {
  modalStore.open({
    title: "Ubah Satuan",
    component: UnitFormModal,
    props: {
      unit,
    },
    size: "default",
    centered: true,
    onSelect: async () => {
      await loadUnits(currentPage.value);
    },
  });
}

async function openDetail(unit: Unit): Promise<void> {
  try {
    const response = await unitService.getById(unit.id);
    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal mengambil detail satuan.");
    }

    modalStore.open({
      title: "Detail Satuan",
      component: UnitDetailModal,
      props: {
        unit: result.data,
      },
      size: "default",
      centered: true,
      onSelect: (value) => {
        openEditForm(value as Unit);
      },
    });
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  }
}

async function deleteUnit(unit: Unit): Promise<void> {
  const confirmed = await confirm({
    title: "Konfirmasi Hapus",
    message: `Hapus satuan "${unit.name}" (${unit.abbreviation})?`,
    confirmText: "Ya, Hapus",
    variant: "danger",
  });

  if (!confirmed) return;

  try {
    const response = await unitService.delete(unit.id);
    const result = response.data;

    if (result.error) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal menghapus satuan.");
    }

    toast.success("Satuan berhasil dihapus.");

    const nextPage = units.value.length === 1 && currentPage.value > 1 ? currentPage.value - 1 : currentPage.value;

    await loadUnits(nextPage);
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  }
}

function changePage(page: number): void {
  if (page < 1 || page > pagination.value.total_pages || page === currentPage.value) {
    return;
  }

  loadUnits(page);
}

watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    loadUnits(1);
  }, 350);
});

watch(perPage, () => {
  loadUnits(1);
});

onMounted(() => {
  loadUnits(1);
});
</script>

<template>
  <div class="w-full">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="mb-1">Satuan</h4>
        <p class="text-slate-500 mb-0">Kelola satuan produk apotek.</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="openCreateForm">
        <i class="ti ti-plus me-1"></i>
        Tambah Satuan
      </button>
    </div>

    <!-- Table Card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="flex flex-wrap justify-between items-center gap-3 mb-3">
          <div class="flex items-center gap-2">
            <label class="text-slate-500">Tampilkan</label>

            <select v-model.number="perPage" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-select-sm" style="width: 80px">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>

            <span class="text-slate-500">data</span>
          </div>

          <div style="width: 260px">
            <input v-model="search" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm" placeholder="Cari satuan..." />
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead>
              <tr>
                <th style="width: 70px">No.</th>
                <th>Nama Satuan</th>
                <th>Singkatan</th>
                <th style="width: 160px" class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="4" class="text-center py-4">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></span>
                  Memuat data...
                </td>
              </tr>

              <tr v-else-if="units.length === 0">
                <td colspan="4" class="text-center text-slate-500 py-4">Data satuan tidak ditemukan.</td>
              </tr>

              <tr v-for="(unit, index) in units" :key="unit.id">
                <td>
                  {{ (currentPage - 1) * perPage + index + 1 }}
                </td>

                <td class="font-semibold">
                  {{ unit.name }}
                </td>

                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 text-dark">
                    {{ unit.abbreviation }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="flex justify-center gap-1">
                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Detail" @click="openDetail(unit)">
                      <i class="ti ti-eye"></i>
                    </button>

                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" title="Ubah" @click="openEditForm(unit)">
                      <i class="ti ti-edit"></i>
                    </button>

                    <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 text-rose-600" title="Hapus" @click="deleteUnit(unit)">
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
            {{ units.length ? (currentPage - 1) * perPage + 1 : 0 }}
            sampai
            {{ (currentPage - 1) * perPage + units.length }}
            dari {{ pagination.total }} data
          </div>

          <nav v-if="pagination.total_pages > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                <button class="page-link" type="button" @click="changePage(currentPage - 1)">Sebelumnya</button>
              </li>

              <li v-for="page in pagination.total_pages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                <button class="page-link" type="button" @click="changePage(page)">
                  {{ page }}
                </button>
              </li>

              <li
                class="page-item"
                :class="{
                  disabled: currentPage >= pagination.total_pages,
                }"
              >
                <button class="page-link" type="button" @click="changePage(currentPage + 1)">Berikutnya</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
