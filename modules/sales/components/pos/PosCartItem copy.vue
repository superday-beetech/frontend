<script setup lang="ts">
import { ref, watch } from 'vue'
import PosIcon from './PosIcon.vue'
import { formatCurrency } from '../../utils/format'
import type { DiscountMode, PosCartItem } from '../../types/sales'
const props = defineProps<{
  item: PosCartItem
  index: number
  discountMode: DiscountMode
  discountInput: number
  note: string
  disabled?: boolean
}>()
const emit = defineEmits<{
  quantityChange: [value: number]
  priceChange: [value: number]
  discountModeChange: [value: DiscountMode]
  discountChange: [value: number]
  noteChange: [value: string]
  remove: []
}>()
const noteOpen = ref(Boolean(props.note))
watch(
  () => props.note,
  (value) => {
    if (value) noteOpen.value = true
  }
)
function stepQuantity(delta: number): void {
  const next = Math.round((Number(props.item.quantity) + delta) * 1000) / 1000
  if (next < 0.001) return
  emit('quantityChange', next)
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
        <small>
          {{ item.sku || '-' }}
          <template v-if="item.barcode">· {{ item.barcode }}</template>
          <template v-if="item.unit_name">· {{ item.unit_name }}</template>
        </small>
        <input
          v-if="noteOpen"
          type="text"
          class="pos-input pos-input-sm pos-item-note"
          placeholder="Catatan item"
          aria-label="Catatan item"
          :value="note"
          :disabled="disabled"
          @input="emit('noteChange', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </td>
    <td class="col-qty">
      <!-- Wrapper dengan lebar tetap dan posisi di tengah -->
      <div class="mx-auto flex w-22.5 items-center rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        <!-- Tombol Minus -->
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 rounded-l-md transition-colors"
          aria-label="Kurangi jumlah"
          :disabled="disabled || item.quantity <= 1"
          @click="stepQuantity(-1)"
        >
          <PosIcon name="minus" :size="12" />
        </button>

        <!-- Input Angka -->
        <input
          type="number"
          min="0.001"
          step="0.001"
          class="h-7 w-full min-w-0 border-0 bg-transparent p-0 text-center text-xs font-semibold text-slate-800 focus:ring-0 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Jumlah"
          :value="item.quantity"
          :disabled="disabled"
          @focus="($event.target as HTMLInputElement).select()"
          @change="emit('quantityChange', numberValue($event))"
        />

        <!-- Tombol Plus -->
        <button
          type="button"
          class="flex h-7 w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 rounded-r-md transition-colors"
          aria-label="Tambah jumlah"
          :disabled="disabled"
          @click="stepQuantity(1)"
        >
          <PosIcon name="plus" :size="12" />
        </button>
      </div>
    </td>
    <!-- KOLOM HARGA -->
    <td class="col-price">
      <input
        type="number"
        min="0"
        step="1"
        class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-xs font-medium text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        aria-label="Harga satuan"
        :value="item.unit_price"
        :disabled="disabled"
        @change="emit('priceChange', numberValue($event))"
      />
    </td>

    <!-- KOLOM DISKON -->
    <td class="col-disc">
      <!-- Wrapper dengan border menyatu -->
      <div
        class="flex w-full items-center overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
      >
        <!-- Dropdown Rp / % -->
        <select
          class="h-7 shrink-0 cursor-pointer border-0 bg-slate-50 px-1 text-xs font-medium text-slate-600 focus:ring-0 dark:bg-slate-800 dark:text-slate-300"
          aria-label="Jenis diskon"
          :value="discountMode"
          :disabled="disabled"
          @change="emit('discountModeChange', ($event.target as HTMLSelectElement).value as DiscountMode)"
        >
          <option value="amount">Rp</option>
          <option value="percent">%</option>
        </select>

        <!-- Input Nilai Diskon -->
        <input
          type="number"
          min="0"
          step="0.01"
          class="h-7 w-full min-w-0 border-0 bg-transparent px-1 text-right text-xs font-semibold text-slate-800 focus:ring-0 dark:text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Nilai diskon"
          :value="discountInput"
          :disabled="disabled"
          @change="emit('discountChange', numberValue($event))"
        />
      </div>
    </td>
    <!-- KOLOM TOTAL HARGA (SUBTOTAL) -->
    <td class="col-amount text-right">
      <div class="flex flex-col items-end justify-center">
        <!-- Total Harga (Harga x Qty - Diskon) -->
        <span class="text-sm text-slate-800 dark:text-slate-100 tabular-nums">
          {{ formatCurrency(item.unit_price * item.quantity - item.discount_amount) }}
        </span>

        <!-- Opsional: Tampilkan info potongan kecil di bawahnya jika ada diskon -->
        <span v-if="item.discount_amount > 0" class="text-[10px] font-medium text-rose-500">
          Potongan: -{{ formatCurrency(item.discount_amount) }}
        </span>
      </div>
    </td>
    <!-- KOLOM AKSI -->
    <td class="col-act w-17.5">
      <div class="flex items-center justify-end gap-1">
        <!-- Tombol Catatan -->
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
          :class="
            note
              ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
          "
          title="Catatan item"
          aria-label="Catatan item"
          :aria-pressed="noteOpen"
          :disabled="disabled"
          @click="noteOpen = !noteOpen"
        >
          <PosIcon name="notebook-pen" :size="14" />
        </button>

        <!-- Tombol Hapus -->
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
          title="Hapus produk"
          aria-label="Hapus produk"
          :disabled="disabled"
          @click="emit('remove')"
        >
          <PosIcon name="trash-2" :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>
