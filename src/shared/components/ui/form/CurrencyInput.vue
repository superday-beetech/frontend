<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    placeholder?: string
    size?: 'sm' | 'md'
    disabled?: boolean
    prefix?: string
  }>(),
  {
    min: 0,
    size: 'md',
    placeholder: '0',
    disabled: false,
    prefix: '',
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const isFocused = ref(false)
const localValue = ref('')

// Fungsi untuk format ke Rupiah (2.000)
function formatDisplay(val: number): string {
  return val ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val) : ''
}

// Fungsi untuk membersihkan format (2000)
function parseRaw(val: string): string {
  return val.replace(/\D/g, '')
}

// Sinkronisasi nilai dari parent
watch(
  () => props.modelValue,
  (newVal) => {
    if (!isFocused.value) {
      localValue.value = formatDisplay(newVal)
    } else {
      // Saat fokus, pastikan nilai mentah sesuai jika ada perubahan eksternal
      if (parseRaw(localValue.value) !== String(newVal || '')) {
        localValue.value = newVal ? String(newVal) : ''
      }
    }
  },
  { immediate: true }
)
async function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const rawDigits = parseRaw(el.value)

  const formatted = rawDigits ? new Intl.NumberFormat('id-ID').format(Number(rawDigits)) : ''

  localValue.value = formatted

  // Paksa kursor ke akhir setelah DOM update
  await nextTick()
  const len = el.value.length
  el.setSelectionRange(len, len)

  const numValue = Math.max(props.min, rawDigits ? Number(rawDigits) : 0)
  emit('update:modelValue', numValue)
}
/* function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const rawDigits = parseRaw(el.value)

  // Format ulang dengan titik ribuan secara real-time
  localValue.value = rawDigits ? new Intl.NumberFormat('id-ID').format(Number(rawDigits)) : ''

  // Emit nilai angka ke parent
  const numValue = Math.max(props.min, rawDigits ? Number(rawDigits) : 0)
  emit('update:modelValue', numValue)
} */

function onFocus() {
  isFocused.value = true
  // Saat fokus, tampilkan angka mentah tanpa titik
  localValue.value = props.modelValue ? String(props.modelValue) : ''
}

function onBlur() {
  isFocused.value = false
  // Saat blur, format ulang ke Rupiah
  localValue.value = formatDisplay(props.modelValue)
}
</script>

<template>
  <div
    class="flex w-full items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white transition focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900"
    :class="[disabled ? 'opacity-50' : '', size === 'sm' ? 'h-8 text-xs' : 'h-10 text-sm']"
  >
    <span
      v-if="prefix"
      class="inline-flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2 font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
    >
      {{ prefix }}
    </span>

    <input
      :value="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      inputmode="numeric"
      class="w-full min-w-0 flex-1 border-0 bg-transparent px-2 text-right font-medium text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-slate-100"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
  </div>
</template>
