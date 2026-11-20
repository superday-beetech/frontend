<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
import BaseOffcanvas from '@/shared/components/ui/overlay/BaseOffcanvas.vue'

const props = defineProps<{
  modelValue: string // Format Database: 'YYYY-MM-DD'
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

// State tanggal sementara (Draft) sebelum ditekan tombol Terapkan
const tempDate = ref(props.modelValue || toLocalISO(new Date()))
const activeDateObj = ref(new Date(tempDate.value))

// Sinkronisasi jika modelValue dari parent berubah
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      tempDate.value = newVal
      activeDateObj.value = new Date(newVal)
    }
  }
)

function toLocalISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Format tampilan cantik bahasa Indonesia untuk tombol pemicu
const formattedDisplay = computed(() => {
  if (!props.modelValue) return props.placeholder || 'Pilih Tanggal'
  const [y, m, d] = props.modelValue.split('-').map(Number)
  if (!y || !m || !d) return props.modelValue

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d))
})

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
const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const currentYear = new Date().getFullYear()
const yearsList = Array.from({ length: 15 }, (_, i) => currentYear - 7 + i)

// Matriks Kalender
const calendarCells = computed(() => {
  const year = activeDateObj.value.getFullYear()
  const month = activeDateObj.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startDayOfWeek = firstDayOfMonth.getDay()
  const totalDaysInMonth = lastDayOfMonth.getDate()

  const cells = []

  // Padding bulan lalu
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    cells.push({ date: toLocalISO(d), dayNumber: d.getDate(), isCurrentMonth: false })
  }

  // Hari bulan aktif
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day)
    cells.push({ date: toLocalISO(d), dayNumber: day, isCurrentMonth: true })
  }

  // Padding bulan depan
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day)
      cells.push({ date: toLocalISO(d), dayNumber: day, isCurrentMonth: false })
    }
  }

  return cells
})

const handleMonthChange = (e: Event) => {
  const mIndex = Number((e.target as HTMLSelectElement).value)
  activeDateObj.value = new Date(activeDateObj.value.getFullYear(), mIndex, 1)
}

const handleYearChange = (e: Event) => {
  const yNum = Number((e.target as HTMLSelectElement).value)
  activeDateObj.value = new Date(yNum, activeDateObj.value.getMonth(), 1)
}

const prevMonth = () => {
  activeDateObj.value = new Date(activeDateObj.value.getFullYear(), activeDateObj.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  activeDateObj.value = new Date(activeDateObj.value.getFullYear(), activeDateObj.value.getMonth() + 1, 1)
}

const selectGridDate = (iso: string) => {
  tempDate.value = iso
  activeDateObj.value = new Date(iso)
}

const confirmDate = () => {
  emit('update:modelValue', tempDate.value)
  isOpen.value = false
}

const setToday = () => {
  const todayISO = toLocalISO(new Date())
  tempDate.value = todayISO
  activeDateObj.value = new Date()
}
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
      {{ label }}
    </label>

    <!-- Tombol Input Pemicu Tunggal -->
    <button
      type="button"
      @click="isOpen = true"
      class="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 hover:border-primary-500 transition-all cursor-pointer shadow-2xs"
    >
      <div class="flex items-center gap-2.5">
        <CalendarIcon class="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
        <span>{{ formattedDisplay }}</span>
      </div>
      <span
        class="text-[10px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg"
      >
        Ubah Tanggal
      </span>
    </button>

    <!-- Dialog Bottom Sheet Modal -->
    <BaseOffcanvas v-model="isOpen" title="Pilih Tanggal" widthClass="max-w-md">
      <div class="space-y-5">
        <!-- Kartu Informasi Tanggal Terpilih -->
        <div
          class="rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/60 p-4 text-center space-y-1"
        >
          <div class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Tanggal Dipilih</div>
          <div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {{
              new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
                new Date(tempDate)
              )
            }}
          </div>
        </div>

        <!-- Selector Cepat Bulan & Tahun -->
        <div class="grid grid-cols-2 gap-2">
          <select
            :value="activeDateObj.getMonth()"
            @change="handleMonthChange"
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option v-for="(mName, idx) in monthNames" :key="mName" :value="idx">
              {{ mName }}
            </option>
          </select>

          <select
            :value="activeDateObj.getFullYear()"
            @change="handleYearChange"
            class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option v-for="yr in yearsList" :key="yr" :value="yr">
              {{ yr }}
            </option>
          </select>
        </div>

        <!-- Matriks Grid Kalender -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-2xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              {{ monthNames[activeDateObj.getMonth()] }} {{ activeDateObj.getFullYear() }}
            </span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="prevMonth"
                class="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="nextMonth"
                class="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div class="grid grid-cols-7 mb-1.5">
              <div v-for="d in dayNames" :key="d" class="text-center text-[10px] font-bold uppercase text-slate-400">
                {{ d }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="cell in calendarCells"
                :key="cell.date"
                type="button"
                @click="selectGridDate(cell.date)"
                class="h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
                :class="[
                  tempDate === cell.date
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 font-bold'
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

        <!-- Tombol Aksi Bawah -->
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="setToday"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            @click="confirmDate"
            class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary-600/25 hover:bg-primary-700 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Simpan Tanggal</span>
          </button>
        </div>
      </div>
    </BaseOffcanvas>
  </div>
</template>
