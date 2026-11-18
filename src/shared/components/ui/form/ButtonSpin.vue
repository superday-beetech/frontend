<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  size?: 'sm' | 'md'
  disabled?: boolean
}>(), { min: 0, step: 1, size: 'md', disabled: false })
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
function change(amount: number) {
  const next = Math.max(props.min, Math.min(props.max ?? Number.MAX_SAFE_INTEGER, Number(props.modelValue || 0) + amount))
  emit('update:modelValue', Number(next.toFixed(4)))
}
</script>

<template>
  <div class="input-group" :class="size === 'sm' ? 'input-group-sm' : ''">
    <button type="button" class="btn btn-outline-secondary" :disabled="disabled || modelValue <= min" @click="change(-step)">−</button>
    <input class="form-control text-center" type="number" :min="min" :max="max" :step="step" :value="modelValue" :disabled="disabled" @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))" />
    <button type="button" class="btn btn-outline-secondary" :disabled="disabled || (max !== undefined && modelValue >= max)" @click="change(step)">+</button>
  </div>
</template>
