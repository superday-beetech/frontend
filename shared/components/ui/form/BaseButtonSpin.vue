<script setup lang="ts">
import { computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    min?: number
    max?: number
    step?: number
    size?: 'sm' | 'md'
    width?: string // <-- PROP BARU (opsional)
    disabled?: boolean
  }>(),
  {
    min: 0,
    step: 1,
    size: 'md',
    width: 'w-full', // <-- Default lebar
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

// Fungsi untuk tombol +/-
function change(amount: number) {
  const current = Number(props.modelValue || 0)
  const next = Math.max(props.min, Math.min(props.max ?? Number.MAX_SAFE_INTEGER, current + amount))
  emit('update:modelValue', Number(next.toFixed(4)))
}

// Fungsi untuk input manual
function onInput(event: Event) {
  const val = (event.target as HTMLInputElement).value

  // Jika kosong, emit null (konsisten dengan tipe modelValue)
  if (val === '') {
    emit('update:modelValue', props.min ?? 0)
    return
  }

  let num = Number(val)
  if (isNaN(num)) return

  emit('update:modelValue', Number(num.toFixed(4)))
}

// Fungsi saat input kehilangan fokus (blur)
function onBlur() {
  // Jika null, fallback ke min
  let val = Number(props.modelValue ?? props.min)
  if (val < props.min) val = props.min
  if (props.max !== undefined && val > props.max) val = props.max
  emit('update:modelValue', Number(val.toFixed(4)))
}

const isAtMin = computed(() => props.disabled || Number(props.modelValue ?? 0) <= props.min)
const isAtMax = computed(() => props.disabled || (props.max !== undefined && Number(props.modelValue ?? 0) >= props.max))
</script>

<template>
  <div
    class="flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900"
    :class="[
      disabled ? 'opacity-50' : '',
      size === 'sm' ? 'h-8' : 'h-10',
      width, // <-- Terapkan lebar dari prop
    ]"
  >
    <button
      type="button"
      class="inline-flex w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 transition-colors"
      :disabled="isAtMin"
      @click="change(-step)"
    >
      <Minus class="h-3.5 w-3.5" />
    </button>

    <input
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue ?? ''"
      :disabled="disabled"
      class="w-full min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-medium text-slate-800 outline-none dark:text-slate-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      @input="onInput"
      @blur="onBlur"
    />

    <button
      type="button"
      class="inline-flex w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 transition-colors"
      :disabled="isAtMax"
      @click="change(step)"
    >
      <Plus class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
