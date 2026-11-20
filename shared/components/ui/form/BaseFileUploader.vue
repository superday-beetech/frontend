<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UploadCloud, X, FileText, FileArchive, FileSpreadsheet, Maximize2, AlertCircle, File } from 'lucide-vue-next'
import localforage from 'localforage'

const props = defineProps<{
  modelValue: File[]
  label?: string
  accept?: string
  maxSizeMB?: number
  storageKey?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: File[]]
}>()

const isDragging = ref(false)
const isProcessing = ref(false)
const objectUrls = new Map<File, string>()
const previewImage = ref<string | null>(null)

const dbKey = props.storageKey || 'default_advanced_uploader'

onMounted(async () => {
  try {
    const savedFiles = await localforage.getItem<File[]>(dbKey)
    if (savedFiles && savedFiles.length > 0) {
      emit('update:modelValue', savedFiles)
    }
  } catch (err) {
    console.error('Gagal memuat file dari IndexedDB:', err)
  }
})

onUnmounted(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  objectUrls.clear()
})

// --- HELPERS ---

function getPreviewUrl(file: File): string {
  if (!objectUrls.has(file)) {
    objectUrls.set(file, URL.createObjectURL(file))
  }
  return objectUrls.get(file)!
}

function isImage(file: File) {
  return file.type.startsWith('image/')
}

// Mendapatkan Ekstensi File (PDF, PNG, dll)
function getExtension(filename: string) {
  return filename.split('.').pop()?.toUpperCase() || 'FILE'
}

// Menentukan Ikon berdasarkan Tipe File
function getFileIcon(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return FileText
  if (['doc', 'docx'].includes(ext)) return FileText
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
  if (['zip', 'rar', '7z'].includes(ext)) return FileArchive
  return File
}

// Menentukan Warna Badge berdasarkan Tipe File
function getFileColor(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return 'bg-rose-50 text-rose-600 border-rose-200'
  if (['doc', 'docx'].includes(ext)) return 'bg-blue-50 text-blue-600 border-blue-200'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'bg-emerald-50 text-emerald-600 border-emerald-200'
  if (['zip', 'rar', '7z'].includes(ext)) return 'bg-amber-50 text-amber-600 border-amber-200'
  if (isImage(file)) return 'bg-indigo-50 text-indigo-600 border-indigo-200'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

// Format Ukuran Dinamis (B, KB, MB, GB)
function formatSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Cek apakah file melebihi batas
function isOversize(file: File) {
  const limit = (props.maxSizeMB || 10) * 1024 * 1024
  return file.size > limit
}

// --- LOGIC ---

async function saveToDB(files: File[]) {
  try {
    if (files.length === 0) await localforage.removeItem(dbKey)
    else await localforage.setItem(dbKey, files)
  } catch (err) {
    console.error('Gagal menyimpan file ke IndexedDB:', err)
  }
}

function processFiles(newFiles: File[]) {
  if (newFiles.length === 0) return
  isProcessing.value = true

  setTimeout(async () => {
    const updatedFiles = [...props.modelValue, ...newFiles]
    emit('update:modelValue', updatedFiles)
    await saveToDB(updatedFiles)
    isProcessing.value = false
  }, 1000)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    processFiles(Array.from(e.dataTransfer.files))
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
    target.value = ''
  }
}

async function removeFile(index: number) {
  if (isProcessing.value) return
  const updated = [...props.modelValue]
  const fileToRemove = updated[index]

  if (fileToRemove) {
    if (objectUrls.has(fileToRemove)) {
      URL.revokeObjectURL(objectUrls.get(fileToRemove)!)
      objectUrls.delete(fileToRemove)
    }
    updated.splice(index, 1)
  }

  emit('update:modelValue', updated)
  await saveToDB(updated)
}

function openLightbox(file: File) {
  if (isImage(file)) {
    previewImage.value = getPreviewUrl(file)
  }
}

function closeLightbox() {
  previewImage.value = null
}
</script>

<template>
  <div class="space-y-4 font-sans">
    <label v-if="label" class="block text-sm font-semibold text-slate-700">{{ label }}</label>

    <!-- DROPZONE ADVANCED -->
    <div
      @dragover.prevent="!isProcessing && (isDragging = true)"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="!isProcessing && handleDrop($event)"
      class="relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 overflow-hidden group"
      :class="[
        isDragging
          ? 'border-primary-500 bg-primary-50 shadow-inner scale-[0.99]'
          : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-slate-100',
        isProcessing ? 'opacity-80 cursor-wait pointer-events-none' : 'cursor-pointer',
      ]"
    >
      <input
        type="file"
        multiple
        :accept="accept || 'image/*, .pdf, .doc, .docx, .xls, .xlsx, .zip'"
        @change="handleFileSelect"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        :disabled="isProcessing"
      />

      <div class="flex flex-col items-center justify-center space-y-3 pointer-events-none">
        <!-- Ikon Animasi -->
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500 shadow-sm"
          :class="
            isDragging
              ? 'bg-primary-500 text-white scale-110 shadow-primary-500/40'
              : 'bg-white text-primary-600 group-hover:scale-110 group-hover:shadow-md'
          "
        >
          <UploadCloud v-if="!isProcessing" class="w-8 h-8" />
          <svg v-else class="w-8 h-8 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <div class="text-sm font-bold text-slate-800">
          <template v-if="isProcessing">Memproses file...</template>
          <template v-else>
            <span class="text-primary-600">Klik untuk upload</span>
            atau drag & drop
          </template>
        </div>
        <p class="text-xs text-slate-400 font-medium max-w-sm mx-auto">
          Mendukung format
          <span class="font-bold text-slate-500">PNG, JPG, WEBP, PDF, DOCX, XLSX, ZIP</span>
          (Maksimal {{ maxSizeMB || 10 }}MB per file)
        </p>
      </div>

      <!-- Progress Bar Animasi -->
      <div v-if="isProcessing" class="absolute bottom-0 left-0 w-full h-1 bg-slate-200">
        <div
          class="h-full bg-primary-500 animate-pulse w-full origin-left scale-x-100"
          style="animation: progress 1s ease-in-out infinite"
        ></div>
      </div>
    </div>

    <!-- LIST FILE (CARD STYLE) -->
    <div v-if="modelValue.length > 0" class="space-y-3 mt-4">
      <div
        v-for="(file, idx) in modelValue"
        :key="idx"
        class="group relative flex items-center justify-between rounded-2xl border bg-white pr-4 p-2.5 shadow-sm hover:shadow-md transition-all duration-200"
        :class="isOversize(file) ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'"
      >
        <div class="flex items-center gap-4">
          <!-- Thumbnail / Icon Box -->
          <div
            class="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border transition-all"
            :class="[isImage(file) ? 'border-slate-200 cursor-pointer' : getFileColor(file)]"
            @click="openLightbox(file)"
          >
            <template v-if="isImage(file)">
              <img :src="getPreviewUrl(file)" :alt="file.name" class="h-full w-full object-cover" />
              <div
                class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <Maximize2 class="w-5 h-5 text-white" />
              </div>
            </template>
            <template v-else>
              <component :is="getFileIcon(file)" class="w-7 h-7" />
            </template>
          </div>

          <!-- File Info -->
          <div class="min-w-0 flex flex-col justify-center">
            <div class="flex items-center gap-2">
              <!-- Badge Ekstensi -->
              <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border" :class="getFileColor(file)">
                {{ getExtension(file.name) }}
              </span>

              <div
                class="text-sm font-semibold text-slate-800 line-clamp-1 truncate pr-2"
                :class="isImage(file) ? 'cursor-pointer hover:text-primary-600 transition-colors' : ''"
                @click="openLightbox(file)"
              >
                {{ file.name }}
              </div>
            </div>

            <div class="flex items-center gap-2 mt-1 text-xs">
              <span class="text-slate-500 font-medium">{{ formatSize(file.size) }}</span>
              <!-- Peringatan Ukuran -->
              <span v-if="isOversize(file)" class="flex items-center gap-1 text-rose-600 font-semibold bg-rose-100 px-1.5 py-0.5 rounded">
                <AlertCircle class="w-3 h-3" />
                Melebihi batas
              </span>
            </div>
          </div>
        </div>

        <!-- Tombol Hapus -->
        <button
          @click.prevent="removeFile(idx)"
          :disabled="isProcessing"
          type="button"
          class="rounded-xl p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 cursor-pointer transition-all duration-200 disabled:opacity-50"
          title="Hapus file"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- MODAL LIGHTBOX PREMIUM -->
    <teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 backdrop-blur-none"
        enter-to-class="opacity-100 scale-100 backdrop-blur-md"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 backdrop-blur-md"
        leave-to-class="opacity-0 scale-95 backdrop-blur-none"
      >
        <div
          v-if="previewImage"
          class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8 bg-slate-950/90 cursor-zoom-out"
          @click="closeLightbox"
        >
          <!-- Tombol Close Melayang -->
          <button
            @click.stop="closeLightbox"
            class="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-rose-500 hover:scale-110 transition-all backdrop-blur-md z-10"
          >
            <X class="w-6 h-6" />
          </button>

          <!-- Gambar Asli (Prevent click event bubbling) -->
          <div class="relative max-h-full max-w-full flex items-center justify-center cursor-default" @click.stop>
            <img
              :src="previewImage"
              class="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl ring-1 ring-white/20"
              alt="Preview Penuh"
            />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
@keyframes progress {
  0% {
    transform: scaleX(0);
    opacity: 1;
  }
  50% {
    transform: scaleX(0.7);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 0;
  }
}
</style>
