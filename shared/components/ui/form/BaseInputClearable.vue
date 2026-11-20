<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  prefix?: string // <-- Tambahan untuk prefix
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-xs font-medium text-slate-700">{{ label }}</label>
    <div class="relative flex items-center">
      <!-- Prefix (contoh: Rp) -->
      <span v-if="prefix" class="absolute left-3 text-sm text-slate-500 pointer-events-none">
        {{ prefix }}
      </span>

      <!-- Input dengan padding kiri yang menyesuaikan ada/tidaknya prefix -->
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="placeholder"
        :class="[
          'w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-9 text-sm text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 transition-all',
          prefix ? 'pl-10' : 'pl-3.5', // Padding kiri lebih besar jika ada prefix
        ]"
      />

      <!-- Tombol Clear -->
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
