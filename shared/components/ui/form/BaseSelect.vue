<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

export interface SelectOption {
  label: string
  value: string | number
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined
    options: SelectOption[]
    label?: string
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: 'Pilih salah satu...',
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

// ── State Desktop ──
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// ── Computed ──
const selectedOption = computed(() => {
  return props.options.find((opt) => String(opt.value) === String(props.modelValue)) || null
})

// ── Logika Native Select (Mobile) ──
function handleNativeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  // Kembalikan ke tipe aslinya (number atau string)
  const originalOption = props.options.find((opt) => String(opt.value) === value)
  emit('update:modelValue', originalOption ? originalOption.value : value)
}

// ── Logika Custom Dropdown (Desktop) ──
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function closeDropdown() {
  isOpen.value = false
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  closeDropdown()
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="w-full relative">
    <!-- Label -->
    <label v-if="label" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- 1. TAMPILAN MOBILE (Native Select, < 768px)                   -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="block md:hidden relative">
      <select
        :value="modelValue ?? ''"
        :disabled="disabled"
        @change="handleNativeChange"
        class="w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-3 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
        :class="
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
        "
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <!-- Ikon Chevron untuk Mobile -->
      <ChevronDown class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- 2. TAMPILAN DESKTOP (Custom Dropdown, >= 768px)               -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="hidden md:block">
      <!-- Trigger Button -->
      <button
        type="button"
        :disabled="disabled"
        @click="toggleDropdown"
        class="flex w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm transition-all shadow-sm dark:bg-slate-900"
        :class="[
          disabled
            ? 'cursor-not-allowed bg-slate-50 opacity-60 dark:bg-slate-800/50'
            : isOpen
              ? 'border-primary-500 ring-2 ring-primary-500/15'
              : error
                ? 'border-rose-400 hover:border-rose-500'
                : 'border-slate-300 hover:border-primary-400 dark:border-slate-700 dark:hover:border-primary-500',
        ]"
      >
        <span
          class="truncate"
          :class="selectedOption ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'"
        >
          {{ selectedOption ? selectedOption.label : placeholder }}
        </span>
        <ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180 text-primary-600': isOpen }" />
      </button>

      <!-- Dropdown Panel -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden p-1.5"
        >
          <!-- Options List -->
          <div class="max-h-60 overflow-y-auto custom-scrollbar">
            <button
              v-for="opt in options"
              :key="opt.value"
              type="button"
              @click="selectOption(opt)"
              class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              :class="
                String(opt.value) === String(modelValue)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-700 dark:text-slate-300'
              "
            >
              <span class="truncate">{{ opt.label }}</span>
              <Check v-if="String(opt.value) === String(modelValue)" class="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Pesan Error Validasi -->
    <p v-if="error" class="mt-1.5 text-xs text-rose-600 font-medium">{{ error }}</p>
  </div>
</template>
