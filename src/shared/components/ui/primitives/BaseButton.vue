<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
  }
)

const variantClasses = computed(
  () =>
    ({
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/30',
      secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400/20',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/30',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400/20',
    })[props.variant]
)

const sizeClasses = computed(
  () =>
    ({
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    })[props.size]
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    :class="[variantClasses, sizeClasses]"
  >
    <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
    <slot />
  </button>
</template>
