<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
      {{ label }}
    </label>

    <!-- Wrapper Editor dengan Styling Tailwind & Dark Mode -->
    <div
      class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs focus-within:border-primary-500 transition-colors"
    >
      <QuillEditor
        :content="modelValue"
        contentType="html"
        :placeholder="placeholder || 'Tulis catatan atau deskripsi di sini...'"
        @update:content="$emit('update:modelValue', $event)"
        theme="snow"
        class="text-xs text-slate-800 dark:text-slate-100"
      />
    </div>
  </div>
</template>

<style>
/* Penyesuaian Tema Quill dengan Tailwind & Dark Mode */
.ql-toolbar.ql-snow {
  border: none !important;
  border-bottom: 1px solid var(--color-slate-200, #e2e8f0) !important;
  background-color: var(--color-slate-50, #f8fafc);
  padding: 8px !important;
}
.dark .ql-toolbar.ql-snow {
  border-bottom-color: var(--color-slate-800, #1e293b) !important;
  background-color: var(--color-slate-900, #0f172a);
}
.dark .ql-toolbar.ql-snow .ql-stroke {
  stroke: #cbd5e1 !important;
}
.dark .ql-toolbar.ql-snow .ql-fill {
  fill: #cbd5e1 !important;
}
.dark .ql-toolbar.ql-snow .ql-picker {
  color: #cbd5e1 !important;
}
.ql-container.ql-snow {
  border: none !important;
  min-height: 120px;
  font-family: inherit;
}
.ql-editor.ql-blank::before {
  color: #94a3b8;
  font-style: normal;
}
</style>
