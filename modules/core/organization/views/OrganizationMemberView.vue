<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Plus, Pencil, Ban, RefreshCw, Users } from 'lucide-vue-next'
import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import { useOrganizationStore } from '@/modules/auth/stores/organization.store'
import { organizationUnitsApi, type OrganizationUnit } from '../api/organization-unit.api'
import {
  organizationMembershipsApi,
  type OrganizationMembership,
  type OrganizationUser,
  type MembershipPayload,
} from '../api/organization-membership.api'

const organizationStore = useOrganizationStore()

const organizationId = computed(() => Number(organizationStore.activeOrganization?.id ?? 0))

const items = ref<OrganizationMembership[]>([])
const users = ref<OrganizationUser[]>([])
const units = ref<OrganizationUnit[]>([])

const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)

const search = ref('')
const statusFilter = ref('')
const page = ref(1)
const perPage = 10
const total = ref(0)
const lastPage = ref(1)

const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  user_id: 0,
  membership_role: 'member',
  status: 'active' as 'active' | 'inactive',
  is_default: false,
  unit_ids: [] as number[],
  default_unit_id: null as number | null,
})

let searchTimer: ReturnType<typeof setTimeout> | undefined

function getError(error: unknown): string {
  const e = error as {
    response?: { data?: { message?: string } }
    message?: string
  }

  return e.response?.data?.message ?? e.message ?? 'Terjadi kesalahan.'
}

async function loadUsers(): Promise<void> {
  const result = await organizationMembershipsApi.indexUsers({
    page: 1,
    per_page: 100,
  })

  users.value = result.items
}

async function loadUnits(): Promise<void> {
  if (!organizationId.value) {
    units.value = []
    return
  }

  units.value = await organizationUnitsApi.index(organizationId.value)
}

async function loadMemberships(): Promise<void> {
  if (!organizationId.value) {
    items.value = []
    total.value = 0
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await organizationMembershipsApi.index({
      organization_id: organizationId.value,
      page: page.value,
      per_page: perPage,
      q: search.value.trim() || undefined,
      status: statusFilter.value || undefined,
    })

    items.value = result.items
    total.value = result.pagination.total
    lastPage.value = result.pagination.last_page
  } catch (error) {
    errorMessage.value = getError(error)
  } finally {
    loading.value = false
  }
}

function resetForm(): void {
  editingId.value = null
  form.user_id = 0
  form.membership_role = 'member'
  form.status = 'active'
  form.is_default = false
  form.unit_ids = []
  form.default_unit_id = null
  showForm.value = false
}

function openCreate(): void {
  resetForm()
  showForm.value = true
}

function openEdit(item: OrganizationMembership): void {
  editingId.value = item.id
  form.user_id = item.user_id
  form.membership_role = item.membership_role
  form.status = item.status
  form.is_default = Boolean(Number(item.is_default))
  form.unit_ids = [...(item.unit_ids ?? [])]
  form.default_unit_id = item.unit_id
  showForm.value = true
}

function toggleUnit(unitId: number, checked: boolean): void {
  if (checked) {
    if (!form.unit_ids.includes(unitId)) {
      form.unit_ids.push(unitId)
    }
  } else {
    form.unit_ids = form.unit_ids.filter((id) => id !== unitId)

    if (form.default_unit_id === unitId) {
      form.default_unit_id = null
    }
  }
}

async function save(): Promise<void> {
  if (!organizationId.value) {
    errorMessage.value = 'Pilih organisasi aktif terlebih dahulu.'
    return
  }

  if (!editingId.value && !form.user_id) {
    errorMessage.value = 'User wajib dipilih.'
    return
  }

  if (!form.membership_role.trim()) {
    errorMessage.value = 'Role membership wajib diisi.'
    return
  }

  if (form.default_unit_id !== null && !form.unit_ids.includes(form.default_unit_id)) {
    errorMessage.value = 'Unit default harus termasuk unit yang ditugaskan.'
    return
  }

  const payload: MembershipPayload = {
    organization_id: organizationId.value,
    user_id: form.user_id || undefined,
    membership_role: form.membership_role.trim(),
    status: form.status,
    is_default: form.is_default,
    unit_ids: [...form.unit_ids],
    default_unit_id: form.default_unit_id,
  }

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (editingId.value) {
      await organizationMembershipsApi.update(editingId.value, payload)
      successMessage.value = 'Membership berhasil diperbarui.'
    } else {
      await organizationMembershipsApi.create(payload)
      successMessage.value = 'Membership berhasil dibuat.'
    }

    resetForm()
    await loadMemberships()
  } catch (error) {
    errorMessage.value = getError(error)
  } finally {
    saving.value = false
  }
}

async function deactivate(item: OrganizationMembership): Promise<void> {
  if (!organizationId.value) return

  const confirmed = window.confirm(`Nonaktifkan membership ${item.username ?? item.user_id}?`)

  if (!confirmed) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await organizationMembershipsApi.deactivate(organizationId.value, item.id)

    successMessage.value = 'Membership berhasil dinonaktifkan.'
    await loadMemberships()
  } catch (error) {
    errorMessage.value = getError(error)
  }
}

function changePage(nextPage: number): void {
  if (nextPage < 1 || nextPage > lastPage.value) return
  page.value = nextPage
  void loadMemberships()
}

watch([organizationId, statusFilter], () => {
  page.value = 1
  void loadMemberships()
})

watch(search, () => {
  page.value = 1
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void loadMemberships(), 350)
})

onMounted(async () => {
  try {
    if (!organizationStore.initialized) {
      await organizationStore.initialize()
    }

    await Promise.all([loadUsers(), loadUnits(), loadMemberships()])
  } catch (error) {
    errorMessage.value = getError(error)
  }
})
</script>

<template>
  <div>
    <PageHeader
      title="Organization Memberships"
      subtitle="Kelola pengguna, role, dan penugasan unit organisasi."
      :breadcrumbs="[{ label: 'Core' }, { label: 'Organization', to: '/core/organizations' }, { label: 'Memberships' }]"
    >
      <template #actions>
        <BaseButton variant="secondary" @click="loadMemberships">
          <RefreshCw class="h-4 w-4" />
          Refresh
        </BaseButton>
        <BaseButton @click="openCreate">
          <Plus class="h-4 w-4" />
          Tambah Anggota
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
      <h2 class="mb-4 font-semibold text-slate-800">
        {{ editingId ? 'Edit Membership' : 'Tambah Anggota' }}
      </h2>

      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="save">
        <label v-if="!editingId" class="text-sm text-slate-600">
          User
          <select v-model.number="form.user_id" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option :value="0" disabled>Pilih user</option>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }} (#{{ user.id }})</option>
          </select>
        </label>

        <label class="text-sm text-slate-600">
          Membership Role
          <input
            v-model="form.membership_role"
            required
            maxlength="50"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="member"
          />
        </label>

        <label class="text-sm text-slate-600">
          Status
          <select v-model="form.status" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label class="flex items-center gap-2 self-end pb-2 text-sm text-slate-600">
          <input v-model="form.is_default" type="checkbox" />
          Jadikan organisasi default user
        </label>

        <div class="md:col-span-2">
          <div class="mb-2 text-sm font-medium text-slate-700">Penugasan Unit</div>

          <div v-if="units.length === 0" class="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            Belum ada unit aktif. Buat unit terlebih dahulu.
          </div>

          <div v-else class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label v-for="unit in units" :key="unit.id" class="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm">
              <input
                type="checkbox"
                :checked="form.unit_ids.includes(unit.id)"
                @change="toggleUnit(unit.id, ($event.target as HTMLInputElement).checked)"
              />
              <span>
                <span class="block font-medium text-slate-700">
                  {{ unit.name }}
                </span>
                <span class="text-xs text-slate-400">{{ unit.code }} · {{ unit.unit_type }}</span>
              </span>
            </label>
          </div>
        </div>

        <label class="text-sm text-slate-600">
          Unit Default
          <select v-model.number="form.default_unit_id" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option :value="null">Tidak ada unit default</option>
            <option v-for="unit in units.filter((item) => form.unit_ids.includes(item.id))" :key="unit.id" :value="unit.id">
              {{ unit.code }} - {{ unit.name }}
            </option>
          </select>
        </label>

        <div class="flex items-end justify-end gap-2">
          <BaseButton variant="secondary" @click="resetForm">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">Simpan</BaseButton>
        </div>
      </form>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_200px]">
        <input
          v-model="search"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Cari username, role, atau user ID..."
        />

        <select v-model="statusFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Semua status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="flex items-center gap-2 border-b border-slate-100 p-4 text-sm font-semibold text-slate-700">
        <Users class="h-4 w-4" />
        Anggota Organisasi
        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
          {{ total }}
        </span>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">Memuat membership...</div>

      <div v-else-if="items.length === 0" class="p-8 text-center text-sm text-slate-500">Belum ada anggota organisasi.</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-4 py-3">User</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Unit</th>
              <th class="px-4 py-3">Default</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in items" :key="item.id">
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">
                  {{ item.username ?? `User #${item.user_id}` }}
                </div>
                <div class="text-xs text-slate-400">ID {{ item.user_id }}</div>
              </td>

              <td class="px-4 py-3 text-slate-600">
                {{ item.membership_role }}
              </td>

              <td class="px-4 py-3">
                <div v-if="item.units?.length" class="flex flex-wrap gap-1">
                  <span v-for="unit in item.units" :key="unit.id" class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {{ unit.name }}
                  </span>
                </div>
                <span v-else class="text-slate-400">Belum ditugaskan</span>
              </td>

              <td class="px-4 py-3">
                <span v-if="Boolean(Number(item.is_default))" class="text-xs font-medium text-emerald-700">Default</span>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>

              <td class="px-4 py-3">
                <span
                  class="rounded-full px-2 py-1 text-xs"
                  :class="item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit" @click="openEdit(item)">
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    v-if="item.status === 'active'"
                    class="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    title="Nonaktifkan"
                    @click="deactivate(item)"
                  >
                    <Ban class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 p-4 text-sm">
        <span class="text-slate-500">Halaman {{ page }} dari {{ lastPage }} · {{ total }} data</span>

        <div class="flex gap-2">
          <BaseButton size="sm" variant="secondary" :disabled="page <= 1" @click="changePage(page - 1)">Sebelumnya</BaseButton>
          <BaseButton size="sm" variant="secondary" :disabled="page >= lastPage" @click="changePage(page + 1)">Berikutnya</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>
