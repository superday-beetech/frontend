<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string // Format Database: 'YYYY-MM-DD'
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// State internal
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const currentDate = ref(new Date())
const selectedDateISO = ref(props.modelValue || toLocalISO(new Date()))

// Sinkronisasi jika modelValue berubah dari parent
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      selectedDateISO.value = newVal
      currentDate.value = new Date(newVal)
    }
  }
)

// Helper format YYYY-MM-DD lokal
function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Format tampilan bahasa Indonesia untuk user
const formattedDisplay = computed(() => {
  if (!selectedDateISO.value) return props.placeholder || 'Pilih Tanggal'
  const [y, m, d] = selectedDateISO.value.split('-').map(Number)
  if (!y || !m || !d) return selectedDateISO.value

  const dateObj = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)
})

// Label bulan & hari
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const currentMonthLabel = computed(() => {
  return `${monthNames[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
})

// Generate matriks hari dalam bulan aktif
const calendarCells = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startDayOfWeek = firstDayOfMonth.getDay()
  const totalDaysInMonth = lastDayOfMonth.getDate()

  const cells = []

  // Padding hari bulan sebelumnya
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    cells.push({
      date: toLocalISO(d),
      dayNumber: d.getDate(),
      isCurrentMonth: false,
    })
  }

  // Hari bulan aktif
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day)
    cells.push({
      date: toLocalISO(d),
      dayNumber: day,
      isCurrentMonth: true,
    })
  }

  // Padding bulan berikutnya agar genap grid 7 kolom
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      cells.push({
        date: toLocalISO(d),
        dayNumber: day,
        isCurrentMonth: false,
      })
    }
  }

  return cells
})

// Navigasi bulan
const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// Pilih tanggal & tutup dropdown
const selectDate = (isoDate: string) => {
  selectedDateISO.value = isoDate
  emit('update:modelValue', isoDate) // Kirim format DB (YYYY-MM-DD)
  isOpen.value = false
}

// Pintasan tanggal cepat
const setQuickDate = (type: 'today' | 'tomorrow' | 'yesterday') => {
  const d = new Date()
  if (type === 'tomorrow') d.setDate(d.getDate() + 1)
  if (type === 'yesterday') d.setDate(d.getDate() - 1)
  selectDate(toLocalISO(d))
}

// Tutup kalender jika klik di luar komponen
const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative space-y-1.5">
    <label v-if="label" class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
      {{ label }}
    </label>

    <!-- Tombol Input Utama -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer shadow-2xs"
    >
      <div class="flex items-center gap-2.5">
        <CalendarIcon class="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
        <span>{{ formattedDisplay }}</span>
      </div>
      <span
        class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
      >
        {{ isOpen ? 'Tutup' : 'Pilih' }}
      </span>
    </button>

    <!-- Dropdown Kalender Custom (Muncul Persis di Bawah Input) -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl space-y-4"
      >
        <!-- Pintasan Cepat -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="setQuickDate('today')"
            class="flex-1 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 py-1.5 text-[11px] font-semibold text-primary-700 dark:text-primary-300 hover:bg-primary-100 cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            @click="setQuickDate('tomorrow')"
            class="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          >
            Besok
          </button>
        </div>

        <!-- Navigasi Bulan -->
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white">
            {{ currentMonthLabel }}
          </h4>
          <div class="flex items-center gap-1">
            <button
              type="button"
              @click.stop="prevMonth"
              class="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              @click.stop="nextMonth"
              class="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Grid Matrix Kalender (Touch-Friendly) -->
        <div>
          <div class="grid grid-cols-7 mb-1.5">
            <div v-for="day in dayNames" :key="day" class="text-center text-[10px] font-bold uppercase text-slate-400">
              {{ day }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="cell in calendarCells"
              :key="cell.date"
              type="button"
              @click.stop="selectDate(cell.date)"
              class="h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
              :class="[
                selectedDateISO === cell.date
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                  : cell.isCurrentMonth
                    ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50',
              ]"
            >
              {{ cell.dayNumber }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
