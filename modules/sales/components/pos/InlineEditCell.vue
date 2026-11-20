<script setup lang="ts">
import { nextTick, ref } from 'vue'

/**
 * Sel tabel dengan mode "tampil" (tombol) dan mode "edit" (slot editor).
 * Parent memegang state `editing`; komponen ini mengurus fokus, focusout, Enter, dan Esc.
 */
const props = withDefaults(
  defineProps<{
    editing: boolean
    disabled?: boolean
    align?: 'center' | 'end'
  }>(),
  { align: 'end' }
)

const emit = defineEmits<{
  start: []
  stop: []
}>()

const displayBtn = ref<HTMLButtonElement | null>(null)
const editorRoot = ref<HTMLElement | null>(null)

// True selama tombol mouse sedang ditekan di dalam editor.
// Mencegah edit tertutup saat klik tombol (+/-) yang tidak mendapat fokus di Safari.
let pointerInside = false

function focusEditorInput() {
  const input = editorRoot.value?.querySelector<HTMLInputElement>('input')
  if (!input) return
  input.focus()
  input.select?.()
}

async function onStart() {
  if (props.disabled) return
  emit('start')
  await nextTick()
  focusEditorInput()
}

function onPointerDown() {
  pointerInside = true
  window.addEventListener(
    'mouseup',
    () => {
      // Tunda sampai event click selesai diproses
      setTimeout(() => {
        pointerInside = false
        const active = document.activeElement
        if (props.editing && editorRoot.value && !editorRoot.value.contains(active)) {
          focusEditorInput()
        }
      }, 0)
    },
    { once: true }
  )
}

function onFocusOut(event: FocusEvent) {
  if (pointerInside) return
  const wrapper = event.currentTarget as HTMLElement
  const next = event.relatedTarget as Node | null
  // Fokus masih di dalam sel (mis. pindah dari input ke tombol dropdown)
  if (next && wrapper.contains(next)) return
  emit('stop')
}

async function onKeyStop() {
  emit('stop')
  await nextTick()
  // Kembalikan fokus ke tombol agar navigasi keyboard tetap berlanjut
  displayBtn.value?.focus()
}
</script>

<template>
  <button
    v-if="!editing"
    ref="displayBtn"
    type="button"
    class="-mx-1 flex w-[calc(100%+0.5rem)] cursor-text items-center gap-1 rounded px-1 py-1 text-left hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary-500 disabled:cursor-default dark:hover:bg-slate-800"
    :class="align === 'center' ? 'justify-center' : 'justify-end'"
    :disabled="disabled"
    @click="onStart"
  >
    <slot name="display" />
  </button>

  <div
    v-else
    ref="editorRoot"
    class="w-full"
    @mousedown="onPointerDown"
    @focusout="onFocusOut"
    @keydown.enter="onKeyStop"
    @keydown.esc="onKeyStop"
  >
    <slot name="editor" />
  </div>
</template>
