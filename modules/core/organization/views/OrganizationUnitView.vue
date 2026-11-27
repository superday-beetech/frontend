<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Plus, Pencil, Ban, RefreshCw, Building2 } from 'lucide-vue-next'
import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import { useOrganizationStore } from '@/modules/auth/stores/organization.store'
import { organizationUnitsApi, type OrganizationUnit, type OrganizationUnitPayload } from '../api/organization-unit.api'

const organizationStore = useOrganizationStore()

const organizationId = computed(() => Number(organizationStore.activeOrganization?.id ?? 0))

const units = ref<OrganizationUnit[]>([])
const loading = ref(false)
const saving = ref(false)
const showInactive = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  parent_id: null as number | null,
  code: '',
  name: '',
  unit_type: 'department',
  status: 'active' as 'active' | 'inactive',
})

const activeParentOptions = computed(() => units.value.filter((unit) => unit.status === 'active' && unit.id !== editingId.value))

const visibleUnits = computed(() => units.value)

function getParentName(parentId: number | null): string {
  if (!parentId) return 'Unit utama'
  return units.value.find((unit) => unit.id === parentId)?.name ?? 'Parent tidak ditemukan'
}

function getError(error: unknown): string {
  const e = error as {
    response?: { data?: { message?: string } }
    message?: string
  }

  return e.response?.data?.message ?? e.message ?? 'Terjadi kesalahan.'
}

async function loadUnits(): Promise<void> {
  if (!organizationId.value) {
    units.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    units.value = await organizationUnitsApi.index(organizationId.value, showInactive.value)
  } catch (error) {
    errorMessage.value = getError(error)
  } finally {
    loading.value = false
  }
}

function resetForm(): void {
  editingId.value = null
  form.parent_id = null
  form.code = ''
  form.name = ''
  form.unit_type = 'department'
  form.status = 'active'
  showForm.value = false
}

function openCreate(): void {
  resetForm()
  showForm.value = true
}

function openEdit(unit: OrganizationUnit): void {
  editingId.value = unit.id
  form.parent_id = unit.parent_id
  form.code = unit.code
  form.name = unit.name
  form.unit_type = unit.unit_type
  form.status = unit.status
  showForm.value = true
}

async function save(): Promise<void> {
  if (!organizationId.value) {
    errorMessage.value = 'Pilih organisasi aktif terlebih dahulu.'
    return
  }

  if (!form.code.trim() || !form.name.trim()) {
    errorMessage.value = 'Kode dan nama unit wajib diisi.'
    return
  }

  const payload: OrganizationUnitPayload = {
    parent_id: form.parent_id,
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    unit_type: form.unit_type.trim(),
    status: form.status,
  }

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (editingId.value) {
      await organizationUnitsApi.update(organizationId.value, editingId.value, payload)
      successMessage.value = 'Unit berhasil diperbarui.'
    } else {
      await organizationUnitsApi.create(organizationId.value, payload)
      successMessage.value = 'Unit berhasil dibuat.'
    }

    resetForm()
    await loadUnits()
  } catch (error) {
    errorMessage.value = getError(error)
  } finally {
    saving.value = false
  }
}

async function deactivate(unit: OrganizationUnit): Promise<void> {
  if (!organizationId.value) return

  const confirmed = window.confirm(`Nonaktifkan unit "${unit.name}"?`)

  if (!confirmed) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await organizationUnitsApi.deactivate(organizationId.value, unit.id)
    successMessage.value = 'Unit berhasil dinonaktifkan.'
    await loadUnits()
  } catch (error) {
    errorMessage.value = getError(error)
  }
}

watch([organizationId, showInactive], () => {
  void loadUnits()
})

onMounted(async () => {
  if (!organizationStore.initialized) {
    await organizationStore.initialize()
  }
  await loadUnits()
})
</script>

<template>
  <div>
    <PageHeader
      title="Organization Units"
      subtitle="Kelola struktur dan unit dalam organisasi aktif."
      :breadcrumbs="[{ label: 'Core' }, { label: 'Organization', to: '/core/organizations' }, { label: 'Units' }]"
    >
      <template #actions>
        <BaseButton variant="secondary" @click="loadUnits">
          <RefreshCw class="h-4 w-4" />
          Refresh
        </BaseButton>
        <BaseButton @click="openCreate">
          <Plus class="h-4 w-4" />
          Tambah Unit
        </BaseButton>
      </template>
    </PageHeader>

    <div v-if="!organizationId" class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Pilih organisasi aktif terlebih dahulu.
    </div>

    <div v-if="errorMessage" class="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <section v-if="showForm" class="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-4 text-base font-semibold text-slate-800">
        {{ editingId ? 'Edit Unit' : 'Tambah Unit' }}
      </h2>

      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="save">
        <label class="text-sm text-slate-600">
          Kode Unit
          <input
            v-model="form.code"
            required
            maxlength="50"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500"
            placeholder="HQ"
          />
        </label>

        <label class="text-sm text-slate-600">
          Nama Unit
          <input
            v-model="form.name"
            required
            maxlength="150"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-primary-500"
            placeholder="Head Office"
          />
        </label>

        <label class="text-sm text-slate-600">
          Parent Unit
          <select v-model="form.parent_id" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option :value="null">Tidak memiliki parent</option>
            <option v-for="parent in activeParentOptions" :key="parent.id" :value="parent.id">{{ parent.code }} - {{ parent.name }}</option>
          </select>
        </label>

        <label class="text-sm text-slate-600">
          Jenis Unit
          <input
            v-model="form.unit_type"
            required
            maxlength="50"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="department"
          />
        </label>

        <label class="text-sm text-slate-600">
          Status
          <select v-model="form.status" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <div class="flex items-end justify-end gap-2">
          <BaseButton variant="secondary" @click="resetForm">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">Simpan</BaseButton>
        </div>
      </form>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Building2 class="h-4 w-4" />
          Daftar Unit
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {{ visibleUnits.length }}
          </span>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-600">
          <input v-model="showInactive" type="checkbox" />
          Tampilkan nonaktif
        </label>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Memuat unit organisasi...</div>

      <div v-else-if="visibleUnits.length === 0" class="p-8 text-center text-sm text-slate-500">Belum ada unit organisasi.</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">Kode</th>
              <th class="px-4 py-3">Nama Unit</th>
              <th class="px-4 py-3">Parent</th>
              <th class="px-4 py-3">Jenis</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-for="unit in visibleUnits" :key="unit.id">
              <td class="px-4 py-3 font-medium text-slate-700">
                {{ unit.code }}
              </td>
              <td class="px-4 py-3 text-slate-800">
                {{ unit.name }}
              </td>
              <td class="px-4 py-3 text-slate-500">
                {{ getParentName(unit.parent_id) }}
              </td>
              <td class="px-4 py-3 text-slate-500">
                {{ unit.unit_type }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs"
                  :class="unit.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ unit.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit" @click="openEdit(unit)">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    v-if="unit.status === 'active'"
                    class="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    title="Nonaktifkan"
                    @click="deactivate(unit)"
                  >
                    <Ban class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
