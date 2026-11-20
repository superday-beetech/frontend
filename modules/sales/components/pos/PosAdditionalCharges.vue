<script setup lang="ts">
import PosIcon from './PosIcon.vue'
import { formatCurrency } from '../../utils/format'
import type { PosAdditionalCharge } from '../../types/sales'

defineProps<{ charges: PosAdditionalCharge[]; disabled?: boolean }>()
const emit = defineEmits<{
  add: []
  update: [id: string, field: 'type' | 'description' | 'amount', value: string | number]
  remove: [id: string]
}>()
const chargeTypes = [
  { value: 'donation', label: 'Donasi' },
  { value: 'shipping', label: 'Ongkir' },
  { value: 'packaging', label: 'Kemasan' },
  { value: 'service', label: 'Layanan' },
  { value: 'other', label: 'Lainnya' },
] as const
</script>

<template>
  <div class="space-y-2">
    <!-- Header: Total & Tombol Tambah -->
    <div class="flex items-center justify-between">
      <div class="text-[11px] text-slate-500">
        Total:
        <span class="font-bold text-slate-800 dark:text-slate-100">
          {{ formatCurrency(charges.reduce((sum, c) => sum + c.amount, 0)) }}
        </span>
      </div>
      <button
        type="button"
        class="text-primary-600 hover:text-primary-700 text-xs font-semibold flex items-center gap-1"
        :disabled="disabled"
        @click="emit('add')"
      >
        <PosIcon name="plus" :size="12" />
        Tambah
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!charges.length" class="text-center text-[11px] text-slate-400 py-2 border border-dashed rounded-lg">Belum ada biaya.</div>

    <!-- List Biaya (Horizontal/Inline) -->
    <div
      v-for="charge in charges"
      :key="charge.id"
      class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 relative"
    >
      <!-- Dropdown Jenis (Kecil) -->
      <select
        class="pos-select pos-input-sm w-24 shrink-0 text-[11px] px-1 py-0.5 h-7"
        :value="charge.type"
        :disabled="disabled"
        @change="emit('update', charge.id, 'type', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="type in chargeTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
      </select>

      <!-- Keterangan (Mengisi Sisa Ruang) -->
      <input
        type="text"
        class="pos-input pos-input-sm flex-1 text-[11px] px-2 py-0.5 h-7"
        placeholder="Ket..."
        :value="charge.description"
        :disabled="disabled"
        @input="emit('update', charge.id, 'description', ($event.target as HTMLInputElement).value)"
      />

      <!-- Nominal (Kecil) -->
      <div class="flex items-center shrink-0 w-20">
        <span class="text-[10px] font-semibold text-slate-500 mr-0.5">Rp</span>
        <input
          type="number"
          class="pos-input pos-input-sm w-full text-right text-[11px] px-1 py-0.5 h-7"
          min="0"
          step="1"
          placeholder="0"
          :value="charge.amount"
          :disabled="disabled"
          @change="emit('update', charge.id, 'amount', Math.max(0, Number(($event.target as HTMLInputElement).value) || 0))"
        />
      </div>

      <!-- Tombol Hapus (Bukan Absolute, tapi sejajar) -->
      <button type="button" class="text-rose-500 hover:text-rose-700 p-1 shrink-0" :disabled="disabled" @click="emit('remove', charge.id)">
        <PosIcon name="x" :size="14" />
      </button>
    </div>
  </div>
</template>
