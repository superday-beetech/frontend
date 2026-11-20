<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="!disabled && emit('update:modelValue', !props.modelValue)"
    class="inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span
      class="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
      :class="modelValue ? 'bg-primary-600' : 'bg-slate-300'"
    >
      <span
        class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
      />
    </span>
    <span v-if="label" class="text-xs font-medium text-slate-700">{{ label }}</span>
  </button>
</template>
