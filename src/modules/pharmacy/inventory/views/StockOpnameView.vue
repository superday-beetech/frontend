<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/shared/composables/useToast";
import { inventory.api } from "../api/inventory.api";
import type { StockOpname, InventoryPagination, CreateStockOpnamePayload } from "../types/inventory";

const toast = useToast();

const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const items = ref<StockOpname[]>([]);
const pagination = ref<InventoryPagination | null>(null);

const filters = ref({
  page: 1,
  per_page: 10,
  search: "",
  status: "",
});

const showForm = ref(false);

const form = ref<CreateStockOpnamePayload>({
  opname_number: "",
  opname_date: new Date().toISOString().slice(0, 10),
  notes: "",
});

async function loadData() {
  loading.value = true;

  try {
    const result = await inventoryService.getOpnames(filters.value);
    items.value = result.items;
    pagination.value = result.pagination;
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? "Gagal memuat stock opname.");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.value = {
    opname_number: "",
    opname_date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

async function createOpname() {
  if (!form.value.opname_number.trim() || !form.value.opname_date) {
    toast.warning("Nomor dan tanggal stock opname wajib diisi.");
    return;
  }

  saving.value = true;

  try {
    const result = await inventoryService.createStockOpname(form.value);

    toast.success("Stock opname berhasil dibuat.");
    showForm.value = false;
    resetForm();

    await loadData();

    router.push({
      path: "/pharmacy/inventory/stock-opname-detail",
      query: { id: result.id },
    });
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? "Gagal membuat stock opname.");
  } finally {
    saving.value = false;
  }
}

function openDetail(id: number) {
  router.push({
    path: "/pharmacy/inventory/stock-opname-detail",
    query: { id },
  });
}

function changePage(page: number) {
  if (!pagination.value || page < 1 || page > pagination.value.total_pages) {
    return;
  }

  filters.value.page = page;
  loadData();
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

onMounted(loadData);
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
      <div>
        <h4 class="mb-1">Stock Opname</h4>
        <p class="text-slate-500 mb-0">Penghitungan dan penyesuaian stok fisik.</p>
      </div>

      <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" type="button" @click="showForm = !showForm">
        <i class="ti ti-plus me-1"></i>
        Buat Stock Opname
      </button>
    </div>

    <div v-if="showForm" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-4">
      <div class="card-header">
        <h5 class="mb-0">Form Stock Opname</h5>
      </div>

      <div class="p-5">
        <form @submit.prevent="createOpname">
          <div class="grid grid-cols-12 g-3">
            <div class="col-span-12 md:col-span-4">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Opname</label>
              <input v-model="form.opname_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: SO-2026-001" required />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Opname</label>
              <input v-model="form.opname_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" required />
            </div>

            <div class="col-span-12 md:col-span-4">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
              <input v-model="form.notes" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Opsional" />
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-3">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="showForm = false">Batal</button>

            <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="saving">
              <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
              Buat Opname
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <div class="grid grid-cols-12 g-2 mb-3">
          <div class="col-span-12 md:col-span-6">
            <input
              v-model="filters.search"
              type="search"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Cari nomor opname..."
              @keyup.enter="
                filters.page = 1;
                loadData();
              "
            />
          </div>

          <div class="col-span-12 md:col-span-3">
            <select
              v-model="filters.status"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              @change="
                filters.page = 1;
                loadData();
              "
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-3">
            <button
              class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50 w-full"
              type="button"
              @click="
                filters.page = 1;
                loadData();
              "
            >
              <i class="ti ti-search me-1"></i>
              Cari
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-primary-600"></div>
          <p class="text-slate-500 mt-2 mb-0">Memuat data...</p>
        </div>

        <div v-else class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm align-middle">
            <thead>
              <tr>
                <th>Nomor Opname</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Catatan</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in items" :key="item.id">
                <td class="font-semibold">{{ item.opname_number }}</td>
                <td>{{ formatDate(item.opname_date) }}</td>
                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="item.status === 'posted' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ item.status }}
                  </span>
                </td>
                <td>{{ item.notes || "-" }}</td>
                <td class="text-right">
                  <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" type="button" @click="openDetail(Number(item.id))">Detail</button>
                </td>
              </tr>

              <tr v-if="items.length === 0">
                <td colspan="5" class="text-center text-slate-500 py-4">Belum ada data stock opname.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination && pagination.total_pages > 1" class="flex justify-between items-center mt-3">
          <small class="text-slate-500"> Halaman {{ pagination.page }} dari {{ pagination.total_pages }} ({{ pagination.total }} data) </small>

          <div class="btn-group">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="!pagination.has_prev" @click="changePage(pagination.page - 1)">Sebelumnya</button>

            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="!pagination.has_next" @click="changePage(pagination.page + 1)">Berikutnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
