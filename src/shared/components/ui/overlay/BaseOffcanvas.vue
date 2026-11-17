<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  title?: string
  widthClass?: string // Opsional: untuk mengatur lebar panel, default max-w-sm
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs" @click="$emit('update:modelValue', false)">
        <!-- Panel Offcanvas (Muncul dari Kanan) -->
        <transition
          enter-active-class="transition duration-300 transform ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-200 transform ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            v-if="modelValue"
            class="absolute inset-y-0 right-0 w-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-colors duration-300"
            :class="widthClass || 'max-w-sm'"
            @click.stop
          >
            <!-- Header Offcanvas -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {{ title || 'Menu Panel' }}
              </h3>
              <button
                @click="$emit('update:modelValue', false)"
                type="button"
                class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Tutup Panel"
              >
                <X class="w-4.5 h-4.5" />
              </button>
            </div>

            <!-- Body Content (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6 smooth-scroll">
              <slot />
            </div>

            <!-- Footer Opsional (jika dibutuhkan untuk tombol Aksi/Simpan) -->
            <slot name="footer" />
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>
