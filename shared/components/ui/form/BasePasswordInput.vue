<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPassword = ref(false)
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-xs font-medium text-slate-700">{{ label }}</label>
    <div class="relative flex items-center">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 transition-all"
      />
      <button
        @click="showPassword = !showPassword"
        type="button"
        class="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
      >
        <component :is="showPassword ? EyeOff : Eye" class="w-4.5 h-4.5" />
      </button>
    </div>
  </div>
</template>
