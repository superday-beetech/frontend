import { markRaw, reactive, type Component } from 'vue'

export interface ModalOptions {
  title: string
  component: Component
  props?: Record<string, unknown>
  size?: 'sm' | 'default' | 'md' | 'lg' | 'xl' | 'full' // <-- Tambahkan 'full'
  centered?: boolean
  scrollable?: boolean
  onSelect?: (value?: unknown) => void | Promise<void>
}

const state = reactive({
  open: false,
  title: '',
  component: null as Component | null,
  props: {} as Record<string, unknown>,
  maxWidth: 'md' as 'sm' | 'md' | 'lg' | 'xl' | 'full', // <-- Tambahkan 'full'
  centered: false, // <-- TAMBAHKAN INI
  scrollable: false, // <-- TAMBAHKAN INI
  onSelect: undefined as ModalOptions['onSelect'],
})

export function useModal() {
  function open(options: ModalOptions) {
    state.title = options.title
    state.component = markRaw(options.component)
    state.props = options.props ?? {}

    // Sederhanakan logika maxWidth
    if (options.size === 'full') state.maxWidth = 'full'
    else if (options.size === 'sm') state.maxWidth = 'sm'
    else if (options.size === 'lg') state.maxWidth = 'lg'
    else if (options.size === 'xl') state.maxWidth = 'xl'
    else state.maxWidth = 'md'

    state.centered = options.centered ?? false
    state.scrollable = options.scrollable ?? false
    state.onSelect = options.onSelect
    state.open = true
  }

  function close() {
    state.open = false
    state.component = null
    state.props = {}
    state.onSelect = undefined
    // Opsional: reset state lainnya
    state.title = ''
    state.centered = false
    state.scrollable = false
  }

  function handleSelect(value?: unknown) {
    void state.onSelect?.(value)
  }

  return { state, open, close, handleSelect }
}
