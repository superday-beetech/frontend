<script setup lang="ts">
import PosIcon from './PosIcon.vue'

const props = defineProps<{
  modelValue: number | string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Fungsi untuk menangani ketikan
function handlePress(val: string) {
  if (props.disabled) return

  let currentVal = String(props.modelValue)
  if (currentVal === '0') currentVal = '' // Hapus 0 di depan jika mulai mengetik angka baru

  let newVal = currentVal + val

  // Konversi kembali ke angka
  emit('update:modelValue', Number(newVal))
}

// Fungsi Hapus (Backspace)
function handleBackspace() {
  if (props.disabled) return
  let currentVal = String(props.modelValue)
  currentVal = currentVal.slice(0, -1)
  emit('update:modelValue', currentVal ? Number(currentVal) : 0)
}

// Fungsi Clear
function handleClear() {
  if (props.disabled) return
  emit('update:modelValue', 0)
}
</script>

<template>
  <div class="pos-numpad grid grid-cols-3 gap-1.5 mt-2">
    <!-- Baris 1 -->
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('1')">1</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('2')">2</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('3')">3</button>

    <!-- Baris 2 -->
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('4')">4</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('5')">5</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('6')">6</button>

    <!-- Baris 3 -->
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('7')">7</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('8')">8</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('9')">9</button>

    <!-- Baris 4: Clear, 0, 00, Backspace -->
    <button type="button" class="pos-numpad-btn text-rose-500" :disabled="disabled" @click="handleClear">C</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('0')">0</button>
    <button type="button" class="pos-numpad-btn" :disabled="disabled" @click="handlePress('00')">00</button>

    <!-- Tombol Backspace (Mengambil 1 baris penuh di bawah) -->
    <button type="button" class="pos-numpad-btn col-span-3 bg-slate-100 text-slate-600" :disabled="disabled" @click="handleBackspace">
      <PosIcon name="delete" :size="18" />
    </button>
  </div>
</template>
