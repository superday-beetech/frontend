<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
}>()
</script>

<template>
  <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <nav v-if="breadcrumbs?.length" class="mb-1 flex items-center gap-1 text-xs text-slate-400">
        <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
          <ChevronRight v-if="idx > 0" class="w-3 h-3 text-slate-300" />
          <RouterLink v-if="crumb.to" :to="crumb.to" class="hover:text-primary-600 transition-colors">
            {{ crumb.label }}
          </RouterLink>
          <span v-else class="font-medium text-slate-600">{{ crumb.label }}</span>
        </template>
      </nav>
      <h1 class="text-lg font-bold text-slate-900">{{ title }}</h1>
      <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
    </div>

    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
