<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Tag, Plus } from 'lucide-vue-next'
import type { CalendarEvent, CalendarDayCell } from '@/shared/types/calendar'

const props = withDefaults(
  defineProps<{
    events?: CalendarEvent[]
    initialDate?: string
  }>(),
  {
    events: () => [],
    initialDate: () => new Date().toISOString().split('T')[0]!,
  }
)

const emit = defineEmits<{
  'select-date': [date: string]
  'select-event': [event: CalendarEvent]
  'add-event': [date: string]
}>()

// State
const selectedDate = ref<string>(props.initialDate)
const currentMonthDate = ref<Date>(new Date(props.initialDate))

// Nama hari & bulan (Bahasa Indonesia)
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

// Helper format YYYY-MM-DD (menggunakan waktu lokal agar tidak bergeser zona waktu)
const toLocalISO = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const todayISO = toLocalISO(new Date())

// Judul Bulan & Tahun aktif
const currentMonthLabel = computed(() => {
  return `${monthNames[currentMonthDate.value.getMonth()]} ${currentMonthDate.value.getFullYear()}`
})

// Mapping warna kategori/tema event
const colorMap: Record<string, { dot: string; badge: string; border: string }> = {
  primary: {
    dot: 'bg-primary-500',
    badge: 'bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300',
    border: 'border-l-primary-500',
  },
  emerald: {
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    border: 'border-l-emerald-500',
  },
  amber: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    border: 'border-l-amber-500',
  },
  rose: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    border: 'border-l-rose-500',
  },
  indigo: {
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    border: 'border-l-indigo-500',
  },
}

const getTheme = (color?: string) => colorMap[color || 'primary'] || colorMap.primary

// Generate Grid 35/42 Hari untuk Bulan Aktif
const calendarCells = computed<CalendarDayCell[]>(() => {
  const year = currentMonthDate.value.getFullYear()
  const month = currentMonthDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startDayOfWeek = firstDayOfMonth.getDay() // 0 (Min) - 6 (Sab)
  const totalDaysInMonth = lastDayOfMonth.getDate()

  const cells: CalendarDayCell[] = []

  // Hari dari bulan sebelumnya (padding awal)
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    const iso = toLocalISO(d)
    cells.push({
      date: iso,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: iso === todayISO,
      isSelected: iso === selectedDate.value,
      events: props.events.filter((e) => e.startDate.startsWith(iso)),
    })
  }

  // Hari dalam bulan aktif
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day)
    const iso = toLocalISO(d)
    cells.push({
      date: iso,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: iso === todayISO,
      isSelected: iso === selectedDate.value,
      events: props.events.filter((e) => e.startDate.startsWith(iso)),
    })
  }

  // Hari dari bulan berikutnya (lengkapi kelipatan 7)
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      const iso = toLocalISO(d)
      cells.push({
        date: iso,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: iso === todayISO,
        isSelected: iso === selectedDate.value,
        events: props.events.filter((e) => e.startDate.startsWith(iso)),
      })
    }
  }

  return cells
})

// Daftar agenda khusus untuk tanggal yang dipilih
const selectedDayEvents = computed(() => {
  return props.events.filter((e) => e.startDate.startsWith(selectedDate.value))
})

// Label tanggal terpilih untuk header agenda
const formattedSelectedDate = computed(() => {
  const [y, m, d] = selectedDate.value.split('-').map(Number)
  const dateObj = new Date(y!, m! - 1, d!)
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)
})

// Navigasi Bulan & Pemilihan Tanggal
const prevMonth = () => {
  currentMonthDate.value = new Date(currentMonthDate.value.getFullYear(), currentMonthDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentMonthDate.value = new Date(currentMonthDate.value.getFullYear(), currentMonthDate.value.getMonth() + 1, 1)
}

const goToToday = () => {
  const now = new Date()
  currentMonthDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
  selectDate(todayISO)
}

const selectDate = (date: string) => {
  selectedDate.value = date
  emit('select-date', date)
}

// Dukungan Swipe Gesture untuk Mobile
const touchStartX = ref(0)
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0]?.screenX ?? 0
}
const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0]?.screenX ?? 0
  const diff = touchStartX.value - touchEndX
  if (Math.abs(diff) > 50) {
    diff > 0 ? nextMonth() : prevMonth()
  }
}
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-colors duration-300"
  >
    <!-- Header Kalender: Navigasi Bulan & Tombol Hari Ini -->
    <div class="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400"
        >
          <CalendarIcon class="w-4 h-4" />
        </div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">
          {{ currentMonthLabel }}
        </h3>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="goToToday"
          class="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Hari Ini
        </button>
        <button
          type="button"
          @click="prevMonth"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bulan Sebelumnya"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <button
          type="button"
          @click="nextMonth"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Bulan Berikutnya"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Month Matrix (Mendukung Swipe Kiri/Kanan di Mobile) -->
    <div class="p-3 sm:p-4 select-none" @touchstart.passive="handleTouchStart" @touchend.passive="handleTouchEnd">
      <!-- Label Nama Hari -->
      <div class="grid grid-cols-7 mb-1.5">
        <div
          v-for="day in dayNames"
          :key="day"
          class="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1"
        >
          {{ day }}
        </div>
      </div>

      <!-- Grid Tanggal (Touch Target Minimal 40x40px) -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="cell in calendarCells"
          :key="cell.date"
          type="button"
          @click="selectDate(cell.date)"
          class="relative flex flex-col items-center justify-center h-11 sm:h-12 rounded-xl text-xs font-medium transition-all cursor-pointer"
          :class="[
            cell.isSelected
              ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-600/25'
              : cell.isToday
                ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold ring-1 ring-primary-300 dark:ring-primary-800'
                : cell.isCurrentMonth
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40',
          ]"
        >
          <span>{{ cell.dayNumber }}</span>

          <!-- Indikator Titik Event (Maks 3 Titik agar Ringkas di Layar Kecil) -->
          <div v-if="cell.events.length > 0" class="flex items-center gap-0.5 mt-1">
            <span
              v-for="ev in cell.events.slice(0, 3)"
              :key="ev.id"
              class="h-1.5 w-1.5 rounded-full"
              :class="cell.isSelected ? 'bg-white' : getTheme(ev.colorTheme).dot"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- Daily Agenda View (Bagian Bawah untuk Rincian Jadwal Tanggal Terpilih) -->
    <div class="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Agenda Harian</div>
          <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            {{ formattedSelectedDate }}
          </h4>
        </div>

        <button
          type="button"
          @click="$emit('add-event', selectedDate)"
          class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition-colors cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      <!-- Daftar Event Harian -->
      <div v-if="selectedDayEvents.length > 0" class="space-y-2.5">
        <div
          v-for="event in selectedDayEvents"
          :key="event.id"
          @click="$emit('select-event', event)"
          class="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 border-l-4 bg-white dark:bg-slate-900 p-3 shadow-2xs hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
          :class="getTheme(event.colorTheme).border"
        >
          <div class="space-y-1 min-w-0">
            <div
              class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400"
            >
              {{ event.title }}
            </div>
            <p v-if="event.subtitle" class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {{ event.subtitle }}
            </p>
            <div class="flex items-center gap-3 pt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span v-if="event.startDate.includes('T')" class="inline-flex items-center gap-1">
                <Clock class="w-3 h-3" />
                {{ event.startDate.split('T')[1]?.slice(0, 5) }} WIB
              </span>
              <span
                v-if="event.category"
                class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold capitalize"
                :class="getTheme(event.colorTheme).badge"
              >
                <Tag class="w-2.5 h-2.5" />
                {{ event.category }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State jika Tidak Ada Agenda -->
      <div
        v-else
        class="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 py-6 text-center"
      >
        <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Tidak ada jadwal atau catatan pada tanggal ini.</p>
      </div>
    </div>
  </div>
</template>
