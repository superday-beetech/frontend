<script setup lang="ts">
import PosIcon from './PosIcon.vue'
import type { PaymentMethod } from '../../types/sales'
defineProps<{ modelValue: PaymentMethod; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: PaymentMethod] }>()
const methods: Array<{ value: PaymentMethod; label: string; icon: string }> = [
  { value: 'cash', label: 'Tunai', icon: 'banknote' },
  { value: 'transfer', label: 'Transfer', icon: 'landmark' },
  { value: 'qris', label: 'QRIS', icon: 'qr-code' },
  { value: 'debit', label: 'Debit', icon: 'credit-card' },
  { value: 'credit', label: 'Kredit', icon: 'credit-card' },
  { value: 'other', label: 'Lainnya', icon: 'wallet' },
]
</script>

<template>
  <div>
    <span class="sr-only" id="pos-method-label">Metode pembayaran</span>
    <div class="pos-method-grid" role="radiogroup" aria-labelledby="pos-method-label">
      <label v-for="method in methods" :key="method.value" class="pos-choice">
        <input
          type="radio"
          class="sr-only"
          name="pos-payment-method"
          :value="method.value"
          :checked="modelValue === method.value"
          :disabled="disabled"
          @change="emit('update:modelValue', method.value)"
        />
        <span class="pos-method">
          <PosIcon :name="method.icon" :size="19" />
          <span>{{ method.label }}</span>
        </span>
      </label>
    </div>
  </div>
</template>
