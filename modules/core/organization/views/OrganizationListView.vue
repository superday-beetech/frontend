<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Building2, Plus, Search, RefreshCw, Pencil, Archive, X, Save } from 'lucide-vue-next'

import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'

import { useOrganizationManagementStore } from '../stores/organization.store'

import type { Organization, OrganizationPayload } from '../types/organization.types'

const store = useOrganizationManagementStore()

const search = ref('')
const page = ref(1)
const perPage = ref(10)

const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = ref<OrganizationPayload>({
  code: '',
  slug: '',
  name: '',
  legal_name: '',
  organization_type: 'business',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
})

const isEditing = computed(() => editingId.value !== null)

const totalPages = computed(() => Math.max(1, store.pagination.last_page || 1))

let searchTimer: ReturnType<typeof setTimeout> | undefined

function errorText(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        message?: string | string[]
        errors?: Record<string, string>
      }
    }
    message?: string
  }

  const message = err.response?.data?.message

  if (Array.isArray(message)) return message.join(', ')
  if (message) return message

  const errors = err.response?.data?.errors
  if (errors) return Object.values(errors).join(', ')

  return err.message || 'Terjadi kesalahan.'
}

async function loadData(targetPage = page.value) {
  try {
    await store.fetchList({
      page: targetPage,
      per_page: perPage.value,
      q: search.value.trim() || undefined,
    })

    page.value = store.pagination.current_page
  } catch (error) {
    window.alert(errorText(error))
  }
}

function resetForm() {
  editingId.value = null

  form.value = {
    code: '',
    slug: '',
    name: '',
    legal_name: '',
    organization_type: 'business',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
  }
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function openEdit(item: Organization) {
  editingId.value = item.id

  form.value = {
    name: item.name,
    legal_name: item.legal_name ?? '',
    organization_type: item.organization_type,
    timezone: item.timezone,
    currency: item.currency,
  }

  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

function makeSlug() {
  if (isEditing.value) return

  form.value.slug = String(form.value.name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function submitForm() {
  if (!form.value.name?.trim()) {
    window.alert('Nama organisasi wajib diisi.')
    return
  }

  const wasEditing = isEditing.value
  const currentPage = page.value

  try {
    if (wasEditing && editingId.value !== null) {
      await store.update(editingId.value, {
        name: form.value.name.trim(),
        legal_name: form.value.legal_name?.trim() || null,
        organization_type: form.value.organization_type,
        timezone: form.value.timezone,
        currency: form.value.currency,
      })

      window.alert('Organisasi berhasil diperbarui.')
    } else {
      if (!form.value.code?.trim()) {
        window.alert('Kode organisasi wajib diisi.')
        return
      }

      if (!form.value.slug?.trim()) {
        window.alert('Slug organisasi wajib diisi.')
        return
      }

      await store.create({
        code: form.value.code.trim().toUpperCase(),
        slug: form.value.slug.trim().toLowerCase(),
        name: form.value.name.trim(),
        legal_name: form.value.legal_name?.trim() || null,
        organization_type: form.value.organization_type,
        timezone: form.value.timezone,
        currency: form.value.currency,
      })

      window.alert('Organisasi berhasil dibuat.')
    }

    closeForm()
    await loadData(wasEditing ? currentPage : 1)
  } catch (error) {
    window.alert(errorText(error))
  }
}

async function archiveOrganization(item: Organization) {
  const confirmed = window.confirm(`Arsipkan organisasi "${item.name}"?\n\nOrganisasi tidak akan dihapus secara permanen.`)

  if (!confirmed) return

  try {
    await store.archive(item.id)

    window.alert('Organisasi berhasil diarsipkan.')

    const nextPage = store.items.length === 0 && page.value > 1 ? page.value - 1 : page.value

    await loadData(nextPage)
  } catch (error) {
    window.alert(errorText(error))
  }
}

function previousPage() {
  if (page.value <= 1) return
  loadData(page.value - 1)
}

function nextPage() {
  if (page.value >= totalPages.value) return
  loadData(page.value + 1)
}

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(() => {
    page.value = 1
    loadData(1)
  }, 350)
})

watch(perPage, () => {
  page.value = 1
  loadData(1)
})
onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
onMounted(() => loadData(1))
</script>

<template>
  <div class="space-y-5">
    <PageHeader
      title="Manajemen Organisasi"
      subtitle="Kelola organisasi yang terdaftar dan dapat diakses oleh akun Anda."
      :breadcrumbs="[{ label: 'Core' }, { label: 'Organisasi' }]"
    >
      <template #actions>
        <BaseButton variant="secondary" :loading="store.loading" @click="loadData()">
          <RefreshCw class="h-4 w-4" />
          Refresh
        </BaseButton>

        <BaseButton @click="openCreate">
          <Plus class="h-4 w-4" />
          Tambah Organisasi
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Search -->
    <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            v-model="search"
            type="search"
            placeholder="Cari kode, nama, atau slug organisasi..."
            class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-950"
          />
        </div>

        <select
          v-model.number="perPage"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option :value="10">10 data</option>
          <option :value="20">20 data</option>
          <option :value="50">50 data</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
            <tr>
              <th class="px-5 py-3">Organisasi</th>
              <th class="px-5 py-3">Kode</th>
              <th class="px-5 py-3">Tipe</th>
              <th class="px-5 py-3">Peran Anda</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="store.loading">
              <td colspan="6" class="px-5 py-12 text-center text-slate-500">Memuat data organisasi...</td>
            </tr>

            <tr v-else-if="store.items.length === 0">
              <td colspan="6" class="px-5 py-12 text-center">
                <Building2 class="mx-auto mb-3 h-9 w-9 text-slate-300" />
                <p class="font-medium text-slate-700 dark:text-slate-200">Belum ada organisasi</p>
                <p class="mt-1 text-xs text-slate-500">Tambahkan organisasi untuk mulai mengelola ekosistem usaha.</p>
              </td>
            </tr>

            <tr v-for="item in store.items" v-else :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <td class="px-5 py-4">
                <div class="font-semibold text-slate-800 dark:text-white">
                  {{ item.name }}
                </div>

                <div class="mt-1 text-xs text-slate-500">
                  {{ item.legal_name || item.slug }}
                </div>
              </td>

              <td class="px-5 py-4 font-mono text-xs">
                {{ item.code }}
              </td>

              <td class="px-5 py-4">
                {{ item.organization_type }}
              </td>

              <td class="px-5 py-4 capitalize">
                {{ item.membership_role || '-' }}
                <span v-if="item.is_default === true || item.is_default === 1" class="ml-1 text-xs text-primary-600">(Default)</span>
              </td>

              <td class="px-5 py-4">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="
                    item.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  "
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="px-5 py-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    title="Edit organisasi"
                    class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
                    @click="openEdit(item)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    title="Arsipkan organisasi"
                    class="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                    @click="archiveOrganization(item)"
                  >
                    <Archive class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
      >
        <span class="text-xs text-slate-500">Total {{ store.pagination.total }} organisasi</span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="page <= 1 || store.loading"
            class="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
            @click="previousPage"
          >
            Sebelumnya
          </button>

          <span class="text-xs text-slate-500">{{ page }} / {{ totalPages }}</span>

          <button
            type="button"
            :disabled="page >= totalPages || store.loading"
            class="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
            @click="nextPage"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
        @click.self="closeForm"
      >
        <div class="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">
                {{ isEditing ? 'Edit Organisasi' : 'Tambah Organisasi' }}
              </h2>

              <p class="mt-1 text-xs text-slate-500">Lengkapi informasi dasar organisasi.</p>
            </div>

            <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" @click="closeForm">
              <X class="h-5 w-5" />
            </button>
          </div>

          <form class="space-y-4 p-6" @submit.prevent="submitForm">
            <div v-if="!isEditing" class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1.5 block text-sm font-medium">Kode Organisasi *</span>

                <input
                  v-model="form.code"
                  required
                  maxlength="50"
                  placeholder="ACN"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <label class="block">
                <span class="mb-1.5 block text-sm font-medium">Slug *</span>

                <input
                  v-model="form.slug"
                  required
                  maxlength="100"
                  placeholder="adi-cakra-nata"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
            </div>

            <label class="block">
              <span class="mb-1.5 block text-sm font-medium">Nama Organisasi *</span>

              <input
                v-model="form.name"
                required
                maxlength="150"
                placeholder="Nama organisasi"
                class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950"
                @blur="makeSlug"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-medium">Nama Legal</span>

              <input
                v-model="form.legal_name"
                maxlength="200"
                placeholder="Nama badan hukum (opsional)"
                class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1.5 block text-sm font-medium">Tipe Organisasi *</span>

                <select
                  v-model="form.organization_type"
                  required
                  class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="business">Business</option>
                  <option value="cooperative">Cooperative</option>
                  <option value="non_profit">Non Profit</option>
                  <option value="government">Government</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-1.5 block text-sm font-medium">Zona Waktu *</span>

                <input
                  v-model="form.timezone"
                  required
                  maxlength="64"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
            </div>

            <label class="block">
              <span class="mb-1.5 block text-sm font-medium">Mata Uang *</span>

              <input
                v-model="form.currency"
                required
                maxlength="3"
                minlength="3"
                class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div class="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <BaseButton type="button" variant="secondary" @click="closeForm">Batal</BaseButton>

              <BaseButton type="submit" :loading="store.saving">
                <Save class="h-4 w-4" />
                {{ isEditing ? 'Simpan Perubahan' : 'Buat Organisasi' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
