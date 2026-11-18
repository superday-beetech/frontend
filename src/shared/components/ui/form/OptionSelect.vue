<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ChevronDown, Search, Check } from 'lucide-vue-next'
import type { OptionItem } from '@/shared/composables/useOption'

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: OptionItem[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  searchable?: boolean
  disabled?: boolean
}>(), {
  placeholder: 'Pilih...',
  searchPlaceholder: 'Cari...',
  emptyText: 'Data tidak ditemukan',
  searchable: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [option: OptionItem | null]
}>()
const isOpen = ref(false)
const query = ref('')
const root = ref<HTMLElement | null>(null)

const selected = computed(() => props.options.find((item) => String(item.value) === String(props.modelValue)))
const filteredOptions = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase()
  if (!keyword) return props.options
  return props.options.filter((item) =>
    [item.label, item.description, item.keywords].some((value) => value?.toLocaleLowerCase().includes(keyword)),
  )
})

function selectOption(option: OptionItem) {
  emit('update:modelValue', option.value)
  emit('change', option)
  isOpen.value = false
  query.value = ''
}

function updateNative(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const option = props.options.find((item) => String(item.value) === value)
  emit('update:modelValue', option?.value ?? value)
  emit('change', option ?? null)
}

function onDocumentClick(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) isOpen.value = false
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', onDocumentClick)
  onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
}
</script>

<template>
  <div v-if="searchable" ref="root" class="relative w-full">
    <button
      type="button"
      class="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      :disabled="disabled"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <span class="truncate" :class="selected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'">
        {{ selected?.label ?? placeholder }}
      </span>
      <ChevronDown class="h-4 w-4 shrink-0 text-slate-400" />
    </button>

    <div
      v-if="isOpen"
      class="absolute left-0 top-[calc(100%+0.35rem)] z-[120] w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="relative mb-2">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="query"
          type="search"
          class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-950"
          :placeholder="searchPlaceholder"
          autofocus
        />
      </div>
      <div class="max-h-56 overflow-y-auto">
        <button
          v-for="option in filteredOptions"
          :key="String(option.value)"
          type="button"
          class="flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition"
          :class="String(option.value) === String(modelValue) ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'"
          @click="selectOption(option)"
        >
          <span>
            <span class="block">{{ option.label }}</span>
            <span v-if="option.description" class="mt-0.5 block text-xs text-slate-500">{{ option.description }}</span>
          </span>
          <Check v-if="String(option.value) === String(modelValue)" class="mt-0.5 h-4 w-4 shrink-0" />
        </button>
        <p v-if="filteredOptions.length === 0" class="px-3 py-4 text-center text-sm text-slate-500">
          {{ emptyText }}
        </p>
      </div>
    </div>
  </div>

  <select
    v-else
    class="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    :value="String(modelValue ?? '')"
    :disabled="disabled"
    @change="updateNative"
  >
    <option value="">{{ placeholder }}</option>
    <option v-for="option in options" :key="String(option.value)" :value="String(option.value)">
      {{ option.label }}
    </option>
  </select>
</template>
