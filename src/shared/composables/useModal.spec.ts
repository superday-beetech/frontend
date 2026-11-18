import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useModal } from './useModal'

const TestModal = defineComponent({})

describe('useModal', () => {
  it('opens a component with the requested options', () => {
    const modal = useModal()

    modal.open({
      title: 'Tambah Produk',
      component: TestModal,
      props: { product: null },
      size: 'lg',
      centered: true,
      scrollable: true,
    })

    expect(modal.state.open).toBe(true)
    expect(modal.state.title).toBe('Tambah Produk')
    expect(modal.state.component).toBe(TestModal)
    expect(modal.state.props).toEqual({ product: null })
    expect(modal.state.maxWidth).toBe('lg')
    expect(modal.state.centered).toBe(true)
    expect(modal.state.scrollable).toBe(true)
  })

  it('runs the select callback with the emitted value', async () => {
    const modal = useModal()
    const onSelect = vi.fn()

    modal.open({ title: 'Detail', component: TestModal, onSelect })
    await modal.handleSelect({ id: 12 })

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith({ id: 12 })
  })

  it('clears modal state when closed', () => {
    const modal = useModal()

    modal.open({ title: 'Tambah', component: TestModal, props: { id: 1 } })
    modal.close()

    expect(modal.state.open).toBe(false)
    expect(modal.state.component).toBeNull()
    expect(modal.state.props).toEqual({})
    expect(modal.state.onSelect).toBeUndefined()
  })

  it('replaces the active modal without retaining the previous callback', async () => {
    const modal = useModal()
    const oldCallback = vi.fn()
    const newCallback = vi.fn()

    modal.open({ title: 'Detail', component: TestModal, onSelect: oldCallback })
    modal.open({ title: 'Edit', component: TestModal, onSelect: newCallback })
    await modal.handleSelect('saved')

    expect(oldCallback).not.toHaveBeenCalled()
    expect(newCallback).toHaveBeenCalledWith('saved')
    expect(modal.state.title).toBe('Edit')
  })
})
