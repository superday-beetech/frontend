<script setup lang="ts">
import { computed } from 'vue' // 1. Import ditaruh paling atas

// 2. defineProps cukup dipanggil SEKALI saja
const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    showQuickSteps?: boolean
  }>(),
  {
    min: 0,
    step: 1,
    showQuickSteps: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

// 3. Karena props.modelValue bisa berupa string dari input, kita pastikan jadi number
const currentValue = computed(() => Number(props.modelValue) || 0)

function updateValue(newValue: number) {
  // Opsional: Pastikan tidak melebihi max jika max didefinisikan
  let finalValue = newValue
  if (props.max !== undefined && finalValue > props.max) {
    finalValue = props.max
  }

  emit('update:modelValue', finalValue)
  emit('change', finalValue)
}

// 4. Gunakan .value dari computed untuk operasi matematika
function increment(currentStep: number) {
  updateValue(Number((currentValue.value + currentStep).toFixed(2)))
}

function decrement(currentStep: number) {
  const nextVal = Math.max(props.min, Number((currentValue.value - currentStep).toFixed(2)))
  updateValue(nextVal)
}

function handleInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  updateValue(isNaN(val) ? props.min : val)
}
</script>

<template>
  <div class="space-y-1.5">
    <!-- Header Quick Steps (Opsional) -->
    <div v-if="showQuickSteps" class="flex items-center justify-between">
      <span class="text-[11px] font-medium text-slate-500">Quick Adjust:</span>
      <div class="flex gap-1">
        <button
          @click="updateValue(Number((currentValue + 0.5).toFixed(2)))"
          type="button"
          class="text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all cursor-pointer border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
        >
          +0.5
        </button>
        <button
          @click="updateValue(Number((currentValue + 1).toFixed(2)))"
          type="button"
          class="text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all cursor-pointer border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
        >
          +1
        </button>
        <button
          @click="updateValue(Number((currentValue + 10).toFixed(2)))"
          type="button"
          class="text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all cursor-pointer border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
        >
          +10
        </button>
      </div>
    </div>

    <!-- Kontrol Utama Stepper -->
    <div
      class="flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:border-primary-500 focus-within:ring-3 focus-within:ring-primary-500/20 transition-all"
    >
      <button
        @click="decrement(step)"
        type="button"
        class="flex h-10 w-12 items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 active:bg-slate-200 border-r border-slate-200 cursor-pointer transition-colors font-bold text-base"
        title="Kurangi"
      >
        -
      </button>

      <input
        :value="modelValue"
        @input="handleInput"
        type="number"
        :step="step"
        :min="min"
        :max="max"
        class="w-full text-center border-0 py-2.5 text-sm font-bold text-slate-800 bg-transparent focus:outline-none font-mono"
      />

      <button
        @click="increment(step)"
        type="button"
        class="flex h-10 w-12 items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 active:bg-slate-200 border-l border-slate-200 cursor-pointer transition-colors font-bold text-base"
        title="Tambah"
      >
        +
      </button>
    </div>
  </div>
</template>
