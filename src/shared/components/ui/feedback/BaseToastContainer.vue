<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/shared/composables/useToast'

const { toasts, remove } = useToast()

const styles = {
  success: { border: 'border-emerald-200', icon: CheckCircle2, color: 'text-emerald-600' },
  error: { border: 'border-rose-200', icon: XCircle, color: 'text-rose-600' },
  warning: { border: 'border-amber-200', icon: AlertTriangle, color: 'text-amber-600' },
  info: { border: 'border-blue-200', icon: Info, color: 'text-blue-600' },
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-60 flex w-80 flex-col gap-2" role="status" aria-live="polite">
      <div
        v-for="item in toasts"
        :key="item.id"
        class="flex items-start gap-2.5 rounded-xl border bg-white p-3.5 shadow-lg transition-all"
        :class="styles[item.type].border"
      >
        <component :is="styles[item.type].icon" class="w-4 h-4 shrink-0 mt-0.5" :class="styles[item.type].color" />
        <div class="flex-1 text-xs">
          <div class="font-semibold text-slate-800">{{ item.title }}</div>
          <p v-if="item.message" class="mt-0.5 text-slate-500">{{ item.message }}</p>
        </div>
        <button type="button" @click="remove(item.id)" class="text-slate-400 hover:text-slate-600 cursor-pointer">
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
