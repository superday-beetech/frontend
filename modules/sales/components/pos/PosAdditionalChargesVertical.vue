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
  { value: 'shipping', label: 'Ongkos kirim' },
  { value: 'packaging', label: 'Kemasan' },
  { value: 'service', label: 'Biaya layanan' },
  { value: 'other', label: 'Lainnya' },
] as const
</script>

<template>
  <!-- Wrapper biaya dengan padding rapi -->
  <div class="space-y-3">
    <!-- Header: Total & Tombol Tambah -->
    <div class="flex items-center justify-between border-b pb-2">
      <div class="text-xs text-slate-500">
        Total Biaya:
        <span class="font-bold text-slate-800 dark:text-slate-100">
          {{ formatCurrency(charges.reduce((sum, c) => sum + c.amount, 0)) }}
        </span>
      </div>
      <button type="button" class="pos-button pos-button-soft-primary pos-button-sm" :disabled="disabled" @click="emit('add')">
        <PosIcon name="plus" :size="14" />
        Tambah
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!charges.length" class="text-center text-xs text-slate-400 py-4">Belum ada biaya tambahan.</div>

    <!-- List Biaya (Vertikal) -->
    <div
      v-for="charge in charges"
      :key="charge.id"
      class="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50 relative"
    >
      <!-- Tombol Hapus (Pojok Kanan Atas) -->
      <button
        type="button"
        class="absolute right-1 top-1 text-rose-500 hover:text-rose-700 p-1"
        :disabled="disabled"
        @click="emit('remove', charge.id)"
        title="Hapus biaya"
      >
        <PosIcon name="x" :size="14" />
      </button>

      <!-- Form Input Biaya -->
      <div class="space-y-2 pr-6">
        <!-- Dropdown Jenis Biaya -->
        <select
          class="pos-select pos-input-sm w-full"
          :value="charge.type"
          :disabled="disabled"
          @change="emit('update', charge.id, 'type', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="type in chargeTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
        </select>

        <!-- Keterangan -->
        <input
          type="text"
          class="pos-input pos-input-sm w-full"
          placeholder="Keterangan biaya"
          :value="charge.description"
          :disabled="disabled"
          @input="emit('update', charge.id, 'description', ($event.target as HTMLInputElement).value)"
        />

        <!-- Nominal -->
        <div class="flex items-center gap-1">
          <span class="text-xs font-semibold text-slate-500">Rp</span>
          <input
            type="number"
            class="pos-input pos-input-sm w-full text-right"
            min="0"
            step="1"
            placeholder="0"
            :value="charge.amount"
            :disabled="disabled"
            @change="emit('update', charge.id, 'amount', Math.max(0, Number(($event.target as HTMLInputElement).value) || 0))"
          />
        </div>
      </div>
    </div>
  </div>
</template>
