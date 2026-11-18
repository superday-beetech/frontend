<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import category.api, { type Category, type CategoryPayload, type CategoryPagination } from "@/modules/pharmacy/master/api/category.api";
import { useToast } from "@/shared/composables/useToast";
import { useCategoryTypes } from "../composables/useCategoryTypes";
import type { CategoryTypeOption } from "../api/category-type.api";

const toast = useToast();

const { load: loadCategoryTypes } = useCategoryTypes();
const typeOptions = ref<CategoryTypeOption[]>([]);

// Halaman ini fokus farmasi
const FIXED_MODULE = "pharmacy";

// const TYPE_OPTIONS = ["obat", "alkes", "herbal", "makanan", "minuman", "sembako", "kebersihan", "umum"];

const categories = ref<Category[]>([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const searchInput = ref("");
const search = ref("");
const statusFilter = ref("all");
const typeFilter = ref("");
const perPage = ref(10);

const pagination = ref<CategoryPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
});

const showForm = ref(false);
const showDetail = ref(false);
const isEditing = ref(false);

const selectedCategory = ref<Category | null>(null);

const form = reactive<CategoryPayload>({
  module: FIXED_MODULE,
  type: "obat",
  name: "",
  description: "",
  is_active: 1,
});

const formErrors = reactive<Record<string, string>>({});

const pageStart = computed(() => {
  if (pagination.value.total === 0) return 0;
  return (pagination.value.current_page - 1) * pagination.value.per_page + 1;
});

const pageEnd = computed(() => Math.min(pagination.value.current_page * pagination.value.per_page, pagination.value.total));

const hasPrevious = computed(() => pagination.value.current_page > 1);
const hasNext = computed(() => pagination.value.current_page < pagination.value.total_pages);

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return error?.message || "Terjadi kesalahan pada server.";
}

async function loadCategories(page = 1) {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await category.api.getAll({
      page,
      per_page: perPage.value,
      search: search.value,
      module: FIXED_MODULE, // ← filter module farmasi
      type: typeFilter.value || undefined,
      is_active: statusFilter.value === "all" ? undefined : statusFilter.value,
    });

    if (response.error || !response.data) {
      throw new Error(typeof response.message === "string" ? response.message : "Gagal mengambil data kategori.");
    }

    categories.value = response.data.items;
    pagination.value = response.data.pagination;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
}

function applySearch() {
  search.value = searchInput.value.trim();
  loadCategories(1);
}

function changePerPage() {
  loadCategories(1);
}

function changeStatus() {
  loadCategories(1);
}

function changeType() {
  loadCategories(1);
}

function previousPage() {
  if (hasPrevious.value) {
    loadCategories(pagination.value.current_page - 1);
  }
}

function nextPage() {
  if (hasNext.value) {
    loadCategories(pagination.value.current_page + 1);
  }
}

function clearMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function clearForm() {
  form.module = FIXED_MODULE;
  form.type = "obat";
  form.name = "";
  form.description = "";
  form.is_active = 1;

  Object.keys(formErrors).forEach((key) => {
    delete formErrors[key];
  });
}

function openCreate() {
  clearMessages();
  clearForm();

  selectedCategory.value = null;
  isEditing.value = false;
  showForm.value = true;
}

async function openEdit(id: number) {
  clearMessages();

  try {
    const response = await category.api.getById(id);

    if (response.error || !response.data) {
      throw new Error("Gagal mengambil detail kategori.");
    }

    selectedCategory.value = response.data;

    form.module = response.data.module ?? FIXED_MODULE;
    form.type = response.data.type ?? "obat";
    form.name = response.data.name;
    form.description = response.data.description ?? "";
    form.is_active = Number(response.data.is_active);

    isEditing.value = true;
    showForm.value = true;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
}

async function openDetail(id: number) {
  clearMessages();

  try {
    const response = await category.api.getById(id);

    if (response.error || !response.data) {
      throw new Error("Gagal mengambil detail kategori.");
    }

    selectedCategory.value = response.data;
    showDetail.value = true;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
}

function closeForm() {
  showForm.value = false;
  selectedCategory.value = null;
}

function validateForm(): boolean {
  Object.keys(formErrors).forEach((key) => {
    delete formErrors[key];
  });

  if (!form.module) {
    formErrors.module = "Module wajib dipilih.";
  }

  if (!form.type.trim()) {
    formErrors.type = "Tipe wajib diisi.";
  } else if (form.type.trim().length > 30) {
    formErrors.type = "Tipe maksimal 30 karakter.";
  }

  const name = form.name.trim();

  if (!name) {
    formErrors.name = "Nama kategori wajib diisi.";
  } else if (name.length < 2 || name.length > 100) {
    formErrors.name = "Nama kategori harus 2–100 karakter.";
  }

  if ((form.description?.length ?? 0) > 1000) {
    formErrors.description = "Deskripsi maksimal 1000 karakter.";
  }

  return Object.keys(formErrors).length === 0;
}

async function saveCategory() {
  clearMessages();

  if (!validateForm()) return;

  saving.value = true;

  try {
    const payload: CategoryPayload = {
      module: form.module,
      type: form.type.trim(),
      name: form.name.trim(),
      description: form.description?.trim() || null,
      is_active: Number(form.is_active),
    };

    const response = isEditing.value && selectedCategory.value ? await category.api.update(selectedCategory.value.id, payload) : await category.api.create(payload);

    if (response.error) {
      throw new Error(typeof response.message === "string" ? response.message : "Gagal menyimpan kategori.");
    }

    showForm.value = false;
    toast.success(isEditing.value ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.");

    await loadCategories(isEditing.value ? pagination.value.current_page : 1);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    saving.value = false;
  }
}

async function deleteCategory(category: Category) {
  const confirmed = window.confirm(`Hapus kategori "${category.name}"?`);
  if (!confirmed) return;

  clearMessages();

  try {
    const response = await category.api.delete(category.id);

    if (response.error) {
      throw new Error(typeof response.message === "string" ? response.message : "Gagal menghapus kategori.");
    }

    toast.success("Kategori berhasil dihapus.");

    const currentPage = pagination.value.current_page;
    const nextPageNumber = categories.value.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;

    await loadCategories(nextPageNumber);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
}

function closeDetail() {
  showDetail.value = false;
  selectedCategory.value = null;
}
function typeLabel(code: string): string {
  return typeOptions.value.find((t) => t.value === code)?.label ?? code;
}

onMounted(async () => {
  const types = await loadCategoryTypes(FIXED_MODULE);
  typeOptions.value = types;
  await loadCategories();
});
</script>

<template>
  <div class="w-full">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h4 class="mb-1">Kategori Produk Farmasi</h4>
        <p class="text-slate-500 mb-0">Pengelolaan kategori produk apotek (module: {{ FIXED_MODULE }}).</p>
      </div>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="openCreate">
        <i class="ti ti-plus me-1"></i>
        Tambah Kategori
      </button>
    </div>

    <!-- Notifications -->
    <div v-if="successMessage" class="rounded-lg border px-4 py-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-800 alert-dismissible" role="alert">
      {{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>

    <div v-if="errorMessage" class="rounded-lg border px-4 py-3 text-sm border-rose-200 bg-rose-50 text-rose-800 alert-dismissible" role="alert">
      {{ errorMessage }}
      <button type="button" class="btn-close" @click="errorMessage = ''"></button>
    </div>

    <!-- Main Table -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="p-5">
        <!-- Filters -->
        <div class="grid grid-cols-12 g-3 mb-4">
          <div class="col-span-12 md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Show entries </label>
            <select v-model.number="perPage" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @change="changePerPage">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tipe </label>
            <select v-model="typeFilter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @change="changeType">
              <option value="">Semua Tipe</option>
              <option v-for="t in typeOptions" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Status </label>
            <select v-model="statusFilter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" @change="changeStatus">
              <option value="all">Semua Status</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>

          <div class="col-span-12 md:col-span-4">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Pencarian </label>
            <div class="flex w-full items-stretch">
              <input v-model="searchInput" type="search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Cari nama atau deskripsi kategori..." @keyup.enter="applySearch" />
              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50" @click="applySearch">
                <i class="ti ti-search me-1"></i>
                Cari
              </button>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="w-full overflow-x-auto">
          <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle">
            <thead class="table-light">
              <tr>
                <th width="60">No.</th>
                <th>Nama Kategori</th>
                <th width="100">Tipe</th>
                <th>Deskripsi</th>
                <th width="110">Status</th>
                <th width="160" class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm text-primary-600 me-2"></div>
                  Memuat data kategori...
                </td>
              </tr>

              <tr v-else-if="categories.length === 0">
                <td colspan="6" class="text-center text-slate-500 py-5">Tidak ada data kategori.</td>
              </tr>

              <tr v-for="(category, index) in categories" :key="category.id">
                <td>{{ pageStart + index }}</td>
                <td class="font-semibold">{{ category.name }}</td>
                <td>
                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 text-dark">
                    {{ typeLabel(category.type) }}
                  </span>
                </td>

                <td>{{ category.description || "-" }}</td>
                <td>
                  <span :class="Number(category.is_active) === 1 ? 'badge bg-success-subtle text-success' : 'badge bg-danger-subtle text-danger'">
                    {{ Number(category.is_active) === 1 ? "Aktif" : "Nonaktif" }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-outline-info" title="Detail" @click="openDetail(category.id)">
                      <i class="ti ti-eye"></i>
                    </button>
                    <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50" title="Edit" @click="openEdit(category.id)">
                      <i class="ti ti-edit"></i>
                    </button>
                    <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-outline-danger" title="Hapus" @click="deleteCategory(category)">
                      <i class="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-wrap justify-between items-center gap-3 mt-3">
          <div class="text-slate-500 small">Menampilkan {{ pageStart }} sampai {{ pageEnd }} dari {{ pagination.total }} data</div>

          <div class="flex items-center gap-2">
            <span class="text-slate-500 small">
              Halaman {{ pagination.current_page }} dari
              {{ pagination.total_pages }}
            </span>

            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="!hasPrevious || loading" @click="previousPage">
              <i class="ti ti-chevron-left"></i>
              Sebelumnya
            </button>

            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-slate-300 text-slate-700 hover:bg-slate-50" :disabled="!hasNext || loading" @click="nextPage">
              Berikutnya
              <i class="ti ti-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showForm" class="modal fade show block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? "Edit Kategori" : "Tambah Kategori" }}
            </h5>
            <button type="button" class="btn-close" :disabled="saving" @click="closeForm"></button>
          </div>

          <form @submit.prevent="saveCategory">
            <div class="modal-body">
              <!-- Module (readonly untuk farmasi) -->
              <div class="mb-3">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Module</label>
                <input :value="form.module" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" disabled />
                <div class="form-text">
                  Module ditetapkan: <strong>{{ form.module }}</strong
                  >.
                </div>
              </div>

              <!-- Tipe -->
              <div class="mb-3">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipe <span class="text-rose-600">*</span></label>
                <select v-model="form.type" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :class="{ 'is-invalid': formErrors.type }">
                  <option value="" disabled>Pilih tipe</option>
                  <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }} ({{ t.value }})</option>
                </select>
                <div v-if="formErrors.type" class="invalid-feedback">
                  {{ formErrors.type }}
                </div>
              </div>

              <!-- Nama -->
              <div class="mb-3">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Kategori <span class="text-rose-600">*</span> </label>
                <input v-model="form.name" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :class="{ 'is-invalid': formErrors.name }" maxlength="100" placeholder="Masukkan nama kategori" />
                <div v-if="formErrors.name" class="invalid-feedback">
                  {{ formErrors.name }}
                </div>
              </div>

              <!-- Deskripsi -->
              <div class="mb-3">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi</label>
                <textarea v-model="form.description" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :class="{ 'is-invalid': formErrors.description }" rows="3" maxlength="1000" placeholder="Deskripsi kategori"></textarea>
                <div v-if="formErrors.description" class="invalid-feedback">
                  {{ formErrors.description }}
                </div>
              </div>

              <!-- Status -->
              <div class="mb-3">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 block">Status</label>
                <div class="form-check form-switch">
                  <input id="categoryActive" v-model="form.is_active" class="form-check-input" type="checkbox" :true-value="1" :false-value="0" />
                  <label class="form-check-label" for="categoryActive">
                    {{ Number(form.is_active) === 1 ? "Aktif" : "Nonaktif" }}
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="saving" @click="closeForm">Batal</button>
              <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="saving">
                <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
                {{ saving ? "Menyimpan..." : "Simpan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetail && selectedCategory" class="modal fade show block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Kategori</h5>
            <button type="button" class="btn-close" @click="closeDetail"></button>
          </div>

          <div class="modal-body">
            <dl class="grid grid-cols-12 mb-0">
              <dt class="col-4">ID</dt>
              <dd class="col-8">{{ selectedCategory.id }}</dd>

              <dt class="col-4">Module</dt>
              <dd class="col-8">{{ selectedCategory.module }}</dd>

              <dt class="col-4">Tipe</dt>
              <dd class="col-8">
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 text-dark">
                  {{ selectedCategory.type }}
                </span>
              </dd>

              <dt class="col-4">Nama</dt>
              <dd class="col-8">{{ selectedCategory.name }}</dd>

              <dt class="col-4">Deskripsi</dt>
              <dd class="col-8">
                {{ selectedCategory.description || "-" }}
              </dd>

              <dt class="col-4">Status</dt>
              <dd class="col-8">
                {{ Number(selectedCategory.is_active) === 1 ? "Aktif" : "Nonaktif" }}
              </dd>

              <dt class="col-4">Dibuat</dt>
              <dd class="col-8">{{ selectedCategory.created_at || "-" }}</dd>

              <dt class="col-4">Diperbarui</dt>
              <dd class="col-8">{{ selectedCategory.updated_at || "-" }}</dd>
            </dl>
          </div>

          <div class="modal-footer">
            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="closeDetail">Tutup</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showForm || showDetail" class="modal-backdrop fade show"></div>
  </div>
</template>
