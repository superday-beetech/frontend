<script setup lang="ts">
import type { DiscountMode } from '@/shared/composables/useDiscount'
withDefaults(defineProps<{ modelValue: number; mode?: DiscountMode; disabled?: boolean }>(), { mode: 'percent', disabled: false })
const emit = defineEmits<{ 'update:modelValue': [value: number]; 'update:mode': [value: DiscountMode] }>()
</script>

<template>
  <div class="input-group input-group-sm">
    <input class="form-control text-end" type="number" min="0" :value="modelValue" :disabled="disabled" @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))" />
    <select class="form-select" style="max-width: 92px" :value="mode" :disabled="disabled" @change="emit('update:mode', ($event.target as HTMLSelectElement).value as DiscountMode)">
      <option value="percent">%</option>
      <option value="amount">Rp</option>
    </select>
  </div>
</template>
