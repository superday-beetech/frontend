<script setup lang="ts">
export interface SelectOption {
  label: string;
  value: string | number;
}

defineProps<{
  modelValue: string | number | null;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-xs font-medium text-slate-700 mb-1"> {{ label }} <span v-if="required" class="text-rose-500">*</span> </label>
    <select
      :value="modelValue ?? ''"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-3 disabled:bg-slate-100"
      :class="error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-rose-600">{{ error }}</p>
  </div>
</template>
