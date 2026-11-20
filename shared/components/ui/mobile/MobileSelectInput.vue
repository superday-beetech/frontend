<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ChevronDown, Search, Check, X, Inbox } from 'lucide-vue-next'

export interface SelectOption {
  label: string
  value: string | number
  description?: string
  badge?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined
    options: SelectOption[]
    label?: string
    placeholder?: string
    searchPlaceholder?: string
    searchable?: boolean
    clearable?: boolean
    disabled?: boolean
    emptyText?: string
  }>(),
  {
    placeholder: 'Pilih salah satu...',
    searchPlaceholder: 'Ketik untuk mencari...',
    searchable: true,
    clearable: false,
    disabled: false,
    emptyText: 'Data tidak ditemukan',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [option: SelectOption | null]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Opsi yang sedang terpilih
const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue) || null
})

// Filter opsi berdasarkan pencarian
const filteredOptions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(q) ||
      (opt.description && opt.description.toLowerCase().includes(q)) ||
      (opt.badge && opt.badge.toLowerCase().includes(q))
  )
})

// Reset pencarian & fokus otomatis saat dibuka
watch(isOpen, async (open) => {
  if (open) {
    searchQuery.value = ''
    const activeIdx = filteredOptions.value.findIndex((o) => o.value === props.modelValue)
    highlightedIndex.value = activeIdx >= 0 ? activeIdx : 0

    if (props.searchable) {
      await nextTick()
      searchInputRef.value?.focus()
    }
  }
})

// Buka / Tutup
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

// Pilih Item
const selectItem = (option: SelectOption) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  emit('change', option)
  closeDropdown()
}

// Hapus Pilihan
const clearSelection = () => {
  emit('update:modelValue', null)
  emit('change', null)
}

// Navigasi Keyboard (ArrowUp, ArrowDown, Enter, Escape) untuk Web Desktop
const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeDropdown()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (filteredOptions.value.length > 0) {
      highlightedIndex.value = (highlightedIndex.value + 1) % filteredOptions.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (filteredOptions.value.length > 0) {
      highlightedIndex.value = (highlightedIndex.value - 1 + filteredOptions.value.length) % filteredOptions.value.length
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const target = filteredOptions.value[highlightedIndex.value]
    if (target) selectItem(target)
  }
}

// Tutup saat klik di luar area (mode desktop)
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative space-y-1.5" @keydown="handleKeydown">
    <!-- Label -->
    <label v-if="label" class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>

    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      class="group w-full flex items-center justify-between gap-2 rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-left text-xs transition-all shadow-2xs"
      :class="[
        disabled
          ? 'cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
          : isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/15 cursor-pointer'
            : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer',
      ]"
    >
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <span v-if="selectedOption" class="font-semibold text-slate-800 dark:text-slate-100 truncate">
          {{ selectedOption.label }}
        </span>
        <span v-else class="font-medium text-slate-400 dark:text-slate-500 truncate">
          {{ placeholder }}
        </span>

        <span
          v-if="selectedOption?.badge"
          class="shrink-0 rounded-md bg-primary-50 dark:bg-primary-950/70 border border-primary-200/70 dark:border-primary-800/60 px-1.5 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400"
        >
          {{ selectedOption.badge }}
        </span>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <!-- Tombol Clear Opsional -->
        <span
          v-if="clearable && selectedOption && !disabled"
          role="button"
          tabindex="-1"
          @click.stop="clearSelection"
          class="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 transition-colors"
          title="Hapus pilihan"
        >
          <X class="w-3.5 h-3.5" />
        </span>

        <ChevronDown
          class="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200"
          :class="{ 'rotate-180 text-primary-600 dark:text-primary-400': isOpen }"
        />
      </div>
    </button>

    <!-- Backdrop Overlay Khusus Mobile (< 640px) -->
    <transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" @click="closeDropdown" class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs sm:hidden" />
    </transition>

    <!-- Panel Opsi: Bottom Sheet di Mobile, Floating Dropdown Popover di Web -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-full sm:translate-y-1 sm:scale-95 opacity-0"
      enter-to-class="translate-y-0 sm:scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 sm:scale-100 opacity-100"
      leave-to-class="translate-y-full sm:translate-y-1 sm:scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:right-0 sm:mt-1.5 sm:rounded-2xl sm:border overflow-hidden"
      >
        <!-- Drag Handle & Header Khusus Mobile -->
        <div class="sm:hidden pt-2.5 pb-2 px-4 border-b border-slate-100 dark:border-slate-800">
          <div class="mx-auto mb-2.5 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              {{ label || 'Pilih Opsi' }}
            </span>
            <button type="button" @click="closeDropdown" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Kotak Pencarian Instan -->
        <div v-if="searchable" class="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-8.5 pr-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Daftar Pilihan (Touch-Friendly min-h 44px di mobile) -->
        <div class="max-h-[60vh] sm:max-h-64 overflow-y-auto p-1.5 space-y-1">
          <button
            v-for="(option, idx) in filteredOptions"
            :key="option.value"
            type="button"
            :disabled="option.disabled"
            @mouseenter="highlightedIndex = idx"
            @click="selectItem(option)"
            class="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 sm:py-2 text-left transition-colors"
            :class="[
              option.disabled
                ? 'opacity-40 cursor-not-allowed'
                : modelValue === option.value
                  ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 cursor-pointer'
                  : highlightedIndex === idx
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer',
            ]"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold truncate">
                  {{ option.label }}
                </span>
                <span
                  v-if="option.badge"
                  class="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400"
                >
                  {{ option.badge }}
                </span>
              </div>
              <p v-if="option.description" class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {{ option.description }}
              </p>
            </div>

            <Check v-if="modelValue === option.value" class="w-4 h-4 shrink-0 text-primary-600 dark:text-primary-400" />
          </button>

          <!-- Empty State -->
          <div
            v-if="filteredOptions.length === 0"
            class="py-8 px-4 text-center flex flex-col items-center justify-center space-y-1.5 text-slate-400 dark:text-slate-500"
          >
            <Inbox class="w-6 h-6 opacity-60" />
            <p class="text-xs font-medium">{{ emptyText }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
