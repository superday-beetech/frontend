import { ref } from 'vue'

export interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

const toasts = ref<ToastItem[]>([])
let nextId = 1

export function useToast() {
  function show(type: ToastItem['type'], title: string, message?: string, duration = 3500) {
    const id = nextId++
    toasts.value.push({ id, type, title, message })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    remove,
    success: (title: string, msg?: string) => show('success', title, msg),
    error: (title: string, msg?: string) => show('error', title, msg, 5000),
    warning: (title: string, msg?: string) => show('warning', title, msg),
    info: (title: string, msg?: string) => show('info', title, msg),
  }
}
