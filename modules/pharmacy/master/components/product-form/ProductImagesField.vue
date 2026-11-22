<script setup lang="ts">
import { ImagePlus, Plus, Star, Trash2 } from 'lucide-vue-next'

interface ImageRow {
  id?: number
  url: string
  isPrimary: boolean
  uploading?: boolean
}

const props = defineProps<{
  images: ImageRow[]
  uploading: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  add: [file: File]
  remove: [index: number]
  setPrimary: [index: number]
}>()

function onSelect(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('add', file)
  input.value = ''
}
</script>

<template>
  <div>
    <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Foto Produk</label>

    <div class="flex flex-wrap gap-3">
      <div
        v-for="(img, index) in props.images"
        :key="index"
        class="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
      >
        <img :src="img.url" class="h-full w-full object-cover" alt="Foto produk" />

        <div v-if="img.uploading" class="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
        </div>

        <template v-else>
          <button
            type="button"
            class="absolute left-1 top-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            :class="img.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-700/70 text-white hover:bg-slate-800'"
            @click="emit('setPrimary', index)"
          >
            <Star class="h-3 w-3" />
            {{ img.isPrimary ? 'Utama' : 'Set Utama' }}
          </button>

          <button
            type="button"
            class="absolute right-1 top-1 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700"
            @click="emit('remove', index)"
          >
            <Trash2 class="h-3 w-3" />
          </button>
        </template>
      </div>

      <label
        class="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-400"
        :class="{ 'pointer-events-none opacity-50': props.uploading || props.disabled }"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          :disabled="props.uploading || props.disabled"
          @change="onSelect"
        />
        <Plus v-if="!props.uploading" class="h-5 w-5" />
        <ImagePlus v-if="!props.uploading" class="mt-1 h-5 w-5" />
        <span class="mt-1 text-xs">
          {{ props.uploading ? 'Mengunggah...' : 'Tambah Foto' }}
        </span>
      </label>
    </div>

    <p class="mt-2 text-xs text-slate-500">JPG/PNG/WEBP, maks 2MB. Foto pertama otomatis jadi utama.</p>
  </div>
</template>
