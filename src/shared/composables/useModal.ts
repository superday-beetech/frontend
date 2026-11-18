import { markRaw, reactive, shallowRef, type Component } from 'vue'

export interface ModalOptions {
  title: string
  component: Component
  props?: Record<string, unknown>
  size?: 'sm' | 'default' | 'md' | 'lg' | 'xl'
  centered?: boolean
  scrollable?: boolean
  onSelect?: (value?: unknown) => void | Promise<void>
}

const state = reactive({
  open: false,
  title: '',
  component: shallowRef<Component | null>(null),
  props: {} as Record<string, unknown>,
  maxWidth: 'md' as 'sm' | 'md' | 'lg' | 'xl',
  onSelect: undefined as ModalOptions['onSelect'],
})

export function useModal() {
  function open(options: ModalOptions) {
    state.title = options.title
    state.component = markRaw(options.component)
    state.props = options.props ?? {}
    state.maxWidth = options.size === 'sm' ? 'sm' : options.size === 'lg' ? 'lg' : options.size === 'xl' ? 'xl' : 'md'
    state.onSelect = options.onSelect
    state.open = true
  }

  function close() {
    state.open = false
    state.component = null
    state.props = {}
    state.onSelect = undefined
  }

  function handleSelect(value?: unknown) {
    void state.onSelect?.(value)
  }

  return { state, open, close, handleSelect }
}
