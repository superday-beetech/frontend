<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Search, X, Check } from 'lucide-vue-next'

export interface SelectOption {
  id: string | number
  label: string
}

const props = defineProps<{
  modelValue: (string | number)[]
  options: SelectOption[]
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  return props.options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

function toggleOption(id: string | number) {
  const index = props.modelValue.indexOf(id)
  const updated = [...props.modelValue]
  if (index > -1) {
    updated.splice(index, 1)
  } else {
    updated.push(id)
  }
  emit('update:modelValue', updated)
}

function removeOption(id: string | number) {
  const updated = props.modelValue.filter((item) => item !== id)
  emit('update:modelValue', updated)
}

function getLabel(id: string | number) {
  return props.options.find((opt) => opt.id === id)?.label || String(id)
}
</script>

<template>
  <div class="space-y-1.5 relative">
    <label v-if="label" class="block text-xs font-medium text-slate-700">{{ label }}</label>

    <div
      @click="isOpen = !isOpen"
      class="min-h-10.5 w-full rounded-xl border border-slate-300 bg-white p-2 flex flex-wrap items-center gap-1.5 cursor-pointer focus-within:border-primary-500 focus-within:ring-3 focus-within:ring-primary-500/20 transition-all"
    >
      <span
        v-for="id in modelValue"
        :key="id"
        class="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 border border-primary-200"
      >
        {{ getLabel(id) }}
        <button @click.stop="removeOption(id)" type="button" class="text-primary-400 hover:text-primary-700 cursor-pointer">
          <X class="w-3.5 h-3.5" />
        </button>
      </span>

      <span v-if="modelValue.length === 0" class="text-xs text-slate-400 px-1">
        {{ placeholder || 'Pilih opsi...' }}
      </span>

      <div class="ml-auto flex items-center pr-1 text-slate-400">
        <ChevronDown class="w-4 h-4" />
      </div>
    </div>

    <!-- Dropdown Popup List -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
    >
      <div class="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Search class="w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari..."
          class="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
          @click.stop
        />
      </div>
      <div class="max-h-48 overflow-y-auto divide-y divide-slate-100 smooth-scroll">
        <div
          v-for="opt in filteredOptions"
          :key="opt.id"
          @click.stop="toggleOption(opt.id)"
          class="px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
          :class="modelValue.includes(opt.id) ? 'bg-primary-50/50 font-semibold text-primary-700' : 'text-slate-700'"
        >
          <span>{{ opt.label }}</span>
          <Check v-if="modelValue.includes(opt.id)" class="w-4 h-4 text-primary-600" />
        </div>
        <div v-if="filteredOptions.length === 0" class="p-4 text-center text-xs text-slate-400">Tidak ada data ditemukan.</div>
      </div>
    </div>
  </div>
</template>
