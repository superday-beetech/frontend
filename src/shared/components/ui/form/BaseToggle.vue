<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
  activeText?: string
  inactiveText?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-xs font-medium text-slate-700">{{ label }}</label>
    <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
      <span class="text-xs font-semibold text-slate-700">
        {{ modelValue ? activeText || 'Aktif' : inactiveText || 'Nonaktif' }}
      </span>
      <button
        @click="$emit('update:modelValue', !modelValue)"
        type="button"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        :class="modelValue ? 'bg-emerald-600' : 'bg-slate-300'"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
          :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>
  </div>
</template>
