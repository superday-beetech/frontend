<script setup lang="ts">
import { watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { createEditorExtensions } from '@/shared/components/ui/editor/editor.extensions'
import type { EditorFeature } from '@/shared/components/ui/editor/editor.types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    features?: EditorFeature[]
    editable?: boolean
    minHeight?: number
  }>(),
  {
    modelValue: '',
    placeholder: 'Mulai menulis...',
    features: () => [],
    editable: true,
    minHeight: 120,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
  transaction: []
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,

  extensions: createEditorExtensions(props.features, props.placeholder),

  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },

  onTransaction: () => {
    emit('transaction')
  },

  onFocus: () => emit('focus'),

  onBlur: () => emit('blur'),
})

// Sinkronisasi perubahan dari parent ke editor.
watch(
  () => props.modelValue,
  (value) => {
    const instance = editor.value

    if (!instance) return

    const content = value || ''

    if (content === instance.getHTML()) return

    instance.commands.setContent(content, {
      emitUpdate: false,
    })
  }
)

// Sinkronisasi status editable.
watch(
  () => props.editable,
  (value) => {
    editor.value?.setEditable(value)
  }
)

defineExpose({
  editor,
})
</script>

<template>
  <div
    class="base-rich-editor"
    :style="{
      '--editor-min-height': `${minHeight}px`,
    }"
  >
    <template v-if="editor">
      <slot name="toolbar" :editor="editor" />

      <EditorContent :editor="editor" class="editor-content" />
    </template>

    <div v-else class="editor-loading">Memuat editor...</div>
  </div>
</template>

<style scoped>
.base-rich-editor {
  width: 100%;
  min-width: 0;
  background: transparent;
}

.editor-content {
  width: 100%;
}

.editor-content :deep(.tiptap) {
  min-height: var(--editor-min-height, 180px);
  padding: 16px 18px;
  outline: none;
  color: var(--color-text, #344054);
  font-size: 14px;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.editor-content :deep(.tiptap > *:first-child) {
  margin-top: 0;
}

.editor-content :deep(.tiptap > *:last-child) {
  margin-bottom: 0;
}

.editor-content :deep(.tiptap p) {
  margin: 0 0 10px;
}

.editor-content :deep(.tiptap h1),
.editor-content :deep(.tiptap h2),
.editor-content :deep(.tiptap h3) {
  margin: 20px 0 10px;
  color: var(--color-text, #101828);
  font-weight: 650;
  line-height: 1.3;
}

.editor-content :deep(.tiptap h1) {
  font-size: 1.75rem;
}

.editor-content :deep(.tiptap h2) {
  font-size: 1.4rem;
}

.editor-content :deep(.tiptap h3) {
  font-size: 1.15rem;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 24px;
  margin: 10px 0;
}

.editor-content :deep(.tiptap ul) {
  list-style: disc;
}

.editor-content :deep(.tiptap ol) {
  list-style: decimal;
}

.editor-content :deep(.tiptap li) {
  padding-left: 3px;
  margin: 3px 0;
}

.editor-content :deep(.tiptap li p) {
  margin: 0;
}

.editor-content :deep(.tiptap blockquote) {
  margin: 14px 0;
  padding: 9px 15px;
  border-left: 3px solid var(--color-primary, #6366f1);
  border-radius: 0 5px 5px 0;
  color: var(--color-text-secondary, #667085);
  background: var(--color-surface-muted, #f9fafb);
}

.editor-content :deep(.tiptap code) {
  padding: 2px 5px;
  border-radius: 4px;
  color: var(--color-code, #b42318);
  background: var(--color-code-bg, #f2f4f7);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
}

.editor-content :deep(.tiptap pre) {
  overflow-x: auto;
  margin: 14px 0;
  padding: 14px 16px;
  border: 1px solid var(--color-border, #eaecf0);
  border-radius: 8px;
  color: #e4e7ec;
  background: #101828;
}

.editor-content :deep(.tiptap pre code) {
  padding: 0;
  color: inherit;
  background: transparent;
  font-size: 13px;
}

.editor-content :deep(.tiptap a) {
  color: var(--color-primary, #4f46e5);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.editor-content :deep(.tiptap hr) {
  margin: 18px 0;
  border: 0;
  border-top: 1px solid var(--color-border, #d0d5dd);
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  float: left;
  height: 0;
  color: var(--color-placeholder, #98a2b3);
  content: attr(data-placeholder);
  pointer-events: none;
}

.editor-loading {
  min-height: var(--editor-min-height, 180px);
  padding: 16px 18px;
  color: var(--color-text-secondary, #98a2b3);
  font-size: 13px;
}

/* Dark mode */
:global(.dark) .editor-content :deep(.tiptap) {
  color: var(--color-text, #d0d5dd);
}

:global(.dark) .editor-content :deep(.tiptap h1),
:global(.dark) .editor-content :deep(.tiptap h2),
:global(.dark) .editor-content :deep(.tiptap h3) {
  color: var(--color-text, #f2f4f7);
}

:global(.dark) .editor-content :deep(.tiptap blockquote) {
  color: var(--color-text-secondary, #98a2b3);
  background: var(--color-surface-muted, #1d2939);
}

:global(.dark) .editor-content :deep(.tiptap code) {
  color: #fda29b;
  background: #344054;
}

:global(.dark) .editor-content :deep(.tiptap hr) {
  border-color: var(--color-border, #344054);
}
</style>
