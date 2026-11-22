<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dosageFormService, {
  type DosageForm,
  type DosageFormPayload,
  type DosageFormPagination,
} from '@/modules/pharmacy/master/services/dosageFormService'
import { useToast } from '@/shared/composables/useToast'

// Ikon
import { Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'

// ── KOMPONEN UI CUSTOM KAMU ──
import BaseModal from '@/shared/components/ui/overlay/BaseModal.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseInputClearable from '@/shared/components/ui/form/BaseInputClearable.vue'

const toast = useToast()

const dosageForm = ref<DosageForm[]>([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const searchInput = ref('')
const search = ref('')
const statusFilter = ref('all')
const perPage = ref(10)

const pagination = ref<DosageFormPagination>({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
})

const showForm = ref(false)
const showDetail = ref(false)
const isEditing = ref(false)
const selectedDosageForm = ref<DosageForm | null>(null)

const form = reactive<DosageFormPayload>({
  name: '',
  is_active: 1,
})

const formErrors = reactive<Record<string, string>>({})

// Opsi untuk BaseSelect
const perPageOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]

const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Aktif', value: '1' },
  { label: 'Nonaktif', value: '0' },
]

const pageStart = computed(() => {
  if (pagination.value.total === 0) return 0
  return (pagination.value.current_page - 1) * pagination.value.per_page + 1
})

const pageEnd = computed(() => Math.min(pagination.value.current_page * pagination.value.per_page, pagination.value.total))
const hasPrevious = computed(() => pagination.value.current_page > 1)
const hasNext = computed(() => pagination.value.current_page < pagination.value.total_pages)

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return error?.message || 'Terjadi kesalahan pada server.'
}

async function loaddosageForm(page = 1) {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await dosageFormService.getAll({
      page,
      per_page: perPage.value,
      search: search.value,
      is_active: statusFilter.value === 'all' ? undefined : statusFilter.value === '1' ? 1 : 0,
    })

    const result = response.data // ApiResponse<DosageFormListData>
    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil data Bentuk Sediaan.')
    }

    dosageForm.value = result.data.items // DosageForm[]
    pagination.value = result.data.pagination
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
    dosageForm.value = []
  } finally {
    loading.value = false
  }
}

function applySearch() {
  search.value = searchInput.value.trim()
  loaddosageForm(1)
}

function changePerPage() {
  loaddosageForm(1)
}
function changeStatus() {
  loaddosageForm(1)
}

function previousPage() {
  if (hasPrevious.value) loaddosageForm(pagination.value.current_page - 1)
}

function nextPage() {
  if (hasNext.value) loaddosageForm(pagination.value.current_page + 1)
}

function clearMessages() {
  errorMessage.value = ''
  successMessage.value = ''
}

function clearForm() {
  form.name = ''
  form.is_active = 1
  Object.keys(formErrors).forEach((key) => delete formErrors[key])
}

function openCreate() {
  clearMessages()
  clearForm()
  selectedDosageForm.value = null
  isEditing.value = false
  showForm.value = true
}

async function openEdit(id: number) {
  clearMessages()
  try {
    const response = await dosageFormService.getById(id)
    const result = response.data // ApiResponse<DosageForm>
    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil detail Bentuk Sediaan.')
    }

    selectedDosageForm.value = result.data // DosageForm
    form.name = result.data.name
    form.is_active = Number(result.data.is_active)

    isEditing.value = true
    showForm.value = true
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  }
}

async function openDetail(id: number) {
  clearMessages()
  try {
    const response = await dosageFormService.getById(id)
    const result = response.data
    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal mengambil detail Bentuk Sediaan.')
    }

    selectedDosageForm.value = result.data
    showDetail.value = true
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  }
}

function closeForm() {
  showForm.value = false
  selectedDosageForm.value = null
}

function validateForm(): boolean {
  Object.keys(formErrors).forEach((key) => delete formErrors[key])

  const name = form.name.trim()
  if (!name) {
    formErrors.name = 'Nama Bentuk Sediaan wajib diisi.'
  } else if (name.length < 2 || name.length > 100) {
    formErrors.name = 'Nama Bentuk Sediaan harus 2–100 karakter.'
  }

  return Object.keys(formErrors).length === 0
}

async function saveDosageForm() {
  clearMessages()
  if (!validateForm()) return

  saving.value = true
  try {
    const payload: DosageFormPayload = {
      name: form.name.trim(),
      is_active: Number(form.is_active),
    }

    const response =
      isEditing.value && selectedDosageForm.value
        ? await dosageFormService.update(selectedDosageForm.value.id, payload)
        : await dosageFormService.create(payload)

    const result = response.data // ApiResponse<DosageForm>
    if (result.error) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menyimpan Bentuk Sediaan.')
    }

    showForm.value = false
    toast.success(isEditing.value ? 'Bentuk Sediaan berhasil diperbarui.' : 'Bentuk Sediaan berhasil ditambahkan.')
    await loaddosageForm(isEditing.value ? pagination.value.current_page : 1)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}

async function deleteDosageForm(DosageForm: DosageForm) {
  const confirmed = window.confirm(`Hapus Bentuk Sediaan "${DosageForm.name}"?`)
  if (!confirmed) return

  clearMessages()
  try {
    const response = await dosageFormService.delete(DosageForm.id)
    const result = response.data // ApiResponse<{ id: number }>
    if (result.error) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menghapus Bentuk Sediaan.')
    }
    toast.success('Bentuk Sediaan berhasil dihapus.')
    const currentPage = pagination.value.current_page
    const nextPageNumber = dosageForm.value.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage
    await loaddosageForm(nextPageNumber)
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  }
}

function closeDetail() {
  showDetail.value = false
  selectedDosageForm.value = null
}

onMounted(async () => {
  await loaddosageForm()
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="w-4 h-4" />
        Tambah Bentuk Sediaan
      </BaseButton>
    </div>

    <!-- Notifications -->
    <div
      v-if="successMessage"
      class="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-400"
    >
      <span>{{ successMessage }}</span>
      <button type="button" class="text-emerald-600 hover:text-emerald-800" @click="successMessage = ''"><X class="w-4 h-4" /></button>
    </div>
    <div
      v-if="errorMessage"
      class="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-400"
    >
      <span>{{ errorMessage }}</span>
      <button type="button" class="text-rose-600 hover:text-rose-800" @click="errorMessage = ''"><X class="w-4 h-4" /></button>
    </div>

    <!-- Main Table Card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <!-- Filters -->
      <div class="p-5 border-b border-slate-100 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div class="md:col-span-2">
            <BaseSelect v-model.number="perPage" :options="perPageOptions" label="Tampilkan" @update:model-value="changePerPage" />
          </div>

          <!-- Filter Status -->
          <div class="md:col-span-3">
            <BaseSelect
              v-model="statusFilter"
              :options="statusOptions"
              label="Status"
              placeholder="Semua Status"
              :searchable="false"
              @update:model-value="changeStatus"
            />
          </div>

          <div class="md:col-span-4">
            <div class="flex items-end gap-2">
              <div class="flex-1">
                <BaseInputClearable
                  v-model="searchInput"
                  label="Pencarian"
                  placeholder="Cari Betuk Sediaan..."
                  :icon="Search"
                  @keyup.enter="applySearch"
                />
              </div>

              <BaseButton variant="primary" class="h-10.5 px-4 shrink-0" @click="applySearch">
                <Search class="w-4 h-4" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="w-full overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead
            class="bg-slate-50 text-xs uppercase font-semibold text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
          >
            <tr>
              <th class="px-4 py-3 w-12 text-center">No.</th>
              <th class="px-4 py-3">Nama Bentuk Sediaan</th>
              <th class="px-4 py-3 w-28">Status</th>
              <th class="px-4 py-3 text-center w-36">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-8 text-center">
                <div class="flex items-center justify-center gap-2">
                  <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-r-transparent"></span>
                  <span>Memuat data Bentuk Sediaan...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="dosageForm.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500">Tidak ada data Bentuk Sediaan.</td>
            </tr>

            <tr
              v-for="(DosageForm, index) in dosageForm"
              :key="DosageForm.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-4 py-3 text-center text-slate-500">{{ pageStart + index }}</td>
              <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">{{ DosageForm.name }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    Number(DosageForm.is_active) === 1
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  "
                >
                  {{ Number(DosageForm.is_active) === 1 ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-center items-center gap-1">
                  <button
                    class="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                    title="Detail"
                    @click="openDetail(DosageForm.id)"
                  >
                    <Eye class="w-5 h-5" />
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800 transition-colors"
                    title="Edit"
                    @click="openEdit(DosageForm.id)"
                  >
                    <Pencil class="w-5 h-5" />
                  </button>
                  <button
                    class="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-colors"
                    title="Hapus"
                    @click="deleteDosageForm(DosageForm)"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="text-sm text-slate-500">
          Menampilkan
          <span class="font-medium text-slate-900 dark:text-white">{{ pageStart }}</span>
          sampai
          <span class="font-medium text-slate-900 dark:text-white">{{ pageEnd }}</span>
          dari
          <span class="font-medium text-slate-900 dark:text-white">{{ pagination.total }}</span>
          data
        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500">
            Halaman
            <span class="font-medium text-slate-900 dark:text-white">{{ pagination.current_page }}</span>
            dari
            <span class="font-medium text-slate-900 dark:text-white">{{ pagination.total_pages }}</span>
          </span>

          <div class="inline-flex -space-x-px">
            <BaseButton variant="secondary" size="sm" class="rounded-r-none" :disabled="!hasPrevious || loading" @click="previousPage">
              <ChevronLeft class="w-4 h-4 mr-1" />
              Sebelumnya
            </BaseButton>
            <BaseButton variant="secondary" size="sm" class="rounded-l-none" :disabled="!hasNext || loading" @click="nextPage">
              Berikutnya
              <ChevronRight class="w-4 h-4 ml-1" />
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ MODAL FORM ══════════ -->
    <BaseModal :open="showForm" :title="isEditing ? 'Edit Bentuk Sediaan' : 'Tambah Bentuk Sediaan'" max-width="md" @close="closeForm">
      <form id="DosageFormForm" @submit.prevent="saveDosageForm" class="space-y-4">
        <!-- Nama -->
        <BaseInput
          v-model="form.name"
          label="Nama Bentuk Sediaan"
          placeholder="Masukkan nama Bentuk Sediaan"
          maxlength="100"
          required
          :error="formErrors.name"
        />

        <!-- Status -->
        <div>
          <label class="inline-flex items-center gap-3 cursor-pointer">
            <input
              id="DosageFormActive"
              v-model="form.is_active"
              type="checkbox"
              :true-value="1"
              :false-value="0"
              class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              {{ Number(form.is_active) === 1 ? 'Aktif' : 'Nonaktif' }}
            </span>
          </label>
        </div>
      </form>

      <!-- Slot Footer -->
      <template #footer>
        <BaseButton variant="secondary" @click="closeForm" :disabled="saving">Batal</BaseButton>
        <BaseButton type="submit" form="DosageFormForm" variant="primary" :loading="saving">
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- ══════════ MODAL DETAIL ══════════ -->
    <BaseModal :open="showDetail" title="Detail Bentuk Sediaan" max-width="md" @close="closeDetail">
      <div v-if="selectedDosageForm" class="space-y-3">
        <dl class="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
          <dt class="font-medium text-slate-500 dark:text-slate-400">ID</dt>
          <dd class="sm:col-span-2 text-slate-900 dark:text-white">{{ selectedDosageForm.id }}</dd>

          <dt class="font-medium text-slate-500 dark:text-slate-400">Nama</dt>
          <dd class="sm:col-span-2 text-slate-900 dark:text-white font-semibold">{{ selectedDosageForm.name }}</dd>

          <dt class="font-medium text-slate-500 dark:text-slate-400">Status</dt>
          <dd class="sm:col-span-2">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
              :class="
                Number(selectedDosageForm.is_active) === 1
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              "
            >
              {{ Number(selectedDosageForm.is_active) === 1 ? 'Aktif' : 'Nonaktif' }}
            </span>
          </dd>

          <dt class="font-medium text-slate-500 dark:text-slate-400">Dibuat</dt>
          <dd class="sm:col-span-2 text-slate-900 dark:text-white">{{ selectedDosageForm.created_at || '-' }}</dd>

          <dt class="font-medium text-slate-500 dark:text-slate-400">Diperbarui</dt>
          <dd class="sm:col-span-2 text-slate-900 dark:text-white">{{ selectedDosageForm.updated_at || '-' }}</dd>
        </dl>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="closeDetail">Tutup</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
