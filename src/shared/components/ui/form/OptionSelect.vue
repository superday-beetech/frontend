<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ChevronDown, Check, Search } from 'lucide-vue-next'
import type { OptionItem } from '@/shared/composables/useOption'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null
    options: OptionItem[]
    label?: string
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    error?: string
    required?: boolean
    searchable?: boolean
    disabled?: boolean
    floating?: boolean
  }>(),
  {
    placeholder: 'Silahkan pilih...',
    searchPlaceholder: 'Cari...',
    emptyText: 'Data tidak ditemukan',
    searchable: true,
    disabled: false,
    required: false,
    floating: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isOpen = ref(false)
const query = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selected = computed(() => props.options.find((item) => String(item.value) === String(props.modelValue)))

const hasValue = computed(() => {
  return props.modelValue !== null && props.modelValue !== undefined && String(props.modelValue).trim() !== ''
})

const innerText = computed(() => {
  if (props.floating) return props.placeholder
  return props.label || props.placeholder
})

const isFloatingActive = computed(() => {
  return props.floating && !!props.label && (hasValue.value || isOpen.value)
})

const filteredOptions = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  if (!keyword) return props.options
  return props.options.filter((item) =>
    [item.label, item.description, item.keywords].some((value) => value?.toLocaleLowerCase().includes(keyword))
  )
})

watch(isOpen, async (newVal) => {
  if (newVal && props.searchable) {
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    query.value = ''
  }
})

function selectOption(option: OptionItem) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function updateNative(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const option = props.options.find((item) => String(item.value) === value)
  emit('update:modelValue', option ? option.value : value || null)
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="w-full relative" ref="dropdownRef">
    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- 1. TAMPILAN MOBILE (Native Select)                            -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="block md:hidden relative">
      <!-- Bungkus label dengan template -->
      <template v-if="!floating && label">
        <label class="block mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          {{ label }}
          <span v-if="required" class="text-rose-500">*</span>
        </label>
      </template>

      <select
        v-bind="$attrs"
        :value="modelValue ?? ''"
        :disabled="disabled"
        @change="updateNative"
        class="w-full appearance-none rounded-xl border bg-white px-3.5 text-sm transition-colors focus:outline-none focus:ring-3 disabled:bg-slate-100 dark:bg-slate-900 dark:border-slate-700"
        :class="[
          floating ? 'py-3' : 'py-2.5',
          !hasValue ? 'text-transparent' : 'text-slate-800 dark:text-slate-100',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20',
        ]"
      >
        <option value="" disabled class="hidden">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="String(option.value)"
          :value="String(option.value)"
          class="text-slate-800 dark:text-slate-100"
        >
          {{ option.label }}
        </option>
      </select>

      <ChevronDown class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <!-- Label Floating (Tanpa v-else-if, langsung v-if terpisah) -->
      <label
        v-if="floating && label"
        class="absolute left-3.5 pointer-events-none transition-all duration-200 z-10 whitespace-nowrap"
        :class="[
          isFloatingActive
            ? '-top-2 px-1 text-[11px] font-semibold bg-white dark:bg-slate-900 rounded-md'
            : !hasValue
              ? 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
              : 'hidden',
          isFloatingActive ? 'text-primary-600' : 'text-slate-400',
        ]"
      >
        {{ isFloatingActive ? label : innerText }}
        <span v-if="required" class="text-rose-500 ml-1">*</span>
      </label>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- 2. TAMPILAN DESKTOP (Custom Dropdown)                         -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="hidden md:block relative">
      <!-- LABEL DESKTOP (NON-FLOATING: Statis di atas kotak) -->
      <label v-if="!floating && label" class="block mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
        {{ label }}
        <span v-if="required" class="text-rose-500">*</span>
      </label>

      <!-- Trigger Button -->
      <button
        type="button"
        v-bind="$attrs"
        class="flex w-full items-center justify-between rounded-xl border bg-white text-left text-sm transition-all shadow-sm dark:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800"
        :class="[
          floating ? 'px-3.5 py-3' : 'px-3.5 py-2.5',
          disabled
            ? 'opacity-60'
            : isOpen
              ? 'border-primary-500 ring-3 ring-primary-500/15'
              : error
                ? 'border-rose-400 hover:border-rose-500'
                : 'border-slate-300 hover:border-primary-400 dark:border-slate-700 dark:hover:border-primary-500',
        ]"
        :disabled="disabled"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span class="truncate pt-0.5" :class="!selected ? 'text-transparent' : 'text-slate-800 dark:text-slate-100 font-medium'">
          {{ selected ? selected.label : placeholder }}
        </span>

        <ChevronDown
          class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200"
          :class="{ 'rotate-180 text-primary-600': isOpen }"
        />
      </button>

      <!-- LABEL DESKTOP (FLOATING) -->
      <label
        v-if="floating && label"
        class="absolute left-3.5 pointer-events-none transition-all duration-200 z-10 whitespace-nowrap"
        :class="[
          isFloatingActive
            ? '-top-2 px-1 text-[11px] font-semibold bg-white dark:bg-slate-900 rounded-md'
            : !hasValue
              ? 'top-1/2 -translate-y-1/2 text-sm text-slate-400'
              : 'hidden',
          isFloatingActive ? 'text-primary-600' : 'text-slate-400',
        ]"
      >
        {{ isFloatingActive ? label : innerText }}
        <span v-if="required && isFloatingActive" class="text-rose-500 ml-1">*</span>
      </label>

      <!-- Dropdown Panel -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0 translate-y-1"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100 translate-y-0"
        leave-to-class="transform scale-95 opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <!-- Search Input -->
          <div v-if="searchable" class="border-b border-slate-100 p-2 dark:border-slate-800">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref="searchInputRef"
                v-model="query"
                type="search"
                class="w-full rounded-lg border-0 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-slate-100"
                :placeholder="searchPlaceholder"
              />
            </div>
          </div>

          <!-- Options List -->
          <div class="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
            <button
              v-for="option in filteredOptions"
              :key="String(option.value)"
              type="button"
              class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              :class="
                String(option.value) === String(modelValue)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-slate-700 dark:text-slate-300'
              "
              @click="selectOption(option)"
            >
              <div class="flex flex-col">
                <span class="font-medium">{{ option.label }}</span>
                <span v-if="option.description" class="text-xs text-slate-500 dark:text-slate-400">
                  {{ option.description }}
                </span>
              </div>
              <Check v-if="String(option.value) === String(modelValue)" class="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
            </button>

            <!-- Empty State -->
            <div v-if="filteredOptions.length === 0" class="py-6 text-center text-sm text-slate-500">
              <Search class="mx-auto mb-2 h-6 w-6 text-slate-300" />
              {{ emptyText }}
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Pesan Error Validasi -->
    <p v-if="error" class="mt-1.5 text-xs text-rose-600 font-medium">{{ error }}</p>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
