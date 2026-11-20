<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = ref('')

// Sinkronisasi nilai dari parent
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal || newVal === 0) {
      displayValue.value = ''
    } else {
      displayValue.value = new Intl.NumberFormat('id-ID').format(newVal)
    }
  },
  { immediate: true }
)

// Saat diklik/difokus, bersihkan angka 0 agar user bisa langsung ketik dari awal
function handleFocus(e: FocusEvent) {
  const target = e.target as HTMLInputElement
  if (props.modelValue === 0) {
    displayValue.value = ''
    target.value = ''
  }
}

// Saat user mengetik (hanya mengizinkan angka)
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const raw = target.value

  // Ambil murni angka saja
  const cleanDigits = raw.replace(/\D/g, '')
  const numericValue = cleanDigits === '' ? 0 : Number(cleanDigits)

  emit('update:modelValue', numericValue)

  if (cleanDigits === '') {
    displayValue.value = ''
  } else {
    displayValue.value = new Intl.NumberFormat('id-ID').format(numericValue)
  }
}

function handleBlur() {
  if (!props.modelValue || props.modelValue === 0) {
    displayValue.value = ''
  } else {
    displayValue.value = new Intl.NumberFormat('id-ID').format(props.modelValue)
  }
}
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-xs font-medium text-slate-700">{{ label }}</label>
    <div class="relative flex items-center">
      <!-- Label "Rp" di sebelah kiri -->
      <div class="absolute left-3.5 text-xs font-bold text-slate-500 z-10 pointer-events-none">Rp</div>

      <!-- Input dengan text-right agar pengetikan dan nominal rata kanan -->
      <input
        :value="displayValue"
        @focus="handleFocus"
        @input="handleInput"
        @blur="handleBlur"
        type="text"
        inputmode="numeric"
        :placeholder="placeholder || '0'"
        class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-3.5 text-sm font-bold text-slate-900 font-mono text-right focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 transition-all"
      />
    </div>
  </div>
</template>
