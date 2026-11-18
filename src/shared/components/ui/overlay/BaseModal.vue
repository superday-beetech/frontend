<script setup lang="ts">
import { watch, onUnmounted, computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  scrollable?: boolean
}>(), {
  maxWidth: 'md',
  centered: true,
  scrollable: true,
})

const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(() => props.open, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
}, { immediate: true })

onUnmounted(() => document.removeEventListener('keydown', onKeydown))

const widthClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
}[props.maxWidth]))

const panelClass = computed(() => [
  widthClass.value,
  props.maxWidth === 'full' ? 'h-[95vh]' : 'max-h-[90vh]',
  props.centered ? 'my-auto' : 'mt-8 mb-4',
])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      class="fixed inset-0 flex overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[1px]"
      :style="{ zIndex: 10000 }"
      :class="props.centered ? 'items-center' : 'items-start'"
      @click.self="emit('close')"
    >
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="props.title"
        class="mx-auto flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        :class="panelClass"
      >
        <header class="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">{{ props.title }}</h2>
          <button
            type="button"
            aria-label="Tutup"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            @click="emit('close')"
          >
            <X class="h-4 w-4" />
          </button>
        </header>

        <div class="min-h-0 flex-1" :class="props.scrollable ? 'overflow-y-auto smooth-scroll' : 'overflow-visible'">
          <div class="p-5">
            <slot />
          </div>
        </div>

        <footer
          v-if="$slots.footer"
          class="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>
