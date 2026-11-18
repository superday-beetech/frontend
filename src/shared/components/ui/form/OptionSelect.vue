<script setup lang="ts">
import { computed, ref } from 'vue'
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

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const isOpen = ref(false)
const query = ref('')

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
  isOpen.value = false
  query.value = ''
}

function updateNative(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const option = props.options.find((item) => String(item.value) === value)
  emit('update:modelValue', option?.value ?? value)
}
</script>

<template>
  <div v-if="searchable" class="position-relative">
    <button
      type="button"
      class="form-select text-start"
      :disabled="disabled"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      {{ selected?.label ?? placeholder }}
    </button>

    <div
      v-if="isOpen"
      class="position-absolute start-0 top-100 w-100 bg-white border rounded shadow p-2"
      style="z-index: 1080"
    >
      <input
        v-model="query"
        type="search"
        class="form-control form-control-sm mb-2"
        :placeholder="searchPlaceholder"
        autofocus
      />
      <div class="overflow-auto" style="max-height: 220px">
        <button
          v-for="option in filteredOptions"
          :key="String(option.value)"
          type="button"
          class="btn btn-sm w-100 text-start"
          :class="String(option.value) === String(modelValue) ? 'btn-primary' : 'btn-light'"
          @click="selectOption(option)"
        >
          <span>{{ option.label }}</span>
          <small v-if="option.description" class="d-block opacity-75">{{ option.description }}</small>
        </button>
        <p v-if="filteredOptions.length === 0" class="small text-muted text-center mb-0 py-2">
          {{ emptyText }}
        </p>
      </div>
    </div>
  </div>

  <select v-else class="form-select" :value="String(modelValue ?? '')" :disabled="disabled" @change="updateNative">
    <option value="">{{ placeholder }}</option>
    <option v-for="option in options" :key="String(option.value)" :value="String(option.value)">
      {{ option.label }}
    </option>
  </select>
</template>
