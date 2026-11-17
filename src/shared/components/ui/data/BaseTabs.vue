<script setup lang="ts">
export interface TabItem {
  key: string
  label: string
  badge?: string | number
}

defineProps<{
  modelValue: string
  tabs: TabItem[]
}>()

defineEmits<{
  'update:modelValue': [key: string]
}>()
</script>

<template>
  <div class="border-b border-slate-200">
    <nav class="-mb-px flex gap-5 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="$emit('update:modelValue', tab.key)"
        class="inline-flex items-center gap-2 border-b-2 py-2.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
        :class="
          modelValue === tab.key
            ? 'border-primary-600 text-primary-600 font-semibold'
            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
        "
      >
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge !== undefined"
          class="rounded-full px-1.5 py-0.5 text-[10px]"
          :class="
            modelValue === tab.key
              ? 'bg-primary-100 text-primary-700'
              : 'bg-slate-100 text-slate-600'
          "
        >
          {{ tab.badge }}
        </span>
      </button>
    </nav>
  </div>
</template>
