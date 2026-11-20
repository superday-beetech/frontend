<script setup lang="ts">
export interface RadioOption {
  label: string
  value: string | number
  description?: string
  badge?: string
  disabled?: boolean
}

defineProps<{
  modelValue: string | number
  options: RadioOption[]
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>

    <div class="grid grid-cols-1 gap-2">
      <label
        v-for="opt in options"
        :key="opt.value"
        class="group relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer"
        :class="[
          opt.disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
            : modelValue === opt.value
              ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-950/30 ring-1 ring-primary-500/2incial shadow-2xs'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700',
        ]"
      >
        <input
          type="radio"
          :value="opt.value"
          :checked="modelValue === opt.value"
          :disabled="opt.disabled"
          @change="emit('update:modelValue', opt.value)"
          class="peer sr-only"
        />

        <!-- Kustom Lingkaran Radio -->
        <div
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all mt-0.5"
          :class="[
            modelValue === opt.value
              ? 'border-primary-600 bg-primary-600 text-white'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-primary-500',
          ]"
        >
          <div v-if="modelValue === opt.value" class="h-2 w-2 rounded-full bg-white" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              {{ opt.label }}
            </span>
            <span
              v-if="opt.badge"
              class="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400"
            >
              {{ opt.badge }}
            </span>
          </div>
          <p v-if="opt.description" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {{ opt.description }}
          </p>
        </div>
      </label>
    </div>
  </div>
</template>
