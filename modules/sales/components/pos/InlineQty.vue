<!-- components/InlineQty.vue -->
<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
  }>(),
  {
    min: 1,
    step: 1,
    disabled: false,
  }
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const isEditing = ref(false)
const localValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  (val) => {
    if (!isEditing.value) localValue.value = String(val ?? '')
  },
  { immediate: true }
)

const canDec = computed(() => Number(props.modelValue || 0) > props.min)
const canInc = computed(() => props.max === undefined || Number(props.modelValue || 0) < props.max)

async function startEdit() {
  if (props.disabled) return
  isEditing.value = true
  localValue.value = String(props.modelValue ?? '')
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

function change(amount: number) {
  const cur = Number(props.modelValue || 0)
  const next = Math.max(props.min, Math.min(props.max ?? Number.MAX_SAFE_INTEGER, cur + amount))
  emit('update:modelValue', next)
  localValue.value = String(next)
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  localValue.value = raw
  emit('update:modelValue', raw ? Number(raw) : props.min)
}

function finishEdit() {
  isEditing.value = false
  // clamp saat blur
  let val = Number(localValue.value || props.min)
  if (val < props.min) val = props.min
  if (props.max !== undefined && val > props.max) val = props.max
  emit('update:modelValue', val)
  localValue.value = String(val)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    inputRef.value?.blur()
  } else if (e.key === 'Escape') {
    localValue.value = String(props.modelValue ?? '')
    inputRef.value?.blur()
  }
}
</script>

<template>
  <!-- MODE TEXT -->
  <div
    v-if="!isEditing"
    class="group flex cursor-text items-center justify-center rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/60"
    @click="startEdit"
  >
    <span class="text-sm font-medium tabular-nums text-slate-800 dark:text-slate-100">
      {{ modelValue ?? 0 }}
    </span>
  </div>

  <!-- MODE EDIT -->
  <div
    v-else
    class="flex items-stretch overflow-hidden rounded-lg border border-primary-500 bg-white ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-slate-900"
  >
    <button
      type="button"
      class="inline-flex w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
      :disabled="!canDec"
      @mousedown.prevent
      @click="change(-props.step)"
    >
      <Minus class="h-3.5 w-3.5" />
    </button>
    <input
      ref="inputRef"
      :value="localValue"
      inputmode="numeric"
      class="w-full min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
      @input="onInput"
      @blur="finishEdit"
      @keydown="onKeydown"
    />
    <button
      type="button"
      class="inline-flex w-7 shrink-0 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
      :disabled="!canInc"
      @mousedown.prevent
      @click="change(props.step)"
    >
      <Plus class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
