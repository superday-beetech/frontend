<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Building2, Check, LoaderCircle, RefreshCw } from 'lucide-vue-next'
import { useOrganizationStore } from '../stores/organization.store'
import { useToast } from '@/shared/composables/useToast'

const router = useRouter()
const organization = useOrganizationStore()
const toast = useToast()
const selectedId = ref<number | null>(null)

onMounted(async () => {
  if (!organization.initialized) {
    try {
      await organization.initialize()
    } catch {
      // Pesan error ditampilkan dari state store.
    }
  }
})

async function selectOrganization(id: number) {
  if (organization.switching) return
  selectedId.value = id

  try {
    await organization.switchOrganization(id)
    toast.success('Workspace berhasil dipilih.')
    await router.replace({ name: 'Dashboard' })
  } catch (error) {
    toast.error(
      'Gagal memilih workspace',
      error instanceof Error ? error.message : 'Terjadi kesalahan saat memilih workspace.',
    )
  } finally {
    selectedId.value = null
  }
}

async function reloadOrganizations() {
  try {
    await organization.initialize(true)
  } catch {
    // Error disediakan oleh store.
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
    <section class="w-full max-w-2xl">
      <header class="mb-8 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
          <Building2 class="size-7" />
        </div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Cakra Enterprise</p>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Pilih Workspace</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Pilih organisasi yang akan digunakan untuk melanjutkan.
        </p>
      </header>

      <div v-if="organization.loading" class="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        <LoaderCircle class="size-5 animate-spin text-primary-600" />
        Memuat daftar organisasi...
      </div>

      <div v-else-if="organization.errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
        <p class="font-semibold">Daftar organisasi tidak dapat dimuat.</p>
        <p class="mt-1">{{ organization.errorMessage }}</p>
        <button type="button" class="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200" @click="reloadOrganizations">
          <RefreshCw class="size-3.5" /> Coba lagi
        </button>
      </div>

      <div v-else-if="!organization.hasOrganizations" class="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <Building2 class="mx-auto size-9 text-slate-300" />
        <h2 class="mt-3 text-base font-semibold text-slate-800 dark:text-slate-100">Belum ada workspace</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Akun Anda belum terhubung ke organisasi mana pun. Hubungi administrator untuk mendapatkan akses.
        </p>
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="item in organization.availableOrganizations"
          :key="item.organization_id"
          type="button"
          class="flex min-h-28 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-400 hover:shadow-md disabled:cursor-wait disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-500"
          :disabled="organization.switching"
          @click="selectOrganization(item.organization_id)"
        >
          <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
            <LoaderCircle v-if="selectedId === item.organization_id" class="size-5 animate-spin" />
            <Building2 v-else class="size-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-slate-900 dark:text-white">{{ item.organization_name }}</span>
            <span class="mt-1 block text-xs text-slate-500 dark:text-slate-400">{{ item.membership_role }}</span>
            <span v-if="item.unit_name" class="mt-1 block truncate text-xs text-slate-400">{{ item.unit_name }}</span>
          </span>
          <Check v-if="organization.activeOrganization?.id === item.organization_id" class="size-4 shrink-0 text-primary-600" />
        </button>
      </div>
    </section>
  </main>
</template>
