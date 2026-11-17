<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  noPadding?: boolean
}>()
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition-colors duration-300"
  >
    <div
      v-if="title || $slots.header || $slots.actions"
      class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800"
    >
      <div>
        <h3 v-if="title" class="text-sm font-semibold text-slate-800">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div :class="noPadding ? '' : 'p-5'">
      <slot />
    </div>
  </div>
</template>
