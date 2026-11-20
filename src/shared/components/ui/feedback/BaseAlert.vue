<script setup lang="ts">
import { computed } from 'vue'
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'danger'
    title?: string
  }>(),
  {
    variant: 'info',
  }
)

const config = computed(
  () =>
    ({
      info: { box: 'bg-blue-50 border-blue-200 text-blue-800', icon: Info },
      success: { box: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle2 },
      warning: { box: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle },
      danger: { box: 'bg-rose-50 border-rose-200 text-rose-800', icon: XCircle },
    })[props.variant]
)
</script>

<template>
  <div class="flex items-start gap-3 rounded-xl border p-3.5 text-xs" :class="config.box">
    <component :is="config.icon" class="w-4 h-4 shrink-0 mt-0.5" />
    <div class="flex-1">
      <div v-if="title" class="font-semibold mb-0.5">{{ title }}</div>
      <div class="leading-relaxed"><slot /></div>
    </div>
  </div>
</template>
