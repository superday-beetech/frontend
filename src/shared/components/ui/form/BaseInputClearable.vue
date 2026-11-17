<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-xs font-medium text-slate-700">{{ label }}</label>
    <div class="relative flex items-center">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="placeholder"
        class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-9 text-sm text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 transition-all"
      />
      <button
        v-if="modelValue"
        @click="$emit('update:modelValue', '')"
        type="button"
        class="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
