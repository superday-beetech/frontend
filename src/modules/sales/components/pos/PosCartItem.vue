<script setup lang="ts">
import { ref, watch } from "vue"
import PosIcon from "./PosIcon.vue"
import { formatCurrency } from "../../utils/format"
import type { DiscountMode, PosCartItem } from "../../types/sales"
const props = defineProps<{
  item: PosCartItem; index: number; discountMode: DiscountMode; discountInput: number; note: string; disabled?: boolean
}>()
const emit = defineEmits<{
  quantityChange: [value: number]; priceChange: [value: number]; discountModeChange: [value: DiscountMode]
  discountChange: [value: number]; noteChange: [value: string]; remove: []
}>()
const noteOpen = ref(Boolean(props.note))
watch(() => props.note, (value) => { if (value) noteOpen.value = true })
function stepQuantity(delta: number): void {
  const next = Math.round((Number(props.item.quantity) + delta) * 1000) / 1000
  if (next < 0.001) return
  emit("quantityChange", next)
}
function numberValue(event: Event): number {
  const value = Number((event.target as HTMLInputElement).value)
  return Number.isFinite(value) ? value : 0
}
</script>

<template>
  <tr>
    <td class="col-no">{{ index + 1 }}</td>
    <td>
      <div class="pos-item-name">
        <strong>{{ item.product_name }}</strong>
        <small>{{ item.sku || "-" }}<template v-if="item.barcode"> · {{ item.barcode }}</template><template v-if="item.unit_name"> · {{ item.unit_name }}</template></small>
        <input v-if="noteOpen" type="text" class="pos-input pos-input-sm pos-item-note" placeholder="Catatan item" aria-label="Catatan item" :value="note" :disabled="disabled" @input="emit('noteChange', ($event.target as HTMLInputElement).value)" />
      </div>
    </td>
    <td class="col-qty">
      <div class="pos-input-group pos-qty">
        <button type="button" class="pos-icon-button rounded-r-none border border-r-0 border-slate-300 dark:border-slate-700" aria-label="Kurangi jumlah" :disabled="disabled || item.quantity <= 1" @click="stepQuantity(-1)"><PosIcon name="minus" :size="13" /></button>
        <input type="number" min="0.001" step="0.001" class="pos-input rounded-none px-1 text-center" aria-label="Jumlah" :value="item.quantity" :disabled="disabled" @focus="($event.target as HTMLInputElement).select()" @change="emit('quantityChange', numberValue($event))" />
        <button type="button" class="pos-icon-button rounded-l-none border border-l-0 border-slate-300 dark:border-slate-700" aria-label="Tambah jumlah" :disabled="disabled" @click="stepQuantity(1)"><PosIcon name="plus" :size="13" /></button>
      </div>
    </td>
    <td class="col-price"><input type="number" min="0" step="1" class="pos-input pos-input-sm text-right" aria-label="Harga satuan" :value="item.unit_price" :disabled="disabled" @change="emit('priceChange', numberValue($event))" /></td>
    <td class="col-disc">
      <div class="pos-input-group">
        <select class="pos-select pos-input-sm max-w-14 px-1" aria-label="Jenis diskon" :value="discountMode" :disabled="disabled" @change="emit('discountModeChange', ($event.target as HTMLSelectElement).value as DiscountMode)"><option value="amount">Rp</option><option value="percent">%</option></select>
        <input type="number" min="0" step="0.01" class="pos-input pos-input-sm rounded-l-none px-1 text-right" aria-label="Nilai diskon" :value="discountInput" :disabled="disabled" @change="emit('discountChange', numberValue($event))" />
      </div>
    </td>
    <td class="col-amount"><span :class="{ 'pos-minus': item.discount_amount > 0 }">{{ item.discount_amount > 0 ? "- " : "" }}{{ formatCurrency(item.discount_amount) }}</span></td>
    <td class="col-act">
      <div class="pos-row-actions">
        <button type="button" class="pos-icon-button" :class="note ? 'text-primary-600' : ''" title="Catatan item" aria-label="Catatan item" :aria-pressed="noteOpen" @click="noteOpen = !noteOpen"><PosIcon name="notebook-pen" :size="15" /></button>
        <button type="button" class="pos-icon-button text-rose-600" title="Hapus produk" aria-label="Hapus produk" :disabled="disabled" @click="emit('remove')"><PosIcon name="trash-2" :size="15" /></button>
      </div>
    </td>
  </tr>
</template>
