<script setup lang="ts">
import PosCurrencyInput from "./PosCurrencyInput.vue"
import { formatCurrency } from "../../utils/format"
import type { DiscountMode } from "../../types/sales"
import { calculateDiscount } from "../../utils/posMath"

const props = defineProps<{ mode: DiscountMode; value: number; baseAmount: number; disabled?: boolean }>()
const emit = defineEmits<{
  "update:mode": [value: DiscountMode]
  "update:value": [value: number]
}>()
function previewAmount(): number {
  return calculateDiscount(Math.max(0, props.baseAmount), props.mode, props.value)
}
function updateValue(value: number): void {
  emit("update:value", props.mode === "percent" ? Math.min(100, Math.max(0, value)) : Math.max(0, value))
}
</script>

<template>
  <div class="pos-inline-field">
    <label class="pos-label" for="pos-transaction-discount">Diskon transaksi</label>
    <div class="pos-input-group">
      <select class="pos-select max-w-24" :value="mode" :disabled="disabled" aria-label="Jenis diskon transaksi" @change="emit('update:mode', ($event.target as HTMLSelectElement).value as DiscountMode)">
        <option value="percent">%</option>
        <option value="amount">Rp</option>
      </select>
      <PosCurrencyInput id="pos-transaction-discount" :model-value="value" :disabled="disabled" :decimal="mode === 'percent'" :max="mode === 'percent' ? 100 : undefined" @update:model-value="updateValue" />
    </div>
    <small>Dari dasar {{ formatCurrency(baseAmount) }}, potongan <strong>{{ formatCurrency(previewAmount()) }}</strong></small>
  </div>
</template>
