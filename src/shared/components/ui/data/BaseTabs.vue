<template>
  <!-- Pembungkus utama: flex-col agar header tab dan konten tidak tumpang tindih -->
  <div class="flex flex-col w-full h-full min-h-0">
    <!-- 1. HEADER TAB (Tinggi tetap, tidak bisa mengecil) -->
    <div class="shrink-0 border-b border-slate-200 dark:border-slate-800">
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
          <!-- Slot Ikon -->
          <slot name="icon" :tab="tab" />

          <span>{{ tab.label }}</span>
          <span
            v-if="tab.badge !== undefined"
            class="rounded-full px-1.5 py-0.5 text-[10px]"
            :class="modelValue === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'"
          >
            {{ tab.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- 2. KONTEN TAB (Slot Utama) -->
    <!-- Bagian ini yang sebelumnya HILANG. Tanpa ini, konten Anda tidak akan muncul. -->
    <div class="flex-1 min-h-0 overflow-y-auto mt-2 relative">
      <slot></slot>
    </div>
  </div>
</template>

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
