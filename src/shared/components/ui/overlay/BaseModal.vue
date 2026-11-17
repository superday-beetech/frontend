<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' // <-- Ditambah opsi "full"
}>()

const emit = defineEmits<{
  close: []
}>()

// Tutup dengan tombol Esc (hanya terpasang saat modal terbuka)
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const widthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw] h-[95vh] md:max-w-[90vw]', // <-- Ukuran lebar & tinggi penuh
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      @click.self="$emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        class="w-full rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col transition-all"
        :class="[widthClass[maxWidth || 'md'], maxWidth === 'full' ? 'h-[95vh]' : 'max-h-[90vh]']"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 shrink-0">
          <h3 class="text-sm font-semibold text-slate-800">{{ title }}</h3>
          <button
            type="button"
            aria-label="Tutup"
            @click="$emit('close')"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Content dengan Smooth Scroll -->
        <div class="p-5 flex-1 overflow-y-auto smooth-scroll">
          <slot />
        </div>

        <!-- Footer -->
        <div
          v-if="$slots.footer"
          class="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 rounded-b-xl shrink-0"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
