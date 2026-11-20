import { ref } from 'vue'

export function useMobileCalendar() {
  const currentDate = ref(new Date())
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0]!)
  const viewMode = ref<'month' | 'agenda'>('month')

  // Format tanggal helper
  const formatLocalDate = (date: Date): string => {
    return date.toISOString().split('T')[0]!
  }

  // Navigasi bulan berikutnya / sebelumnya
  const nextMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }

  const prevMonth = () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  }

  return {
    currentDate,
    selectedDate,
    viewMode,
    nextMonth,
    prevMonth,
    formatLocalDate,
  }
}
