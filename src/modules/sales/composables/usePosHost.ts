import type { Component } from 'vue'
import { useModal, type ModalSize } from '@/shared/composables/useModal'
import { useToast } from '@/shared/composables/useToast'

export function usePosHost() {
  const modal = useModal()
  const toast = useToast()

  function openOffCanvas(component: Component, options: { title: string; width?: string; props?: Record<string, unknown> }): void {
    // Fondasi baru menyediakan modal global; gunakan ukuran lebar untuk panel pengaturan POS.
    modal.open({ component, title: options.title, size: 'xl', centered: true, scrollable: true, props: options.props })
  }

  function openModal(component: Component, options: { title: string; size?: ModalSize | 'default'; props?: Record<string, unknown> }): void {
    modal.open({ component, title: options.title, size: options.size ?? 'md', centered: true, scrollable: true, props: options.props })
  }

  function closeModal(): void {
    modal.close()
  }

  function notify(type: 'success' | 'error' | 'info' | 'warning', text: string): void {
    toast[type](text)
  }

  function isOpen(): boolean {
    return modal.state.open
  }

  return { openOffCanvas, openModal, closeModal, notify, isOpen }
}
