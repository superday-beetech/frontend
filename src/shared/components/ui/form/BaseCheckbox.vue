<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <label class="inline-flex items-center gap-2 select-none cursor-pointer" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30 cursor-pointer"
    />
    <span v-if="label" class="text-xs font-medium text-slate-700">{{ label }}</span>
  </label>
</template>
