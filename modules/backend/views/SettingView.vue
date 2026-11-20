<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Check,
  ChevronRight,
  Code2,
  Database,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Undo2,
} from 'lucide-vue-next'

import BaseAlert from '@/shared/components/ui/feedback/BaseAlert.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseCheckbox from '@/shared/components/ui/form/BaseCheckbox.vue'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
import BaseSwitch from '@/shared/components/ui/form/BaseSwitch.vue'
import BaseTextarea from '@/shared/components/ui/form/BaseTextarea.vue'
import BaseModal from '@/shared/components/ui/overlay/BaseModal.vue'

import { useSettings } from '../stores/useSettings'

import type { SettingFieldOption, SettingRow, SettingType } from '../types/settings'

// ======================================================
// SETTINGS
// ======================================================

const {
  groups,
  selectedGroupId,
  selectedGroup,
  rows,
  forget,
  loading,
  saving,
  addingClass,
  showAddModal,
  newClass,

  loadSettings,
  selectGroup,
  addRow,
  removeRow,
  restoreRow,
  saveSettings,

  openAddModal,
  closeAddModal,
  submitAddClass,

  fieldFor,
  newClassField,
  checkboxGroupValues,
  toggleCheckboxGroup,
} = useSettings()

// ======================================================
// LOCAL STATE
// ======================================================

const groupSearch = ref('')

// ======================================================
// COMPUTED
// ======================================================

const filteredGroups = computed(() => {
  const query = groupSearch.value.trim().toLowerCase()

  if (!query) return groups.value

  return groups.value.filter((group) => [group.name, group.class, group.context ?? ''].some((value) => value.toLowerCase().includes(query)))
})

const selectedCount = computed(() => rows.value.filter((row) => row.property.trim() !== '').length)

const groupCount = computed(() => groups.value.length)

// ======================================================
// HELPERS
// ======================================================
/* function fieldFor(property: string, type: SettingType) {
  return getSettingField(
    selectedGroup.value?.class ?? '',
    property,
    type,
  )
}

function optionsFor(property: string): SettingFieldOption[] {
  return fieldFor(property, 'string').options ?? []
} */
function optionsFor(options?: SettingFieldOption[]) {
  return (options ?? []).map((option) => ({
    label: option.label,
    value: String(option.value),
  }))
}

function checkboxValue(row: SettingRow): boolean {
  return row.value === 'true'
}

function setCheckboxValue(row: SettingRow, value: boolean): void {
  row.value = value ? 'true' : 'false'
}

function fieldLabel(row: SettingRow): string {
  return fieldFor(row).label ?? row.property
}

function isOptionSelected(row: SettingRow, value: string): boolean {
  return checkboxGroupValues(row).includes(value)
}

function onCheckboxGroupChange(row: SettingRow, value: string, event: Event): void {
  const target = event.target as HTMLInputElement

  toggleCheckboxGroup(row, value, target.checked)
}

// ======================================================
// LIFECYCLE
// ======================================================

onMounted(() => {
  void loadSettings()
})
</script>
<template>
  <main class="space-y-6 pb-8">
    <!-- ================================================= -->
    <!-- PAGE HEADER -->
    <!-- ================================================= -->

    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div class="min-w-0">
        <div class="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Sistem</span>
          <ChevronRight class="h-3.5 w-3.5" />
          <span class="text-primary-600 dark:text-primary-400">Pengaturan Aplikasi</span>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-500/10 dark:ring-primary-500/20"
          >
            <Settings2 class="h-5 w-5" />
          </div>

          <div>
            <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Pengaturan Aplikasi</h1>

            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Kelola konfigurasi berdasarkan class dan context.</p>
          </div>
        </div>
      </div>

      <BaseButton @click="openAddModal">
        <Plus class="h-4 w-4" />
        Tambah Class
      </BaseButton>
    </header>

    <!-- ================================================= -->
    <!-- LOADING -->
    <!-- ================================================= -->

    <section
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <RefreshCw class="mx-auto h-6 w-6 animate-spin text-primary-500" />

      <p class="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Memuat pengaturan...</p>

      <p class="mt-1 text-xs text-slate-400">Mengambil konfigurasi aplikasi</p>
    </section>

    <!-- ================================================= -->
    <!-- EMPTY STATE -->
    <!-- ================================================= -->

    <section
      v-else-if="groupCount === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Database class="h-6 w-6" />
      </div>

      <h2 class="mt-4 text-base font-semibold text-slate-800 dark:text-white">Belum ada pengaturan</h2>

      <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Tambahkan class beserta properti awal untuk mulai mengelola konfigurasi aplikasi.
      </p>

      <BaseButton class="mt-5" @click="openAddModal">
        <Plus class="h-4 w-4" />
        Tambah Class
      </BaseButton>
    </section>

    <!-- ================================================= -->
    <!-- SETTINGS CONTENT -->
    <!-- ================================================= -->

    <section v-else class="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <!-- =============================================== -->
      <!-- SIDEBAR CLASS -->
      <!-- =============================================== -->

      <aside
        class="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-5"
      >
        <!-- Sidebar Header -->

        <div class="border-b border-slate-100 p-4 dark:border-slate-800">
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Layers3 class="h-4 w-4 text-primary-500" />

              <h2 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Class Pengaturan</h2>
            </div>

            <BaseBadge variant="primary">
              {{ groupCount }}
            </BaseBadge>
          </div>

          <!-- Search -->

          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              v-model="groupSearch"
              type="search"
              placeholder="Cari class..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary-400 focus:bg-white focus:ring-3 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-primary-500 dark:focus:bg-slate-800"
            />
          </div>
        </div>

        <!-- Group List -->

        <div class="max-h-[min(65vh,620px)] space-y-1 overflow-y-auto p-2">
          <button
            v-for="group in filteredGroups"
            :key="group.id"
            type="button"
            class="group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200"
            :class="
              selectedGroupId === group.id
                ? 'border-primary-200 bg-primary-50 shadow-sm dark:border-primary-500/30 dark:bg-primary-500/10'
                : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/70'
            "
            @click="selectGroup(group.id)"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
              :class="
                selectedGroupId === group.id
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700'
              "
            >
              <Code2 class="h-4 w-4" />
            </span>

            <span class="min-w-0 flex-1">
              <span
                class="block truncate text-xs font-semibold"
                :class="selectedGroupId === group.id ? 'text-primary-800 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'"
              >
                {{ group.name }}
              </span>

              <span class="mt-1 block truncate text-[10px] text-slate-400">
                {{ group.context || group.class }}
              </span>
            </span>

            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
              :class="
                selectedGroupId === group.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              "
            >
              {{ group.items.length }}
            </span>
          </button>

          <p v-if="filteredGroups.length === 0" class="px-3 py-8 text-center text-xs text-slate-400">Class tidak ditemukan.</p>
        </div>

        <!-- Sidebar Footer -->

        <div class="border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30">
          <p class="text-[10px] leading-relaxed text-slate-400">Pilih class untuk melihat dan mengubah properti konfigurasinya.</p>
        </div>
      </aside>

      <!-- =============================================== -->
      <!-- DETAIL EDITOR -->
      <!-- =============================================== -->

      <div v-if="selectedGroup" class="min-w-0 space-y-4">
        <!-- ============================================= -->
        <!-- GROUP HEADER -->
        <!-- ============================================= -->

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div class="min-w-0">
              <div class="mb-2 flex items-center gap-2">
                <SlidersHorizontal class="h-4 w-4 text-primary-500" />

                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Configuration Group</span>
              </div>

              <h2 class="truncate text-lg font-bold text-slate-900 dark:text-white">
                {{ selectedGroup.name }}
              </h2>

              <div class="mt-2 flex flex-wrap items-center gap-2">
                <code
                  class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {{ selectedGroup.class }}
                </code>

                <BaseBadge v-if="selectedGroup.context" variant="neutral">
                  {{ selectedGroup.context }}
                </BaseBadge>
              </div>
            </div>

            <BaseButton variant="secondary" size="sm" @click="addRow">
              <Plus class="h-4 w-4" />
              Tambah Properti
            </BaseButton>
          </div>

          <!-- Group Statistics -->

          <div class="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-3">
            <div>
              <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Total properti</p>

              <p class="mt-1 text-lg font-bold tabular-nums text-slate-800 dark:text-white">
                {{ selectedGroup.items.length }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Sedang diedit</p>

              <p class="mt-1 text-lg font-bold tabular-nums text-slate-800 dark:text-white">
                {{ selectedCount }}
              </p>
            </div>

            <div class="col-span-2 sm:col-span-1">
              <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Akan dihapus</p>

              <p class="mt-1 text-lg font-bold tabular-nums" :class="forget.length ? 'text-amber-600' : 'text-slate-800 dark:text-white'">
                {{ forget.length }}
              </p>
            </div>
          </div>
        </div>

        <!-- ============================================= -->
        <!-- DELETED OVERRIDES -->
        <!-- ============================================= -->

        <BaseAlert v-if="forget.length" variant="warning" title="Override akan dihapus">
          <div class="flex flex-wrap items-center gap-2">
            <span>Properti berikut akan dihapus saat perubahan disimpan:</span>

            <span
              v-for="property in forget"
              :key="property"
              class="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white/70 px-2 py-1 font-mono text-[11px] dark:border-amber-700 dark:bg-slate-900/40"
            >
              {{ property }}

              <button
                type="button"
                :aria-label="'Pulihkan ' + property"
                class="rounded p-0.5 text-amber-700 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-500/20"
                @click="restoreRow(property)"
              >
                <Undo2 class="h-3 w-3" />
              </button>
            </span>
          </div>
        </BaseAlert>

        <!-- ============================================= -->
        <!-- PROPERTY EDITOR -->
        <!-- ============================================= -->

        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <!-- Table Header -->

          <div
            class="hidden grid-cols-[minmax(0,1fr)_145px_minmax(0,1.2fr)_40px] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 sm:grid"
          >
            <span>Property</span>
            <span>Type</span>
            <span>Value</span>
            <span class="text-center">Aksi</span>
          </div>

          <!-- Property Rows -->

          <div v-if="rows.length" class="divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="(row, index) in rows"
              :key="index"
              class="grid gap-3 p-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 sm:grid-cols-[minmax(0,1fr)_145px_minmax(0,1.2fr)_40px] sm:items-start"
            >
              <!-- Property -->

              <div class="min-w-0">
                <label class="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:hidden">Property</label>

                <BaseInput v-model="row.property" :readonly="!row.isNew" :placeholder="row.isNew ? 'propertyName' : ''" />

                <p v-if="!row.isNew" class="mt-1 truncate font-mono text-[10px] text-slate-400">
                  {{ fieldLabel(row) }}
                </p>

                <BaseBadge v-else variant="success" class="mt-1">Properti baru</BaseBadge>
              </div>

              <!-- Type -->

              <div class="min-w-0">
                <label class="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:hidden">Type</label>

                <BaseSelect
                  :model-value="row.type"
                  @update:model-value="row.type = $event as SettingType"
                  :options="[
                    { label: 'String', value: 'string' },
                    { label: 'Integer', value: 'integer' },
                    { label: 'Float', value: 'float' },
                    { label: 'Boolean', value: 'boolean' },
                    { label: 'JSON', value: 'json' },
                  ]"
                />
              </div>

              <!-- Value -->

              <div class="min-w-0">
                <label class="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:hidden">Value</label>

                <!-- Select -->

                <BaseSelect v-if="fieldFor(row).input === 'select'" v-model="row.value" :options="optionsFor(fieldFor(row).options)" />

                <!-- Color -->

                <div
                  v-else-if="fieldFor(row).input === 'color'"
                  class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                >
                  <input v-model="row.value" type="color" class="h-8 w-10 cursor-pointer rounded-md border-0 bg-transparent p-0" />

                  <code class="text-xs text-slate-600 dark:text-slate-300">
                    {{ row.value }}
                  </code>
                </div>

                <!-- Switch -->

                <BaseSwitch
                  v-else-if="fieldFor(row).input === 'switch'"
                  :model-value="checkboxValue(row)"
                  :label="checkboxValue(row) ? 'Aktif' : 'Nonaktif'"
                  @update:model-value="setCheckboxValue(row, $event)"
                />

                <!-- Radio -->

                <div v-else-if="fieldFor(row).input === 'radio'" class="flex flex-wrap gap-2">
                  <label
                    v-for="option in fieldFor(row).options ?? []"
                    :key="String(option.value)"
                    class="group flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all"
                    :class="
                      row.value === String(option.value)
                        ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300'
                        : 'border-slate-200 text-slate-600 hover:border-primary-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-500/40'
                    "
                  >
                    <input
                      v-model="row.value"
                      type="radio"
                      :name="'setting-' + row.property"
                      :value="String(option.value)"
                      class="sr-only"
                    />

                    <span
                      v-if="option.color"
                      class="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                      :style="{ backgroundColor: option.color }"
                    />

                    <span
                      v-else
                      class="flex h-4 w-4 items-center justify-center rounded-full border"
                      :class="
                        row.value === String(option.value)
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      "
                    >
                      <Check v-if="row.value === String(option.value)" class="h-2.5 w-2.5" />
                    </span>

                    {{ option.label }}
                  </label>
                </div>

                <!-- Checkbox Group -->

                <div v-else-if="fieldFor(row).input === 'checkbox-group'" class="space-y-2.5">
                  <div class="flex items-center justify-between">
                    <p class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {{ fieldFor(row).label ?? 'Pilih opsi' }}
                    </p>

                    <span class="text-[10px] tabular-nums text-slate-400">{{ checkboxGroupValues(row).length }} dipilih</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <label
                      v-for="option in fieldFor(row).options ?? []"
                      :key="String(option.value)"
                      class="group relative flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all duration-200"
                      :class="
                        isOptionSelected(row, String(option.value))
                          ? 'border-primary-500 bg-primary-50/70 shadow-sm shadow-primary-500/5 dark:border-primary-500/70 dark:bg-primary-500/10'
                          : 'border-slate-200 bg-white hover:border-primary-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-primary-500/50 dark:hover:bg-slate-800'
                      "
                    >
                      <input
                        type="checkbox"
                        class="peer sr-only"
                        :checked="isOptionSelected(row, String(option.value))"
                        @change="onCheckboxGroupChange(row, String(option.value), $event)"
                      />

                      <span
                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/30 peer-focus-visible:ring-offset-2"
                        :class="
                          isOptionSelected(row, String(option.value))
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-slate-300 bg-white text-transparent group-hover:border-primary-400 dark:border-slate-600 dark:bg-slate-900'
                        "
                      >
                        <Check
                          class="h-3.5 w-3.5 transition-transform duration-200"
                          :class="isOptionSelected(row, String(option.value)) ? 'scale-100' : 'scale-50'"
                          :stroke-width="3"
                        />
                      </span>

                      <span
                        class="min-w-0 truncate text-xs font-semibold transition-colors"
                        :class="
                          isOptionSelected(row, String(option.value))
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-slate-600 dark:text-slate-300'
                        "
                      >
                        {{ option.label }}
                      </span>

                      <span
                        v-if="isOptionSelected(row, String(option.value))"
                        class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <!-- Checkbox -->

                <BaseCheckbox
                  v-else-if="fieldFor(row).input === 'checkbox'"
                  :model-value="checkboxValue(row)"
                  :label="fieldFor(row).label ?? (checkboxValue(row) ? 'Ya' : 'Tidak')"
                  @update:model-value="setCheckboxValue(row, $event)"
                />

                <!-- JSON -->

                <BaseTextarea
                  v-else-if="fieldFor(row).input === 'json' || row.type === 'json'"
                  v-model="row.value"
                  :rows="fieldFor(row).rows ?? 4"
                  placeholder='{"key":"value"}'
                />

                <!-- Textarea -->

                <BaseTextarea
                  v-else-if="fieldFor(row).input === 'textarea'"
                  v-model="row.value"
                  :rows="fieldFor(row).rows ?? 3"
                  :placeholder="fieldFor(row).placeholder"
                />

                <!-- Number -->

                <BaseInput
                  v-else-if="fieldFor(row).input === 'number'"
                  v-model="row.value"
                  type="number"
                  :placeholder="fieldFor(row).placeholder"
                />

                <!-- File -->

                <BaseAlert v-else-if="fieldFor(row).input === 'file'" variant="warning" title="Unggahan belum tersedia">
                  Field ini membutuhkan endpoint upload khusus; penyimpanan bulk settings hanya menerima nilai konfigurasi.
                </BaseAlert>

                <!-- Default Text -->

                <BaseInput v-else v-model="row.value" :placeholder="fieldFor(row).placeholder ?? row.type" />
              </div>

              <!-- Actions -->

              <div class="flex justify-end sm:justify-center">
                <button
                  type="button"
                  :aria-label="'Hapus properti ' + row.property"
                  title="Hapus properti"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  @click="removeRow(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty Properties -->

          <div v-else class="px-6 py-14 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Database class="h-5 w-5" />
            </div>

            <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Belum ada properti</p>

            <p class="mt-1 text-xs text-slate-400">Tambahkan properti untuk kelompok pengaturan ini.</p>

            <BaseButton variant="secondary" size="sm" class="mt-4" @click="addRow">
              <Plus class="h-4 w-4" />
              Tambah Properti
            </BaseButton>
          </div>

          <!-- Footer -->

          <footer
            class="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/30 sm:flex-row sm:items-center sm:px-5"
          >
            <div class="text-xs text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-slate-700 dark:text-slate-200">
                {{ selectedCount }}
              </span>

              properti

              <span v-if="forget.length" class="ml-1 text-amber-600 dark:text-amber-400">· {{ forget.length }} akan dihapus</span>
            </div>

            <BaseButton :loading="saving" :disabled="saving" @click="saveSettings">
              <Check v-if="!saving" class="h-4 w-4" />
              Simpan Perubahan
            </BaseButton>
          </footer>
        </div>
      </div>

      <!-- No selected group fallback -->

      <div
        v-else
        class="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900"
      >
        <div>
          <Database class="mx-auto h-7 w-7 text-slate-400" />

          <p class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Pilih class pengaturan</p>

          <p class="mt-1 text-xs text-slate-400">Pilih salah satu class dari daftar untuk mulai mengelola properti.</p>
        </div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- ADD CLASS MODAL -->
    <!-- ================================================= -->

    <BaseModal :open="showAddModal" title="Tambah Class Pengaturan" max-width="lg" @close="showAddModal = false">
      <form class="space-y-5" @submit.prevent="submitAddClass">
        <!-- Class Information -->

        <div>
          <div class="mb-3 flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
            >
              <Layers3 class="h-4 w-4" />
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-800 dark:text-white">Informasi Class</h3>

              <p class="text-[10px] text-slate-400">Identitas kelompok konfigurasi</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <BaseInput v-model="newClass.class" label="Nama Class" placeholder="Config\App" required />

            <BaseInput v-model="newClass.context" label="Context" placeholder="module:backend" />
          </div>

          <p class="mt-2 text-[10px] text-slate-400">Contoh class: Config\App atau Config\Email.</p>
        </div>

        <!-- Initial Property -->

        <div class="border-t border-slate-100 pt-5 dark:border-slate-800">
          <div class="mb-3 flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              <Code2 class="h-4 w-4" />
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-800 dark:text-white">Properti Awal</h3>

              <p class="text-[10px] text-slate-400">Properti pertama pada class ini</p>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
            <BaseInput v-model="newClass.property" label="Nama Properti" placeholder="siteName" required />

            <BaseSelect
              :model-value="newClass.type"
              @update:model-value="newClass.type = $event as SettingType"
              label="Tipe Data"
              :options="[
                { label: 'String', value: 'string' },
                { label: 'Integer', value: 'integer' },
                { label: 'Float', value: 'float' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'JSON', value: 'json' },
              ]"
            />
          </div>

          <!-- Initial Value -->

          <div class="mt-4">
            <!-- Select -->

            <BaseSelect
              v-if="newClassField().input === 'select'"
              v-model="newClass.value"
              :label="newClassField().label ?? 'Nilai Awal'"
              :options="optionsFor(newClassField().options)"
            />

            <!-- Color -->

            <div v-else-if="newClassField().input === 'color'" class="space-y-2">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {{ newClassField().label ?? 'Nilai Awal' }}
              </label>

              <input
                v-model="newClass.value"
                type="color"
                class="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <!-- Switch -->

            <BaseSwitch
              v-else-if="newClassField().input === 'switch' || newClassField().input === 'checkbox'"
              :model-value="newClass.value === 'true'"
              :label="newClassField().label ?? (newClass.value === 'true' ? 'Aktif' : 'Nonaktif')"
              @update:model-value="newClass.value = $event ? 'true' : 'false'"
            />

            <!-- Radio -->

            <div v-else-if="newClassField().input === 'radio'" class="space-y-2">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {{ newClassField().label ?? 'Nilai Awal' }}
              </label>

              <div class="flex flex-wrap gap-2">
                <label
                  v-for="option in newClassField().options ?? []"
                  :key="String(option.value)"
                  class="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors"
                  :class="
                    newClass.value === String(option.value)
                      ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  "
                >
                  <input v-model="newClass.value" type="radio" :value="String(option.value)" class="sr-only" />

                  <span
                    v-if="option.color"
                    class="h-4 w-4 rounded-full border border-black/10"
                    :style="{ backgroundColor: option.color }"
                  />

                  <span v-else-if="option.icon" class="flex h-4 w-4 items-center justify-center">
                    <i :class="option.icon" />
                  </span>

                  {{ option.label }}
                </label>
              </div>
            </div>

            <!-- JSON -->

            <BaseTextarea
              v-else-if="newClassField().input === 'json' || newClass.type === 'json'"
              v-model="newClass.value"
              :label="newClassField().label ?? 'Nilai Awal'"
              :rows="newClassField().rows ?? 4"
              placeholder='{"key":"value"}'
            />

            <!-- Textarea -->

            <BaseTextarea
              v-else-if="newClassField().input === 'textarea'"
              v-model="newClass.value"
              :label="newClassField().label ?? 'Nilai Awal'"
              :rows="newClassField().rows ?? 3"
              :placeholder="newClassField().placeholder"
            />

            <!-- Number -->

            <BaseInput
              v-else-if="newClassField().input === 'number'"
              v-model="newClass.value"
              :label="newClassField().label ?? 'Nilai Awal'"
              type="number"
            />

            <!-- File -->

            <BaseAlert v-else-if="newClassField().input === 'file'" variant="warning" title="Unggahan belum tersedia">
              Endpoint tambah class menerima nilai konfigurasi, bukan file.
            </BaseAlert>

            <!-- Default -->

            <BaseInput
              v-else
              v-model="newClass.value"
              :label="newClassField().label ?? 'Nilai Awal'"
              :placeholder="newClassField().placeholder"
            />
          </div>
        </div>

        <!-- Modal Actions -->

        <div class="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <BaseButton variant="secondary" type="button" :disabled="addingClass" @click="closeAddModal">Batal</BaseButton>

          <BaseButton type="submit" :loading="addingClass" :disabled="addingClass">
            <Check v-if="!addingClass" class="h-4 w-4" />
            Simpan Class
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </main>
</template>
