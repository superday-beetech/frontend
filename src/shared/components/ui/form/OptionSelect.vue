<script setup lang="ts">
import type { OptionItem } from '@/shared/composables/useOption'

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: OptionItem[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  searchable?: boolean
  disabled?: boolean
}>(), {
  placeholder: 'Pilih...',
  searchable: true,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

function update(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const option = props.options.find((item) => String(item.value) === value)
  emit('update:modelValue', option?.value ?? value)
}
</script>

<template>
  <select class="form-select" :value="String(modelValue ?? '')" :disabled="disabled" @change="update">
    <option value="">{{ placeholder }}</option>
    <option v-for="option in options" :key="String(option.value)" :value="String(option.value)">
      {{ option.label }}{{ option.description ? ' — ' + option.description : '' }}
    </option>
  </select>
</template>
