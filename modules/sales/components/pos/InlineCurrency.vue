<!-- components/InlineCurrency.vue -->
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    prefix?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    prefix: 'Rp',
    placeholder: '0',
    disabled: false,
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const isEditing = ref(false)
const localValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function format(val: number): string {
  return val ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val) : ''
}
function parseRaw(val: string): string {
  return val.replace(/\D/g, '')
}

// Sinkron nilai dari parent
watch(
  () => props.modelValue,
  (val) => {
    if (!isEditing.value) localValue.value = format(val)
  },
  { immediate: true }
)

async function startEdit() {
  if (props.disabled) return
  isEditing.value = true
  localValue.value = props.modelValue ? String(props.modelValue) : ''
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

function onInput(e: Event) {
  const raw = parseRaw((e.target as HTMLInputElement).value)
  localValue.value = raw
  emit('update:modelValue', raw ? Number(raw) : 0)
}

function finishEdit() {
  isEditing.value = false
  localValue.value = format(props.modelValue)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    inputRef.value?.blur()
  } else if (e.key === 'Escape') {
    localValue.value = format(props.modelValue)
    inputRef.value?.blur()
  }
}
</script>

<template>
  <!-- MODE TEXT (idle) -->
  <div
    v-if="!isEditing"
    class="group flex cursor-text items-center justify-end gap-1 rounded px-1 py-1 -mx-1 hover:bg-slate-50 dark:hover:bg-slate-800/60"
    @click="startEdit"
  >
    <span v-if="prefix && modelValue" class="text-xs font-medium text-slate-400">{{ prefix }}</span>
    <span class="text-sm font-medium tabular-nums" :class="modelValue ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'">
      {{ modelValue ? format(modelValue) : placeholder }}
    </span>
  </div>

  <!-- MODE EDIT (inline) -->
  <div
    v-else
    class="flex items-stretch overflow-hidden rounded-lg border border-primary-500 bg-white ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-slate-900"
  >
    <span
      v-if="prefix"
      class="inline-flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
    >
      {{ prefix }}
    </span>
    <input
      ref="inputRef"
      :value="localValue"
      inputmode="numeric"
      class="w-full min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-right text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
      @input="onInput"
      @blur="finishEdit"
      @keydown="onKeydown"
    />
  </div>
</template>
