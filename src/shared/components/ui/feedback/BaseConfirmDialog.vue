<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { useConfirm } from '@/shared/composables/useConfirm'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'

const { isOpen, options, resolveConfirm } = useConfirm()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') resolveConfirm(false)
}

watch(
  isOpen,
  (open) => {
    if (open) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/50 p-4" @click.self="resolveConfirm(false)">
      <div role="alertdialog" aria-modal="true" :aria-label="options.title" class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="flex items-start gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            :class="options.variant === 'primary' ? 'bg-primary-50 text-primary-600' : 'bg-rose-50 text-rose-600'"
          >
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-800">{{ options.title }}</h3>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">{{ options.message }}</p>
          </div>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <BaseButton variant="secondary" size="sm" @click="resolveConfirm(false)">
            {{ options.cancelText }}
          </BaseButton>
          <BaseButton :variant="options.variant || 'danger'" size="sm" @click="resolveConfirm(true)">
            {{ options.confirmText }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
