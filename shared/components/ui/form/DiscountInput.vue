<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { DiscountMode } from '@/shared/composables/useDiscount'

/**
 * Input diskon dengan mode persen (%) / rupiah (Rp).
 *
 * - Persen : angka desimal (maks 2 digit di belakang koma), 0–100. Titik atau koma dianggap desimal.
 * - Rupiah : bilangan bulat, otomatis diberi pemisah ribuan saat mengetik (caret tetap pada tempatnya).
 * - `base` (opsional): total kotor baris (harga × qty). Jika diisi:
 *     • diskon Rp dibatasi maksimal `base`
 *     • ganti mode mengonversi nilai (10% dari 50.000 → Rp 5.000, dan sebaliknya)
 *   Jika tidak diisi, ganti mode mereset nilai ke 0 supaya "5000" tidak berubah jadi 5000%.
 *
 * Shortcut di input: ↑/↓ = ±1% / ±1.000 (Shift = ×10), "%" = mode persen, "R" = mode rupiah.
 */
const props = withDefaults(
  defineProps<{
    modelValue: number
    mode?: DiscountMode
    base?: number
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    mode: 'percent',
    base: undefined,
    disabled: false,
    placeholder: '0',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
  'update:mode': [value: DiscountMode]
}>()

// ============================================
// KONSTANTA & HELPER
// ============================================
const PERCENT_DECIMALS = 2
const MENU_WIDTH = 144
const uid = Math.random().toString(36).slice(2, 8)

const modes: { value: DiscountMode; symbol: string; label: string }[] = [
  { value: 'percent', symbol: '%', label: 'Persen' },
  { value: 'amount', symbol: 'Rp', label: 'Rupiah' },
]

const idFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

const currentMode = computed(() => modes.find((m) => m.value === props.mode) ?? modes[0])

const maxValue = computed(() => {
  if (props.mode === 'percent') return 100
  return props.base !== undefined && props.base > 0 ? props.base : Infinity
})

/** Buang karakter tidak valid sesuai mode. */
function sanitize(raw: string, mode: DiscountMode): string {
  if (mode === 'amount') return raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')

  // Persen: digit + satu pemisah desimal (titik dan koma sama-sama dianggap koma)
  let s = raw.replace(/[^\d.,]/g, '').replace(/\./g, ',')
  const i = s.indexOf(',')
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, '')
    s = s.slice(0, i + 1 + PERCENT_DECIMALS)
  }
  return s.replace(/^0+(?=\d)/, '')
}

function parseText(text: string, mode: DiscountMode): number {
  const clean = sanitize(text, mode)
  if (!clean || clean === ',') return 0
  const n = Number(clean.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

/** Pastikan nilai valid: ≥ 0, ≤ batas, dibulatkan sesuai mode. */
function normalize(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0
  const v = Math.min(n, maxValue.value)
  return props.mode === 'percent' ? Math.round(v * 100) / 100 : Math.round(v)
}

function toDisplay(value: number): string {
  if (!value) return ''
  return props.mode === 'amount' ? idFormat.format(value) : String(value).replace('.', ',')
}

function isSignificant(ch: string, mode: DiscountMode): boolean {
  return mode === 'amount' ? /\d/.test(ch) : /[\d,.]/.test(ch)
}

/** Posisi caret baru setelah teks diformat ulang, berdasarkan jumlah karakter bermakna sebelum caret. */
function caretFor(str: string, sig: number, mode: DiscountMode): number {
  if (sig <= 0) return 0
  let count = 0
  for (let i = 0; i < str.length; i++) {
    if (isSignificant(str[i], mode)) {
      count++
      if (count === sig) return i + 1
    }
  }
  return str.length
}

// ============================================
// STATE INPUT
// ============================================
const inputRef = ref<HTMLInputElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLDivElement | null>(null)

const text = ref('')

// Sinkron dari parent (mis. reset keranjang), tanpa merusak teks yang sedang diketik ("5," tetap "5,")
watch(
  () => props.modelValue,
  (val) => {
    const v = Number(val) || 0
    if (parseText(text.value, props.mode) !== v) text.value = toDisplay(v)
  },
  { immediate: true }
)

// Ganti mode: selalu render ulang teks
watch(
  () => props.mode,
  () => {
    text.value = toDisplay(Number(props.modelValue) || 0)
  }
)

function commit(value: number) {
  emit('update:modelValue', value)
}

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const mode = props.mode
  const caret = el.selectionStart ?? el.value.length
  let sig = 0
  for (const ch of el.value.slice(0, caret)) if (isSignificant(ch, mode)) sig++

  const clean = sanitize(el.value, mode)
  const parsed = parseText(clean, mode)
  const value = normalize(parsed)
  const clamped = value !== parsed

  let next: string
  if (clamped) next = toDisplay(value)
  else if (mode === 'amount') next = clean ? idFormat.format(Number(clean)) : ''
  else next = clean

  text.value = next
  el.value = next // paksa sinkron DOM (karakter ilegal yang ditolak harus hilang)
  const pos = clamped ? next.length : caretFor(next, sig, mode)
  el.setSelectionRange(pos, pos)

  commit(value)
}

function onFocus(e: FocusEvent) {
  ;(e.target as HTMLInputElement).select()
}

function onBlur() {
  text.value = toDisplay(normalize(parseText(text.value, props.mode)))
}

function bump(direction: 1 | -1, multiplier: number) {
  const step = (props.mode === 'percent' ? 1 : 1000) * multiplier
  const next = normalize((Number(props.modelValue) || 0) + direction * step)
  text.value = toDisplay(next)
  commit(next)
}

function onInputKeydown(e: KeyboardEvent) {
  if (props.disabled || isOpen.value) return

  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
    bump(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey ? 10 : 1)
    return
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === '%') {
    e.preventDefault()
    changeMode('percent')
  } else if (e.key.toLowerCase() === 'r') {
    e.preventDefault()
    changeMode('amount')
  }
}

// ============================================
// GANTI MODE (dengan konversi)
// ============================================
function changeMode(next: DiscountMode) {
  if (next === props.mode) return

  const current = Number(props.modelValue) || 0
  const base = props.base
  let converted = 0

  if (base !== undefined && base > 0 && current > 0) {
    converted = next === 'amount' ? Math.round((base * current) / 100) : Math.round((current / base) * 100 * 100) / 100
  }

  // Mode dulu, baru nilai: nilai baru valid untuk mode baru
  emit('update:mode', next)
  commit(converted)
}

// ============================================
// DROPDOWN
// ============================================
const isOpen = ref(false)
const activeIndex = ref(0)
const menuStyle = ref<Record<string, string>>({})

function updatePosition() {
  if (!triggerRef.value) return
  const r = triggerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - r.bottom
  const openUp = spaceBelow < 120 && r.top > 120
  menuStyle.value = {
    position: 'fixed',
    left: `${Math.max(8, Math.min(r.left, window.innerWidth - MENU_WIDTH - 8))}px`,
    width: `${MENU_WIDTH}px`,
    ...(openUp ? { bottom: `${window.innerHeight - r.top + 4}px` } : { top: `${r.bottom + 4}px` }),
  }
}

function onDocMouseDown(e: MouseEvent) {
  const t = e.target as Node
  if (triggerRef.value?.contains(t) || menuRef.value?.contains(t)) return
  closeDropdown()
}

function detachListeners() {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
  document.removeEventListener('mousedown', onDocMouseDown)
}

watch(isOpen, async (open) => {
  if (!open) {
    detachListeners()
    return
  }
  activeIndex.value = Math.max(
    0,
    modes.findIndex((m) => m.value === props.mode)
  )
  await nextTick()
  if (!isOpen.value) return
  updatePosition()
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
  document.addEventListener('mousedown', onDocMouseDown)
})

watch(
  () => props.disabled,
  (d) => {
    if (d) closeDropdown()
  }
)

function openDropdown() {
  if (!props.disabled) isOpen.value = true
}

function closeDropdown() {
  isOpen.value = false
}

function toggleDropdown() {
  if (isOpen.value) closeDropdown()
  else openDropdown()
}

function selectMode(value: DiscountMode) {
  changeMode(value)
  closeDropdown()
  inputRef.value?.focus()
}

/**
 * Satu handler untuk seluruh komponen: fokus bisa berada di input ATAU trigger
 * (menu memakai mousedown.prevent sehingga fokus tidak berpindah).
 */
function onRootKeydown(e: KeyboardEvent) {
  if (props.disabled) return

  if (!isOpen.value) {
    if (e.target === triggerRef.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault()
      e.stopPropagation() // jangan ikut menutup mode edit di parent
      openDropdown()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = (activeIndex.value + 1) % modes.length
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = (activeIndex.value - 1 + modes.length) % modes.length
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      e.stopPropagation()
      selectMode(modes[activeIndex.value].value)
      break
    case 'Escape':
      e.preventDefault()
      e.stopPropagation() // Esc pertama hanya menutup menu
      closeDropdown()
      break
    case 'Tab':
      closeDropdown()
      break
  }
}

onBeforeUnmount(detachListeners)

defineExpose({
  focus: () => inputRef.value?.focus(),
  select: () => inputRef.value?.select(),
})
</script>

<template>
  <div
    class="group relative isolate flex w-full items-stretch overflow-visible rounded-md border border-slate-300 bg-white transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-slate-400 dark:hover:border-slate-600'"
    @keydown="onRootKeydown"
  >
    <!-- Trigger -->
    <button
      ref="triggerRef"
      type="button"
      :disabled="disabled"
      :title="`Mode diskon: ${currentMode.label} (ketik % atau R di kolom angka)`"
      :aria-label="`Mode diskon: ${currentMode.label}`"
      :aria-expanded="isOpen"
      :aria-controls="`discount-menu-${uid}`"
      aria-haspopup="listbox"
      class="flex shrink-0 items-center gap-0.5 border-r border-slate-200 bg-slate-50 py-1.5 pl-2 pr-1.5 text-xs font-bold text-slate-600 transition-all duration-150 hover:bg-slate-100 focus:outline-none focus-visible:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      :class="isOpen ? 'bg-slate-100 dark:bg-slate-700' : ''"
      @mousedown.prevent
      @click="toggleDropdown"
    >
      <span class="min-w-[1.25rem] text-center tabular-nums">{{ currentMode.symbol }}</span>
      <svg
        class="h-3 w-3 text-slate-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <!-- Input -->
    <input
      ref="inputRef"
      type="text"
      :inputmode="mode === 'percent' ? 'decimal' : 'numeric'"
      autocomplete="off"
      :value="text"
      :disabled="disabled"
      :placeholder="placeholder"
      :aria-label="`Nilai diskon (${currentMode.label})`"
      class="w-full min-w-0 flex-1 rounded-r-md border-0 bg-transparent px-3 py-1.5 text-right text-sm font-medium tabular-nums text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onInputKeydown"
    />
  </div>

  <!-- Teleport ke body: lepas total dari tabel -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="isOpen"
        :id="`discount-menu-${uid}`"
        ref="menuRef"
        role="listbox"
        :aria-activedescendant="`discount-opt-${uid}-${activeIndex}`"
        class="z-9999 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/20 ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/60"
        :style="menuStyle"
        @mousedown.prevent
      >
        <button
          v-for="(m, idx) in modes"
          :id="`discount-opt-${uid}-${idx}`"
          :key="m.value"
          type="button"
          role="option"
          tabindex="-1"
          :aria-selected="m.value === props.mode"
          class="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs transition-colors"
          :class="[
            m.value === props.mode
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60',
            idx === activeIndex ? 'ring-1 ring-inset ring-primary-500/30' : '',
          ]"
          @click="selectMode(m.value)"
          @mouseenter="activeIndex = idx"
        >
          <span class="flex items-baseline gap-1.5">
            <span class="w-4 font-semibold">{{ m.symbol }}</span>
            <span class="text-[10px] text-slate-400">{{ m.label }}</span>
          </span>
          <svg
            v-if="m.value === props.mode"
            class="h-3.5 w-3.5 text-primary-600 dark:text-primary-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
