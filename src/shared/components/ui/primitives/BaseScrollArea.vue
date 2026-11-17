<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    maxHeight?: string
    axis?: 'y' | 'x' | 'both'
  }>(),
  {
    maxHeight: '18rem',
    axis: 'y',
  }
)

const containerRef = ref<HTMLElement | null>(null)

function scrollToTop() {
  containerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToBottom() {
  if (!containerRef.value) return
  containerRef.value.scrollTo({ top: containerRef.value.scrollHeight, behavior: 'smooth' })
}

defineExpose({ scrollToTop, scrollToBottom, el: containerRef })
</script>

<template>
  <div
    ref="containerRef"
    class="smooth-scroll"
    :class="{
      'overflow-y-auto overflow-x-hidden': axis === 'y',
      'overflow-x-auto overflow-y-hidden': axis === 'x',
      'overflow-auto': axis === 'both',
    }"
    :style="{ maxHeight }"
  >
    <slot />
  </div>
</template>
