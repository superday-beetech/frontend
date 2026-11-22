<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { OptionItem } from '@/shared/composables/useOption'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseTextarea from '@/shared/components/ui/form/BaseTextarea.vue'
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'

interface InfoRow {
  id?: number
  group: string
  title: string
  content: string
}

const props = defineProps<{
  rows: InfoRow[]
  typeOptions: OptionItem[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:rows': [rows: InfoRow[]]
  add: []
  remove: [index: number]
}>()

function updateRow(index: number, patch: Partial<InfoRow>): void {
  const next = props.rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
  emit('update:rows', next)
}
</script>

<template>
  <div>
    <label class="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
      Informasi Tambahan (Indikasi, Efek Samping, dll)
    </label>

    <div
      v-if="props.rows.length === 0"
      class="mb-4 rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700"
    >
      Belum ada informasi tambahan.
    </div>

    <div class="mb-4 space-y-3">
      <div
        v-for="(row, index) in props.rows"
        :key="index"
        class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
      >
        <button
          type="button"
          class="absolute right-3 top-3 inline-flex items-center justify-center rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 dark:hover:bg-rose-900/30"
          :disabled="props.disabled"
          @click="emit('remove', index)"
        >
          <Trash2 class="h-4 w-4" />
        </button>

        <div class="grid grid-cols-1 gap-4 pr-8 md:grid-cols-12">
          <div class="md:col-span-5">
            <label class="mb-1 block text-xs font-medium text-slate-500">Tipe Informasi</label>
            <OptionSelect
              :model-value="row.group"
              :options="props.typeOptions"
              placeholder="Pilih tipe..."
              :searchable="false"
              :disabled="props.disabled"
              @update:model-value="(v) => updateRow(index, { group: String(v ?? '') })"
            />
          </div>

          <div class="md:col-span-7">
            <label class="mb-1 block text-xs font-medium text-slate-500">Keterangan (Opsional)</label>
            <BaseInput
              :model-value="row.title"
              placeholder="cth: Dewasa, Anak 6-12 thn"
              :disabled="props.disabled"
              @update:model-value="(v) => updateRow(index, { title: String(v ?? '') })"
            />
          </div>

          <div class="md:col-span-12">
            <label class="mb-1 block text-xs font-medium text-slate-500">Isi Teks</label>
            <BaseTextarea
              :model-value="row.content"
              placeholder="cth: 1 tablet diminum 3x sehari setelah makan"
              :rows="2"
              :disabled="props.disabled"
              @update:model-value="(v) => updateRow(index, { content: String(v ?? '') })"
            />
          </div>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:opacity-50 dark:border-primary-500 dark:bg-slate-900 dark:text-primary-400 dark:hover:bg-primary-900/20"
      :disabled="props.disabled"
      @click="emit('add')"
    >
      <Plus class="h-4 w-4" />
      Tambah Informasi
    </button>
  </div>
</template>
