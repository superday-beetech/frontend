<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ modelValue: number; min?: number; placeholder?: string; size?: 'sm' | 'md'; disabled?: boolean }>(), { min: 0, size: 'md', placeholder: '0', disabled: false })
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const display = computed(() => props.modelValue ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(props.modelValue) : '')
function update(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '')
  emit('update:modelValue', Math.max(props.min, digits ? Number(digits) : 0))
}
</script>

<template>
  <input class="form-control text-end" :class="size === 'sm' ? 'form-control-sm' : ''" :value="display" :placeholder="placeholder" :disabled="disabled" inputmode="numeric" @input="update" />
</template>
