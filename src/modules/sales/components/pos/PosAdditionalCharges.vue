<script setup lang="ts">
import PosIcon from "./PosIcon.vue"
import { formatCurrency } from "../../utils/format"
import type { PosAdditionalCharge } from "../../types/sales"
defineProps<{ charges: PosAdditionalCharge[]; disabled?: boolean }>()
const emit = defineEmits<{
  add: []
  update: [id: string, field: "type" | "description" | "amount", value: string | number]
  remove: [id: string]
}>()
const chargeTypes = [
  { value: "donation", label: "Donasi" }, { value: "shipping", label: "Ongkos kirim" },
  { value: "packaging", label: "Kemasan" }, { value: "service", label: "Biaya layanan" },
  { value: "other", label: "Lainnya" },
] as const
</script>

<template>
  <div class="pos-charges">
    <div class="pos-charges-bar">
      <small class="text-xs text-slate-500">Total: <strong class="font-bold text-slate-800 dark:text-slate-100">{{ formatCurrency(charges.reduce((sum, charge) => sum + charge.amount, 0)) }}</strong></small>
      <button type="button" class="pos-button pos-button-soft-primary pos-button-sm" :disabled="disabled" @click="emit('add')"><PosIcon name="plus" :size="15" />Tambah</button>
    </div>
    <small v-if="!charges.length" class="pos-muted-center">Belum ada biaya tambahan.</small>
    <div v-for="charge in charges" :key="charge.id" class="pos-charge-row">
      <select class="pos-select" aria-label="Jenis biaya" :value="charge.type" :disabled="disabled" @change="emit('update', charge.id, 'type', ($event.target as HTMLSelectElement).value)">
        <option v-for="type in chargeTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
      </select>
      <input type="text" class="pos-input" placeholder="Keterangan" aria-label="Keterangan biaya" :value="charge.description" :disabled="disabled" @input="emit('update', charge.id, 'description', ($event.target as HTMLInputElement).value)" />
      <input type="number" class="pos-input text-right" min="0" step="1" placeholder="Nominal" aria-label="Nominal biaya" :value="charge.amount" :disabled="disabled" @change="emit('update', charge.id, 'amount', Math.max(0, Number(($event.target as HTMLInputElement).value) || 0))" />
      <button type="button" class="pos-icon-button text-rose-600" title="Hapus biaya" aria-label="Hapus biaya" :disabled="disabled" @click="emit('remove', charge.id)"><PosIcon name="x" /></button>
    </div>
  </div>
</template>
