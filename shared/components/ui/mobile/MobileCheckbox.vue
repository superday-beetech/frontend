<script setup lang="ts">
import { Check } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label
    class="group relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer"
    :class="[
      disabled
        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
        : modelValue
          ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-1 ring-primary-500/20 shadow-2xs'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700',
    ]"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="peer sr-only"
    />

    <!-- Kustom Kotak Checkbox -->
    <div
      class="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all mt-0.5"
      :class="[
        modelValue
          ? 'border-primary-600 bg-primary-600 text-white shadow-xs'
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-primary-500',
      ]"
    >
      <Check v-if="modelValue" class="w-3.5 h-3.5 stroke-3" />
    </div>

    <div class="min-w-0 flex-1">
      <span class="text-xs font-bold text-slate-900 dark:text-white block">
        {{ label }}
      </span>
      <p v-if="description" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
        {{ description }}
      </p>
    </div>
  </label>
</template>
