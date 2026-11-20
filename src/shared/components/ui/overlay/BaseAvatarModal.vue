<script setup lang="ts">
import { ref, watch } from 'vue'
// Tambahkan Loader2 untuk ikon loading
import { X, Upload, Check, Camera, ZoomIn, Square, Circle, Move, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  currentAvatar?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [croppedDataUrl: string]
}>()

const selectedImage = ref<string | null>(null)
const zoomLevel = ref(1)
const cropShape = ref<'circle' | 'square'>('circle')
const fileInputRef = ref<HTMLInputElement | null>(null)

// State untuk posisi geser (pan / drag) foto
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

// --- STATE BARU UNTUK LOADING ---
const isUploading = ref(false)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      // Reset state saat ditutup
      isUploading.value = false
    }
  }
)

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    // Aktifkan loading saat file sedang dibaca
    isUploading.value = true

    const reader = new FileReader()
    reader.onload = (event) => {
      // Beri sedikit delay artifisial agar transisi terlihat halus (bisa dihapus)
      setTimeout(() => {
        selectedImage.value = event.target?.result as string
        zoomLevel.value = 1
        translateX.value = 0
        translateY.value = 0
        isUploading.value = false // Matikan loading
      }, 500)
    }
    // Handle jika gagal baca
    reader.onerror = () => {
      isUploading.value = false
      alert('Gagal membaca file gambar.')
    }
    reader.readAsDataURL(file)
  }
}

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
  startX.value = clientX - translateX.value
  startY.value = clientY - translateY.value
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
  translateX.value = clientX - startX.value
  translateY.value = clientY - startY.value
}

function stopDrag() {
  isDragging.value = false
}
function closeModal() {
  if (!isUploading.value) {
    emit('update:modelValue', false)
  }
}
// Update fungsi handleSave agar ada loading saat menyimpan
function handleSave() {
  if (selectedImage.value || props.currentAvatar) {
    isUploading.value = true
    // Simulasi proses kompresi/save selama 800ms
    setTimeout(() => {
      emit('save', selectedImage.value || props.currentAvatar || '')
      isUploading.value = false
      closeModal()
    }, 800)
  }
}
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
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">Ubah Foto Profil & Avatar</h3>
              <p class="text-xs text-slate-500">Geser (drag) foto ke segala arah untuk menyesuaikan posisi</p>
            </div>
            <button
              @click="closeModal"
              type="button"
              :disabled="isUploading"
              class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Area Preview & Kontrol Interaktif -->
          <div class="flex flex-col items-center justify-center space-y-4">
            <!-- Toggle Bentuk -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                @click="cropShape = 'circle'"
                :disabled="isUploading"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                :class="cropShape === 'circle' ? 'bg-white text-primary-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              >
                <Circle class="w-3.5 h-3.5" />
                Lingkaran
              </button>
              <button
                @click="cropShape = 'square'"
                :disabled="isUploading"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                :class="cropShape === 'square' ? 'bg-white text-primary-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
              >
                <Square class="w-3.5 h-3.5" />
                Kotak (Square)
              </button>
            </div>

            <!-- Box Preview Utama -->
            <div
              class="relative group h-40 w-40 overflow-hidden border-4 border-primary-100 bg-slate-900 shadow-inner flex items-center justify-center select-none"
              :class="[
                cropShape === 'circle' ? 'rounded-full' : 'rounded-2xl',
                isUploading ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing',
              ]"
              @mousedown="!isUploading && startDrag($event)"
              @mousemove="!isUploading && onDrag($event)"
              @mouseup="!isUploading && stopDrag()"
              @mouseleave="!isUploading && stopDrag()"
              @touchstart="!isUploading && startDrag($event)"
              @touchmove="!isUploading && onDrag($event)"
              @touchend="!isUploading && stopDrag()"
            >
              <!-- OVERLAY LOADING -->
              <div
                v-if="isUploading"
                class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm transition-opacity"
              >
                <Loader2 class="w-8 h-8 text-primary-400 animate-spin mb-2" />
                <span class="text-[10px] font-medium text-white animate-pulse">Memproses...</span>
              </div>

              <img
                v-if="selectedImage || currentAvatar"
                :src="selectedImage || currentAvatar"
                :style="{
                  transform: `scale(${zoomLevel}) translate(${translateX / zoomLevel}px, ${translateY / zoomLevel}px)`,
                }"
                alt="Avatar Preview"
                class="h-full w-full object-cover pointer-events-none transition-transform duration-75"
              />
              <div v-else class="flex flex-col items-center text-slate-400 space-y-1">
                <Camera class="w-8 h-8" />
                <span class="text-[10px] font-medium">Belum ada foto</span>
              </div>

              <!-- Petunjuk Geser -->
              <div
                v-if="!isUploading"
                class="absolute inset-x-0 bottom-2 text-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <span
                  class="inline-flex items-center gap-1 bg-slate-900/70 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs"
                >
                  <Move class="w-3 h-3" />
                  Geser Foto
                </span>
              </div>
            </div>

            <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

            <!-- Tombol Ganti & Zoom -->
            <div class="w-full space-y-3 px-4">
              <div class="flex items-center justify-between">
                <button
                  @click="fileInputRef?.click()"
                  :disabled="isUploading"
                  type="button"
                  class="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  <Upload class="w-3.5 h-3.5" />
                  Pilih Foto Lain
                </button>
                <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <ZoomIn class="w-3.5 h-3.5" />
                  Zoom: {{ zoomLevel.toFixed(1) }}x
                </div>
              </div>
              <input
                v-model.number="zoomLevel"
                :disabled="isUploading"
                type="range"
                min="1"
                max="3"
                step="0.1"
                class="w-full accent-primary-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              @click="closeModal"
              :disabled="isUploading"
              type="button"
              class="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              @click="handleSave"
              :disabled="isUploading"
              type="button"
              class="inline-flex items-center justify-center min-w-35 gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              <template v-if="isUploading">
                <Loader2 class="w-4 h-4 animate-spin" />
                Menyimpan...
              </template>
              <template v-else>
                <Check class="w-4 h-4" />
                Terapkan Avatar
              </template>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
