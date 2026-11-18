import { markRaw, reactive, type Component } from 'vue'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalOptions {
  title: string
  component: Component
  props?: Record<string, unknown>
  size?: ModalSize | 'default'
  centered?: boolean
  scrollable?: boolean
  onSelect?: (value?: unknown) => void | Promise<void>
}

const state = reactive({
  open: false,
  title: '',
  component: null as Component | null,
  props: {} as Record<string, unknown>,
  maxWidth: 'md' as ModalSize,
  centered: true,
  scrollable: true,
  onSelect: undefined as ModalOptions['onSelect'],
  instance: 0,
})

export function useModal() {
  function open(options: ModalOptions) {
    state.instance += 1
    state.title = options.title
    state.component = markRaw(options.component)
    state.props = options.props ?? {}
    state.maxWidth = options.size === 'default' || !options.size ? 'md' : options.size
    state.centered = options.centered ?? true
    state.scrollable = options.scrollable ?? true
    state.onSelect = options.onSelect
    state.open = true
  }

  function close(instance = state.instance) {
    // Event close dari komponen modal lama tidak boleh menutup modal baru.
    if (instance !== state.instance) return
    state.open = false
    state.component = null
    state.props = {}
    state.onSelect = undefined
  }

  async function handleSelect(value?: unknown) {
    const callback = state.onSelect
    if (callback) await callback(value)
  }

  return { state, open, close, handleSelect }
}
