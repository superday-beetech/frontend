export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda'

export interface CalendarEvent {
  id: string | number
  title: string
  subtitle?: string
  startDate: string // Format ISO 'YYYY-MM-DD' atau datetime
  endDate?: string
  category?: 'shift' | 'transaction' | 'appointment' | 'maintenance'
  colorTheme?: 'primary' | 'emerald' | 'amber' | 'rose' | 'indigo'
  metadata?: Record<string, any> // Data tambahan misal ID kasir, nomor transaksi, dll
}

export interface CalendarDayCell {
  date: string // Format 'YYYY-MM-DD'
  dayNumber: number // 1 - 31
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
}

export interface MobileCalendarState {
  currentDate: Date // Tanggal acuan aktif saat ini
  viewMode: CalendarViewMode // 'day' atau 'month' sangat direkomendasikan untuk mobile
  selectedDate: string // Tanggal yang sedang disentuh/dipilih user
  activeFilters: string[] // Filter kategori event
}
