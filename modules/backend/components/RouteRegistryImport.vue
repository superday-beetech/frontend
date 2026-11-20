<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import { useAdminNavigation } from '../stores/navigation'
import type { MenuPosition, RouteRegistryCandidate, RouteRegistrySaveItem } from '../types/navigation'

// ── KOMPONEN & COMPOSABLES KUSTOM ──
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import { useModal } from '@/shared/composables/useModal'
import { useToast } from '@/shared/composables/useToast'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  onSaved?: () => void | Promise<void>
}>()

const store = useAdminNavigation()
const modalStore = useModal()
const toast = useToast()

// ── State ──
const loading = ref(false)
const saving = ref(false)
const loadError = ref('')

const existingMenus = ref<unknown[]>([])
const candidates = ref<RouteRegistryCandidate[]>([])
const groups = ref<string[]>([])

const selected = reactive<Record<string, boolean>>({})
const positions = reactive<Record<string, MenuPosition>>({})
const selectedGroups = reactive<Record<string, string[]>>({})

// ── Computed ──
const availableCandidates = computed(() => candidates.value.filter((item) => !item.exists && Boolean(item.url)))
const selectedCount = computed(() => availableCandidates.value.filter((item) => selected[String(item.id)]).length)

const positionOptions = [
  { label: 'Sidebar', value: 'sidebar' },
  { label: 'Topbar', value: 'topbar' },
  { label: 'Down', value: 'down' },
]

function candidateKey(item: RouteRegistryCandidate): string {
  return String(item.id)
}

function initializeCandidate(item: RouteRegistryCandidate) {
  const key = candidateKey(item)
  if (!(key in selected)) selected[key] = false
  if (!(key in positions)) positions[key] = 'sidebar'
  if (!(key in selectedGroups)) selectedGroups[key] = []
}

function toggleGroup(key: string, group: string, checked: boolean) {
  const current = selectedGroups[key] ?? []
  selectedGroups[key] = checked ? [...new Set([...current, group])] : current.filter((item) => item !== group)
}

// ── Actions ──
async function loadPreview() {
  loading.value = true
  loadError.value = ''

  try {
    const result = await store.previewRegistry()
    existingMenus.value = result.menus ?? []
    candidates.value = result.candidates ?? []
    groups.value = result.groups ?? []

    for (const item of candidates.value) initializeCandidate(item)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Gagal memuat preview Route Registry.'
    toast.error(loadError.value)
  } finally {
    loading.value = false
  }
}

async function saveSelected() {
  if (saving.value || selectedCount.value === 0) return
  saving.value = true

  try {
    const items: RouteRegistrySaveItem[] = availableCandidates.value
      .filter((item) => selected[candidateKey(item)])
      .map((item) => ({
        route_menu_id: Number(item.id),
        position: positions[candidateKey(item)],
        groups: [...(selectedGroups[candidateKey(item)] ?? [])],
      }))

    if (items.some((item) => !Number.isInteger(item.route_menu_id) || item.route_menu_id <= 0)) {
      throw new Error('ID Route Registry tidak valid.')
    }

    const response = await store.saveRegistry(items)
    const result = response.data as { inserted?: unknown[]; skipped?: unknown[] } | undefined
    const inserted = result?.inserted?.length ?? 0
    const skipped = result?.skipped?.length ?? 0

    toast.success(`Sinkronisasi selesai. Berhasil: ${inserted}, dilewati: ${skipped}.`)
    await props.onSaved?.()
    modalStore.close()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Sinkronisasi Route Registry gagal.')
  } finally {
    saving.value = false
  }
}

onMounted(loadPreview)
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">Sinkronisasi Route Registry</h3>
        <p class="text-xs text-slate-500 mt-0.5">Pilih endpoint yang ingin ditambahkan ke navigasi.</p>
      </div>
      <BaseButton variant="secondary" size="sm" :disabled="loading || saving" @click="loadPreview">
        <RefreshCw class="w-3.5 h-3.5" />
        Muat Ulang
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"></span>
      <p class="mt-3 text-sm text-slate-500">Memuat Route Registry...</p>
    </div>

    <!-- Error -->
    <div
      v-else-if="loadError"
      class="flex flex-col items-center rounded-xl border border-rose-200 bg-rose-50 py-8 dark:border-rose-900/50 dark:bg-rose-900/20"
    >
      <AlertCircle class="h-8 w-8 text-rose-500 mb-2" />
      <p class="text-sm font-medium text-rose-700 dark:text-rose-300">{{ loadError }}</p>
      <BaseButton variant="secondary" size="sm" class="mt-3" @click="loadPreview">Coba lagi</BaseButton>
    </div>

    <template v-else>
      <!-- Statistik -->
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ existingMenus.length }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Terdaftar</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ availableCandidates.length }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Kandidat</p>
        </div>
        <div class="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center dark:border-primary-800 dark:bg-primary-900/20">
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ selectedCount }}</p>
          <p class="text-xs text-primary-600 dark:text-primary-400 mt-0.5">Dipilih</p>
        </div>
      </div>

      <!-- Tabel -->
      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3 w-14 text-center">Pilih</th>
              <th class="px-4 py-3">Endpoint</th>
              <th class="px-4 py-3 w-36">Posisi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="item in candidates"
              :key="candidateKey(item)"
              class="transition-colors"
              :class="{ 'bg-primary-50/50 dark:bg-primary-900/10': selected[candidateKey(item)] }"
            >
              <td class="px-4 py-3 text-center">
                <input
                  v-if="!item.exists && item.url"
                  v-model="selected[candidateKey(item)]"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900 dark:text-white">{{ item.title || 'Tanpa judul' }}</div>
                <div class="text-xs text-slate-500 break-all mt-0.5">{{ item.url || 'URL kosong' }}</div>
                <div class="mt-1.5">
                  <BaseBadge v-if="item.exists" variant="neutral">Sudah ada</BaseBadge>
                  <BaseBadge v-else-if="!item.url" variant="warning">URL kosong</BaseBadge>
                  <BaseBadge v-else variant="success">Baru</BaseBadge>
                </div>

                <!-- Group Akses -->
                <div v-if="selected[candidateKey(item)] && groups.length" class="mt-2">
                  <p class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Group yang dapat mengakses</p>
                  <div class="flex flex-wrap gap-3">
                    <label v-for="group in groups" :key="group" class="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="selectedGroups[candidateKey(item)]?.includes(group) ?? false"
                        class="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        @change="toggleGroup(candidateKey(item), group, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-slate-600 dark:text-slate-400">{{ group }}</span>
                    </label>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <BaseSelect
                  v-if="!item.exists && item.url"
                  :model-value="positions[candidateKey(item)]"
                  :options="positionOptions"
                  :disabled="!selected[candidateKey(item)]"
                  placeholder="Pilih"
                  @update:model-value="(val) => (positions[candidateKey(item)] = val as MenuPosition)"
                />
                <span v-else class="text-slate-400">—</span>
              </td>
            </tr>
            <tr v-if="candidates.length === 0">
              <td colspan="3" class="px-4 py-8 text-center text-slate-500">Tidak ada kandidat Route Registry.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Footer -->
    <div class="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
      <p class="text-xs text-slate-500">
        Section:
        <strong class="text-slate-700 dark:text-slate-300">{{ store.section }}</strong>
      </p>
      <div class="flex gap-2">
        <BaseButton variant="secondary" :disabled="saving" @click="modalStore.close()">Tutup</BaseButton>
        <BaseButton variant="primary" :disabled="loading || saving || selectedCount === 0" :loading="saving" @click="saveSelected">
          {{ saving ? 'Menyimpan...' : `Sinkronkan (${selectedCount})` }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
