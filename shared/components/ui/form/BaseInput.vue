<!--shared/components/ui/form/BaseInput.vue-->
<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null
    label?: string
    placeholder?: string
    type?: string
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    maxlength?: string | number
    icon?: Component
    iconRight?: Component
    floating?: boolean
    prefixText?: string
    suffixText?: string
  }>(),
  {
    type: 'text',
    disabled: false,
    readonly: false,
    floating: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
  'click:icon': []
  'click:icon-right': []
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
    <div v-if="floating" class="relative">
      <div class="relative flex items-center">
        <!-- Left Icon -->
        <component
          v-if="icon"
          :is="icon"
          class="absolute left-3.5 w-4.5 h-4.5 pointer-events-none transition-colors"
          :class="hasValue ? 'text-primary-500' : 'text-slate-400 peer-focus:text-primary-500'"
        />

        <input
          v-bind="attrs"
          :type="type"
          :value="modelValue"
          :maxlength="maxlength"
          :placeholder="placeholder || ' '"
          :disabled="disabled"
          :readonly="readonly"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          class="peer w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-800 transition-all placeholder:text-transparent focus:outline-none focus:ring-3 disabled:bg-slate-100 disabled:text-slate-500"
          :class="[
            icon ? 'pl-10' : '',
            iconRight || suffixText ? 'pr-10' : '',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20',
          ]"
        />

        <!-- Floating Label -->
        <label
          class="absolute text-slate-500 text-sm transition-all pointer-events-none"
          :class="[
            icon ? 'left-10' : 'left-3.5',
            // Ada value: biru + di atas
            // hasValue
            //   ? '-top-2 px-1 text-[11px] font-semibold text-primary-600 bg-white dark:bg-slate-900 rounded-md peer-focus:text-primary-600'
            //   : 'peer-focus:-top-2 peer-focus:px-1 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-primary-600 peer-focus:bg-white peer-focus:rounded-md top-3.5 text-sm text-slate-500',
            hasValue
              ? '-top-2 px-1 text-[11px] font-semibold text-primary-600 bg-white rounded-md'
              : 'peer-focus:-top-2 peer-focus:px-1 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-primary-600 peer-focus:bg-white peer-focus:rounded-md top-3.5 text-sm text-slate-500',
          ]"
        >
          {{ label }}
          <span v-if="required" class="text-rose-500">*</span>
        </label>

        <!-- Right Icon / Suffix -->
        <div v-if="iconRight || suffixText" class="absolute right-3 flex items-center gap-1.5">
          <component
            v-if="iconRight"
            :is="iconRight"
            @click="$emit('click:icon-right')"
            class="w-4.5 h-4.5 cursor-pointer transition-colors"
            :class="
              hasValue ? 'text-primary-500 hover:text-primary-600' : 'text-slate-400 hover:text-slate-600 peer-focus:text-primary-500'
            "
          />
          <span v-if="suffixText" class="text-xs font-semibold transition-colors" :class="hasValue ? 'text-primary-500' : 'text-slate-400'">
            {{ suffixText }}
          </span>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- 2. MODE STANDAR (Non-Floating)                            -->
    <!-- ========================================================= -->
    <div v-else>
      <label v-if="label" class="block text-xs font-medium text-slate-700 mb-1.5">
        {{ label }}
        <span v-if="required" class="text-rose-500">*</span>
      </label>

      <div class="relative flex items-center">
        <!-- Left Icon -->
        <component v-if="icon" :is="icon" class="absolute left-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />

        <!-- Prefix Text (Cth: Rp) -->
        <div v-if="prefixText" class="absolute left-3.5 text-xs font-bold text-slate-500 select-none">
          {{ prefixText }}
        </div>

        <input
          v-bind="attrs"
          :type="type"
          :value="modelValue"
          :maxlength="maxlength"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          class="w-full rounded-xl border bg-white py-2.5 text-sm text-slate-800 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-3 disabled:bg-slate-100 disabled:text-slate-500"
          :class="[
            icon ? 'pl-10' : prefixText ? 'pl-11' : 'px-3.5',
            iconRight || suffixText ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20',
          ]"
        />

        <!-- Right Icon / Suffix Text -->
        <div v-if="iconRight || suffixText" class="absolute right-3.5 flex items-center gap-1.5 text-slate-400">
          <component
            v-if="iconRight"
            :is="iconRight"
            @click="$emit('click:icon-right')"
            class="w-4.5 h-4.5 cursor-pointer hover:text-slate-600 transition-colors"
          />
          <span v-if="suffixText" class="text-xs font-semibold text-slate-500">{{ suffixText }}</span>
        </div>
      </div>
    </div>

    <!-- Pesan Error Validasi -->
    <p v-if="error" class="mt-1.5 text-xs text-rose-600 font-medium">{{ error }}</p>
  </div>
</template>
