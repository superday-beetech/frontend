<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Code,
  FileCode,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-vue-next'

import BaseRichEditor from './BaseRichEditor.vue'
import { DEFAULT_EDITOR_FEATURES, type EditorFeature, type EditorToolbarItem } from './editor.types.ts'
import { getEditorToolbar } from './editor.toolbar.ts'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    features?: EditorFeature[]
    disabled?: boolean
    minHeight?: number
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: 'Mulai menulis...',
    features: () => [...DEFAULT_EDITOR_FEATURES],
    disabled: false,
    minHeight: 180,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const revision = ref(0)

const toolbar = computed(() => getEditorToolbar(props.features))

const icons: Record<string, Component> = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strike: Strikethrough,
  heading1: Heading1,
  h1: Heading1,
  heading2: Heading2,
  h2: Heading2,
  heading3: Heading3,
  h3: Heading3,
  bulletlist: List,
  orderedlist: ListOrdered,
  blockquote: Quote,
  link: Link,
  code: Code,
  codeblock: FileCode,
  horizontalrule: Minus,
  undo: Undo2,
  redo: Redo2,
}

function iconFor(item: EditorToolbarItem): Component {
  const name = item.name.toLowerCase().replace(/[-_\s]/g, '')
  return icons[name] ?? icons[item.feature] ?? Bold
}

function groupFor(feature: EditorFeature): string {
  if (['bold', 'italic', 'underline', 'strike'].includes(feature)) {
    return 'text'
  }

  if (['heading', 'bulletList', 'orderedList', 'blockquote'].includes(feature)) {
    return 'block'
  }

  if (['link', 'code', 'codeBlock', 'horizontalRule'].includes(feature)) {
    return 'insert'
  }

  return 'history'
}

function isGroupStart(index: number): boolean {
  if (index === 0) return false

  return groupFor(toolbar.value[index].feature) !== groupFor(toolbar.value[index - 1].feature)
}

function isActive(item: EditorToolbarItem, editor: any): boolean {
  void revision.value
  return item.isActive?.(editor) ?? false
}

function isDisabled(item: EditorToolbarItem, editor: any): boolean {
  return item.isDisabled?.(editor) ?? false
}

function run(item: EditorToolbarItem, editor: any): void {
  if (props.disabled || isDisabled(item, editor)) return
  item.action(editor)
}
</script>

<template>
  <div class="rich-editor-field">
    <label v-if="label" class="rich-editor-label">
      {{ label }}
    </label>

    <div class="rich-editor-shell" :class="{ 'is-disabled': disabled }">
      <BaseRichEditor
        :model-value="modelValue"
        :placeholder="placeholder"
        :features="features"
        :editable="!disabled"
        :min-height="minHeight"
        @update:model-value="emit('update:modelValue', $event)"
        @focus="emit('focus')"
        @blur="emit('blur')"
        @transaction="revision++"
      >
        <template #toolbar="{ editor }">
          <div v-if="!disabled && toolbar.length" class="rich-editor-toolbar" role="toolbar" aria-label="Format teks">
            <button
              v-for="(item, index) in toolbar"
              :key="item.name"
              type="button"
              class="toolbar-button"
              :class="{
                'is-active': isActive(item, editor),
                'toolbar-group-start': isGroupStart(index),
              }"
              :title="item.label"
              :aria-label="item.label"
              :aria-pressed="isActive(item, editor)"
              :disabled="isDisabled(item, editor)"
              @mousedown.prevent
              @click.prevent="run(item, editor)"
            >
              <component :is="iconFor(item)" :size="17" :stroke-width="2" />
            </button>
          </div>
        </template>
      </BaseRichEditor>
    </div>
  </div>
</template>

<style scoped>
.rich-editor-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.rich-editor-label {
  color: var(--color-text, #344054);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.rich-editor-shell {
  overflow: hidden;
  border: 1px solid var(--color-border, #d0d5dd);
  border-radius: 10px;
  background: var(--color-surface, #fff);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.rich-editor-shell:focus-within {
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #6366f1) 13%, transparent);
}

.rich-editor-shell.is-disabled {
  background: var(--color-surface-muted, #f9fafb);
  cursor: not-allowed;
}

.rich-editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  min-height: 43px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border, #eaecf0);
  background: var(--color-toolbar, #f9fafb);
}

.toolbar-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 30px;
  flex: 0 0 auto;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--color-text-secondary, #667085);
  background: transparent;
  cursor: pointer;
  transition:
    color 140ms ease,
    background 140ms ease,
    border-color 140ms ease;
}

.toolbar-button:hover:not(:disabled) {
  color: var(--color-text, #344054);
  background: var(--color-hover, #eaecf0);
}

.toolbar-button.is-active {
  color: var(--color-primary, #4f46e5);
  border-color: color-mix(in srgb, var(--color-primary, #4f46e5) 20%, transparent);
  background: color-mix(in srgb, var(--color-primary, #4f46e5) 10%, transparent);
}

.toolbar-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.toolbar-group-start {
  margin-left: 7px;
}

.toolbar-group-start::before {
  position: absolute;
  left: -7px;
  width: 1px;
  height: 19px;
  background: var(--color-border, #d0d5dd);
  content: '';
}

@media (max-width: 480px) {
  .rich-editor-toolbar {
    gap: 2px;
    padding-inline: 6px;
  }

  .toolbar-button {
    width: 29px;
    height: 29px;
  }

  .toolbar-group-start {
    margin-left: 4px;
  }

  .toolbar-group-start::before {
    left: -4px;
  }
}
</style>
