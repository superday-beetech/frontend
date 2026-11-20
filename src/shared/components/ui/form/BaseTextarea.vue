<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue: string | null
    label?: string
    placeholder?: string
    rows?: number
    error?: string
    required?: boolean
    disabled?: boolean
    // Fitur Tambahan
    floating?: boolean // <-- Mode Floating
    icon?: Component // <-- Ikon Kiri (untuk non-floating)
    iconTop?: Component // <-- Ikon di atas (untuk floating, posisi kiri atas)
  }>(),
  {
    rows: 3,
    disabled: false,
    floating: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()

const hasValue = computed(() => {
  return props.modelValue !== null && props.modelValue !== undefined && String(props.modelValue).trim() !== ''
})
</script>

<template>
  <div class="w-full">
    <!-- ========================================================= -->
    <!-- 1. MODE FLOATING LABEL                                    -->
    <!-- ========================================================= -->
    <div v-if="floating" class="relative mt-2">
      <div class="relative">
        <!-- Ikon di atas (opsional) -->
        <component
          v-if="iconTop"
          :is="iconTop"
          class="absolute left-3.5 top-3.5 w-4.5 h-4.5 pointer-events-none transition-colors"
          :class="hasValue ? 'text-primary-500' : 'text-slate-400'"
        />

        <textarea
          v-bind="attrs"
          :rows="rows"
          :value="modelValue ?? ''"
          :placeholder="placeholder || ' '"
          :disabled="disabled"
          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          class="peer w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-800 transition-all placeholder:text-transparent focus:outline-none focus:ring-3 disabled:bg-slate-100 disabled:text-slate-500 resize-none"
          :class="[
            iconTop ? 'pl-10' : '',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20',
          ]"
        />

        <!-- Floating Label -->
        <label
          class="absolute text-slate-500 text-sm transition-all pointer-events-none"
          :class="[
            iconTop ? 'left-10' : 'left-3.5',
            hasValue
              ? '-top-2 px-1 text-[11px] font-semibold text-primary-600 bg-white rounded-md'
              : 'peer-focus:-top-2 peer-focus:px-1 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-primary-600 peer-focus:bg-white peer-focus:rounded-md top-3 text-sm',
          ]"
        >
          {{ label }}
          <span v-if="required" class="text-rose-500">*</span>
        </label>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. MODE STANDAR (Non-Floating)                            -->
    <!-- ========================================================= -->
    <div v-else>
      <label v-if="label" class="block text-sm font-medium text-slate-700 mb-1">
        {{ label }}
        <span v-if="required" class="text-rose-500">*</span>
      </label>

      <div class="relative flex items-start">
        <!-- Ikon Kiri (untuk non-floating) -->
        <component v-if="icon" :is="icon" class="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400 pointer-events-none" />

        <textarea
          v-bind="attrs"
          :rows="rows"
          :value="modelValue ?? ''"
          :placeholder="placeholder"
          :disabled="disabled"
          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          class="w-full rounded-lg border bg-white py-2 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-3 disabled:bg-slate-100 disabled:text-slate-500 resize-none"
          :class="[
            icon ? 'pl-10 pr-3' : 'px-3',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20',
          ]"
        />
      </div>
    </div>

    <!-- Pesan Error -->
    <p v-if="error" class="mt-1 text-xs text-rose-600">{{ error }}</p>
  </div>
</template>
