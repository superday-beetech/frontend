<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import type { OptionItem } from '@/shared/composables/useOption'
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'
import BaseButtonSpin from '@/shared/components/ui/form/BaseButtonSpin.vue'

interface UnitConversionRow {
  unit_id: number | null
  qty: number | null
}

const props = defineProps<{
  rows: UnitConversionRow[]
  unitOptions: OptionItem[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:rows': [rows: UnitConversionRow[]]
  add: []
  remove: [index: number]
}>()

function updateRow(index: number, patch: Partial<UnitConversionRow>): void {
  const next = props.rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
  emit('update:rows', next)
}
</script>

<template>
  <div>
    <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Konversi Satuan</label>

    <div v-if="props.rows.length === 0" class="mb-3 text-sm italic text-slate-500">Belum ada konversi. Contoh: 1 Box = 100 Tablet.</div>

    <div v-for="(row, index) in props.rows" :key="index" class="mb-2 flex items-center gap-2">
      <div class="flex-1">
        <OptionSelect
          :model-value="row.unit_id"
          :options="props.unitOptions"
          placeholder="Pilih satuan"
          :disabled="props.disabled"
          @update:model-value="(v) => updateRow(index, { unit_id: v != null ? Number(v) : null })"
        />
      </div>

      <span class="px-1 font-medium text-slate-500">=</span>

      <BaseButtonSpin
        :model-value="row.qty"
        :min="0"
        width="w-auto"
        :disabled="props.disabled"
        @update:model-value="(v) => updateRow(index, { qty: v != null ? Number(v) : null })"
      />

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-900/30"
        :disabled="props.disabled"
        @click="emit('remove', index)"
      >
        <Trash2 class="h-4 w-4" />
      </button>
    </div>

    <button
      type="button"
      class="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-primary-600 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:opacity-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20"
      :disabled="props.disabled"
      @click="emit('add')"
    >
      <Plus class="h-4 w-4" />
      Tambah Satuan
    </button>

    <p class="mt-2 text-xs text-slate-500">Contoh: Box = 100, Strip = 10. Artinya 1 Box = 100 Tablet, 1 Strip = 10 Tablet.</p>
  </div>
</template>
