<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean | number | string
    label?: string
    description?: string
    disabled?: boolean
    trueValue?: boolean | number | string
    falseValue?: boolean | number | string
    variant?: 'default' | 'rotate' | 'svg-draw' // <-- PROP BARU
  }>(),
  {
    trueValue: true,
    falseValue: false,
    variant: 'default', // Default pakai gaya 'default'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean | number | string]
}>()

const isChecked = computed(() => props.modelValue === props.trueValue)

function toggle() {
  if (props.disabled) return
  const nextValue = isChecked.value ? props.falseValue : props.trueValue
  emit('update:modelValue', nextValue)
}
</script>

<template>
  <label
    class="group inline-flex items-start gap-3 select-none transition-opacity duration-200"
    :class="disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
    @click.prevent="toggle"
  >
    <!-- Hidden Native Checkbox -->
    <input type="checkbox" class="sr-only peer" :checked="isChecked" :disabled="disabled" readonly />

    <!-- ========================================== -->
    <!-- VARIAN 1: DEFAULT (Kotak + Pop Animation)  -->
    <!-- ========================================== -->
    <template v-if="variant === 'default'">
      <div
        class="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-300 ease-out mt-0.5"
        :class="[
          isChecked
            ? 'border-primary-600 bg-primary-600 shadow-sm shadow-primary-500/30'
            : 'border-slate-300 bg-white group-hover:border-primary-400 dark:border-slate-600 dark:bg-slate-800 dark:group-hover:border-primary-500',
          'peer-focus-visible:ring-4 peer-focus-visible:ring-primary-500/20 peer-focus-visible:ring-offset-1 dark:ring-offset-slate-900',
        ]"
      >
        <Check
          class="h-3.5 w-3.5 text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          :class="isChecked ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-12'"
          stroke-width="3.5"
        />
      </div>
    </template>

    <!-- ========================================== -->
    <!-- VARIAN 2: ROTATE (Animasi Putar 45 Derajat)-->
    <!-- ========================================== -->
    <template v-else-if="variant === 'rotate'">
      <div class="relative flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
        <span
          class="block w-full h-full border-[2.5px] rounded-md transition-all duration-375 ease-in-out pointer-events-none"
          :class="[
            isChecked
              ? 'rotate-45 w-[12px]! h-[20px]! ml-[6px] border-primary-600 border-t-transparent! border-l-transparent! rounded-none!'
              : 'rotate-0 border-slate-300 bg-white group-hover:border-primary-400 dark:border-slate-600 dark:bg-slate-800 dark:group-hover:border-primary-500',
            'peer-focus-visible:ring-4 peer-focus-visible:ring-primary-500/20 peer-focus-visible:ring-offset-1 dark:ring-offset-slate-900',
          ]"
        ></span>
      </div>
    </template>

    <!-- ========================================== -->
    <!-- VARIAN 3: SVG DRAW (Garis Centang Tergambar)-->
    <!-- ========================================== -->
    <template v-else-if="variant === 'svg-draw'">
      <div class="relative w-5 h-5 shrink-0 mt-0.5">
        <!-- Kotak Border -->
        <div
          class="absolute inset-0 rounded border transition-all duration-300"
          :class="[
            isChecked
              ? 'border-[2.5px] border-primary-600'
              : 'border-[1.5px] border-slate-300 group-hover:border-primary-400 dark:border-slate-600',
            'peer-focus-visible:ring-4 peer-focus-visible:ring-primary-500/20 peer-focus-visible:ring-offset-1 dark:ring-offset-slate-900',
          ]"
        ></div>
        <!-- SVG Centang -->
        <svg viewBox="0 0 22 22" class="absolute inset-0 w-full h-full pointer-events-none" fill="none">
          <path
            d="M5.5,11.3L9,14.8L20.2,3.3"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="transition-all duration-500 ease-out text-primary-600"
            :class="isChecked ? 'opacity-100' : 'opacity-0'"
            :style="{
              strokeDasharray: '20',
              strokeDashoffset: isChecked ? '0' : '20',
            }"
          />
        </svg>
      </div>
    </template>

    <!-- Area Teks -->
    <div class="flex flex-col">
      <div class="flex items-center gap-2">
        <span
          v-if="label"
          class="text-sm font-medium leading-5 transition-colors duration-200"
          :class="[
            disabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200',
            isChecked && !disabled ? 'text-slate-900 dark:text-white' : '',
          ]"
        >
          {{ label }}
        </span>
        <span
          v-if="description"
          class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          :class="isChecked ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : ''"
        >
          {{ description }}
        </span>
      </div>
    </div>
  </label>
</template>
