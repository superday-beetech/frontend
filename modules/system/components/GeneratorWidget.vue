<script setup lang="ts">
import { ref } from 'vue'
import { Code, Copy, RefreshCw, Check } from 'lucide-vue-next'
import { generateCode, generateSKU, generateUUID } from '@/core/utils/generator'

const activeType = ref<'uuid' | 'trx' | 'sku'>('trx')
const generatedCode = ref(generateCode())
const customPrefix = ref('POS')
const copied = ref(false)

// Fungsi generate berdasarkan tipe
const handleGenerate = () => {
  if (activeType.value === 'uuid') {
    generatedCode.value = generateUUID()
  } else if (activeType.value === 'trx') {
    generatedCode.value = generateCode(customPrefix.value || 'TRX')
  } else if (activeType.value === 'sku') {
    generatedCode.value = generateSKU(customPrefix.value || 'MED')
  }
}

// Fungsi Salin ke Clipboard
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Gagal menyalin teks', err)
  }
}
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs transition-colors"
  >
    <!-- Header Widget -->
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
        >
          <Code class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Generator Kode Otomatis & UUID</h3>
      </div>
    </div>

    <!-- Pilihan Jenis Kode -->
    <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60">
      <button
        type="button"
        @click="((activeType = 'trx'), handleGenerate())"
        class="rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer"
        :class="
          activeType === 'trx'
            ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        "
      >
        Nota / POS
      </button>
      <button
        type="button"
        @click="((activeType = 'sku'), handleGenerate())"
        class="rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer"
        :class="
          activeType === 'sku'
            ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        "
      >
        SKU / Batch
      </button>
      <button
        type="button"
        @click="((activeType = 'uuid'), handleGenerate())"
        class="rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer"
        :class="
          activeType === 'uuid'
            ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-2xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        "
      >
        UUID v4
      </button>
    </div>

    <!-- Input Kustom Prefix (Opsional untuk TRX & SKU) -->
    <div v-if="activeType !== 'uuid'" class="space-y-1">
      <label class="text-[11px] font-semibold text-slate-500 uppercase">Prefix / Awalan Kode</label>
      <input
        v-model="customPrefix"
        @input="handleGenerate"
        type="text"
        placeholder="Contoh: PHARM, TRX, INV"
        class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500"
      />
    </div>

    <!-- Kotak Hasil Generate -->
    <div class="space-y-1.5">
      <label class="text-[11px] font-semibold text-slate-500 uppercase">Hasil Kode</label>
      <div class="flex items-center gap-2">
        <div
          class="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-800 dark:text-primary-300 tracking-wide select-all overflow-x-auto"
        >
          {{ generatedCode }}
        </div>

        <!-- Tombol Generate Ulang -->
        <button
          type="button"
          @click="handleGenerate"
          title="Buat Kode Baru"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw class="w-4 h-4" />
        </button>

        <!-- Tombol Salin -->
        <button
          type="button"
          @click="copyToClipboard"
          class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary-600/25 hover:bg-primary-700 transition-all cursor-pointer shrink-0"
        >
          <component :is="copied ? Check : Copy" class="w-4 h-4" />
          <span>{{ copied ? 'Tersalin!' : 'Salin' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
