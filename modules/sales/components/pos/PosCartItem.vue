<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import PosIcon from './PosIcon.vue'
import InlineEditCell from './InlineEditCell.vue'
import { formatCurrency } from '../../utils/format'
import type { DiscountMode, PosCartItem } from '../../types/sales'

import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import CurrencyInput from '@/shared/components/ui/form/CurrencyInput.vue'
import DiscountInput from '@/shared/components/ui/form/DiscountInput.vue'
import BaseButtonSpin from '@/shared/components/ui/form/BaseButtonSpin.vue'

const props = defineProps<{
  item: PosCartItem
  index: number
  discountMode: DiscountMode
  discountInput: number
  note: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  quantityChange: [value: number | null]
  priceChange: [value: number]
  discountModeChange: [value: DiscountMode]
  discountChange: [value: number]
  noteChange: [value: string]
  remove: []
}>()

// ============================================
// CATATAN
// ============================================
const noteOpen = ref(Boolean(props.note))

watch(
  () => props.note,
  (value) => {
    if (value) noteOpen.value = true
  }
)

// ============================================
// NILAI TURUNAN (dinormalisasi sekali)
// ============================================
const unitPrice = computed(() => Number(props.item.unit_price) || 0)
const quantity = computed(() => Number(props.item.quantity) || 0)
const discountAmount = computed(() => Number(props.item.discount_amount) || 0)

const subtotal = computed(() => Math.max(0, unitPrice.value * quantity.value - discountAmount.value))

// ============================================
// INLINE EDIT: hanya satu kolom aktif pada satu waktu
// ============================================
type EditColumn = 'price' | 'qty' | 'discount'

const editingCol = ref<EditColumn | null>(null)

function startEdit(col: EditColumn) {
  if (props.disabled) return
  editingCol.value = col
}

function stopEdit(col: EditColumn) {
  // Guard: abaikan focusout dari kolom lama saat kolom lain sudah aktif
  if (editingCol.value === col) editingCol.value = null
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) editingCol.value = null
  }
)

// ============================================
// FORMAT
// ============================================
const numberFormat = new Intl.NumberFormat('id-ID')

function formatNum(val: number | string | null | undefined): string {
  return numberFormat.format(Number(val) || 0)
}
</script>

<template>
  <tr class="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
    <!-- 1. Nomor -->
    <td class="py-2 pl-3 pr-1 text-center text-[11px] text-slate-400 w-6">
      {{ index + 1 }}
    </td>

    <!-- 2. Produk & Catatan -->
    <td class="py-2 px-1 min-w-[140px]">
      <div class="flex flex-col">
        <span class="font-semibold text-xs text-slate-800 dark:text-slate-100 leading-tight">
          {{ item.product_name }} ({{ item.unit_name || '-' }})
        </span>

        <div v-if="noteOpen" class="mt-1.5">
          <BaseInput
            :model-value="note"
            placeholder="Catatan..."
            :disabled="disabled"
            class="text-xs py-1! px-2! h-7"
            @update:model-value="emit('noteChange', $event)"
          />
        </div>
      </div>
    </td>

    <!-- 3. Harga -->
    <td class="py-2 px-1 w-24">
      <InlineEditCell
        :editing="editingCol === 'price'"
        :disabled="disabled"
        align="end"
        @start="startEdit('price')"
        @stop="stopEdit('price')"
      >
        <template #display>
          <span class="text-[10px] font-medium text-slate-400">Rp</span>
          <span class="text-sm font-medium tabular-nums text-slate-800 dark:text-slate-100">
            {{ formatNum(unitPrice) }}
          </span>
        </template>
        <template #editor>
          <CurrencyInput
            :model-value="unitPrice"
            size="sm"
            :min="0"
            :disabled="disabled"
            @update:model-value="emit('priceChange', $event)"
          />
        </template>
      </InlineEditCell>
    </td>

    <!-- 4. Qty -->
    <td class="py-2 px-1 w-[90px]">
      <InlineEditCell :editing="editingCol === 'qty'" :disabled="disabled" align="center" @start="startEdit('qty')" @stop="stopEdit('qty')">
        <template #display>
          <span class="text-sm font-medium tabular-nums text-slate-800 dark:text-slate-100">
            {{ formatNum(quantity) }}
          </span>
        </template>
        <template #editor>
          <BaseButtonSpin
            :model-value="quantity"
            :min="0"
            :step="1"
            size="sm"
            :disabled="disabled"
            @update:model-value="emit('quantityChange', $event)"
          />
        </template>
      </InlineEditCell>
    </td>

    <!-- 5. Diskon -->
    <td class="py-2 px-1 w-[120px]">
      <InlineEditCell
        :editing="editingCol === 'discount'"
        :disabled="disabled"
        align="end"
        @start="startEdit('discount')"
        @stop="stopEdit('discount')"
      >
        <template #display>
          <span class="text-[10px] font-medium text-slate-400">
            {{ discountMode === 'percent' ? '%' : 'Rp' }}
          </span>
          <span class="text-sm font-medium tabular-nums text-slate-800 dark:text-slate-100">
            {{ formatNum(discountInput) }}
          </span>
        </template>
        <template #editor>
          <DiscountInput
            :model-value="discountInput"
            :mode="discountMode"
            :base="unitPrice * quantity"
            :disabled="disabled"
            @update:model-value="emit('discountChange', $event)"
            @update:mode="emit('discountModeChange', $event)"
          />
        </template>
      </InlineEditCell>
    </td>

    <!-- 6. Subtotal -->
    <td class="py-2 px-2 text-right w-24">
      <div class="font-bold text-xs text-slate-800 dark:text-slate-100">
        {{ formatCurrency(subtotal) }}
      </div>
      <div v-if="discountAmount > 0" class="text-[9px] text-rose-500 font-medium">-{{ formatCurrency(discountAmount) }}</div>
    </td>

    <!-- 7. Aksi -->
    <td class="py-2 pl-1 pr-2 w-14">
      <div class="flex justify-end items-center gap-0.5">
        <button
          type="button"
          class="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors"
          :class="note ? 'text-primary-600 bg-primary-50 dark:bg-slate-700' : ''"
          title="Catatan"
          @click="noteOpen = !noteOpen"
        >
          <PosIcon name="file-text" :size="14" />
        </button>

        <button
          type="button"
          class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
          title="Hapus"
          :disabled="disabled"
          @click="emit('remove')"
        >
          <PosIcon name="trash-2" :size="14" />
        </button>
      </div>
    </td>
  </tr>
</template>
